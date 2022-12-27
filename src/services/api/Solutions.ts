import { GD } from "../../GD";
import Errors from "../../structures/Error";
import Signal from "../../utils/Signal";
import BaseHandler from "./BaseHandler";

class Solutions extends BaseHandler{
    
    solutions:Map<string,SolutionVO>|null=null; // alias
    loading=false;
    onDataLoaded:Signal<ErrorVO|null>=new Signal();
    lastUpdated=0;
    updateCacheTime = 1000*60*60*24*15; // 15 days 

    constructor(){
        super("Solutions")
        GD.S_SOLUTIONS_REQUEST.listener=(data,cb)=>{
           this.loadSolutions((err:ErrorVO|null)=>{
                cb({solutuions:this.solutions,err:err})
           });
        }
    }

    execute(packet: ExecutionParamsVO): Promise<TransferPacketVO> {
        switch(packet.method){
            case "get":
            return this.get(packet)
            case "update":
            return this.update(packet)
        }
        return super.execute(packet);
    }

    async update(packet: ExecutionParamsVO): Promise<TransferPacketVO> {
       // const sol:SolutionVO = packet.data as SolutionVO;
        return {
            error:null,
            data:Array.from(this.solutions?.values() ?? [])
        }
    }

    async get(packet: ExecutionParamsVO): Promise<TransferPacketVO> {

        const data = await GD.S_SOLUTIONS_REQUEST.request();

        if(data.err){
            return {
                error:data.err,
                data:null
            }
        }

        return {
            error:null,
            data:Array.from(this.solutions?.values() ?? [])
        }

    }


    async loadSolutions(cb:(err:ErrorVO|null)=>void){

        if(this.solutions && this.solutions.size>0){
            if(+new Date() - this.lastUpdated<this.updateCacheTime){
                cb(null);
                return;
            }
        }

        this.onDataLoaded.add(cb)
        if(this.loading)
            return;
        
        this.loading=true;

        let err=null;
   
        // Request clients
        const sols = await GD.S_REQ_MYSQL_SELECT.request({
            query: "SELECT * FROM `solutions` @NOLIMIT",
            fields:{}
        })

        if(sols && sols.data && Array.isArray(sols.data)){
            this.solutions = new Map();
            for(let i of sols.data)
                this.solutions.set(i.alias,i);
        }else{
            err=Errors.SOLUTIONS_CANT_LOAD
            console.error(sols.err)
        }
        

        this.lastUpdated = +new Date();
        this.loading = false;
        this.onDataLoaded.invoke(err);
        this.onDataLoaded.clear();
    }
}

export default Solutions;