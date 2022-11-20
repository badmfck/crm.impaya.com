import { GD } from "../GD";
import Helper from "../Helper";
import BaseService from "./base/BaseService";

class EventService extends BaseService{
    events:{event:EventPacketVO,id:string}[]=[];
    sending=false;
    sendRequest=false;
    timeoutID:NodeJS.Timeout|null=null;
    
    constructor(){
        super("EventService")
        GD.S_EVENT_ADD.add((event:EventPacketVO)=>{
            this.storeEvent(event);
        });
        this.onServiceReady()
    }

    storeEvent(event:EventPacketVO){
        this.events.push({event:event,id:+new Date()+"_"+Math.random()*100000})
        if(this.timeoutID)
            clearTimeout(this.timeoutID)
        this.timeoutID = setTimeout(()=>{this.sendEvents()},1000);
    }

    async sendEvents(){
        if(this.sending){
            this.sendRequest=true;
            return;
        }
        this.sending=true;
        this.sendRequest = false;
        const fullQueries=[]
        let queries=[];
        //TODO create month
        const month =Helper.dateFormatter.format(new Date(),"%m");
        for(let i of this.events){
            const evt = i.event
            const query:MySQLInsertQueryVO = {
                table:"events_"+month,
                fields:[
                    {name:"action",value:evt.action},
                    {name:"user_uid",value:evt.user_uid},
                    {name:"data",value:evt.data},
                    {name:"source",value:evt.source},
                    {name:"etime",value:`${evt.etime}`}
                ]
            } 
            queries.push({query:query,id:i.id});
            if(queries.length>100){
                fullQueries.push(queries);
                queries=[]
            }
        }

        if(queries.length!==0)
            fullQueries.push(queries)
        
        for(let i of fullQueries){
            if(!i || !Array.isArray(i))
                continue;

            const q=[]
            for(let j of i){
                q.push(j.query)
            }
            const res = await GD.S_REQ_MYSQL_INSERT_QUERY.request(q)
            if(res.err){
                console.error(res.err)
                continue;
            }

            // no errors
            for(let j of i){
                // remove from events
                for(let z=0;z<this.events.length;z++){
                    if(this.events[z].id === j.id){
                        this.events.splice(z,1)
                        break
                    }
                }
            }

        }
        this.sending=false;
        if(this.sendRequest){
            this.sendEvents();
        }
       
    }
}

export default EventService;