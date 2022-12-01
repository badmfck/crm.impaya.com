import { GD } from "../../GD";
import Helper from "../../Helper";
import Errors from "../../structures/Error";
import BaseHandler from "./BaseHandler";


class Balance extends BaseHandler{
    config:ConfigVO|null = null;
   
    constructor(){
        super("Balance")
    }
    async init (){
        this.config = await GD.S_CONFIG_REQUEST.request();
    }

    async execute(packet: ExecutionParamsVO):Promise<TransferPacketVO>{
        switch(packet.method){
            case "getDayBalance":
            return this.getDayBalance(packet);
        }
        return super.execute(packet);
    }

    async getDayBalance(packet: ExecutionParamsVO):Promise<TransferPacketVO>{


        // LOADING DATA FROM MYSQL
        // TODO: CACHE AND STORE DATA FOR PAST DAYS IN MEMORY

        let dateTime = (packet.data as SimpleObjectVO).day;
        if(!dateTime || dateTime<1)
            dateTime = +new Date();

        //get from stored values

            
        const month = Helper.dateFormatter.format(dateTime,"%m");
        const from = Helper.dateFormatter.format(dateTime,"%y-%m-%d 00:00:00");
        const to = Helper.dateFormatter.format(dateTime,"%y-%m-%d 23:59:59");
        const where ="WHERE ut_updated >=\""+from+"\" AND ut_updated <=\""+to+"\""
          
       
        const currencies =await GD.S_REQ_MYSQL_QUERY.request({
            query:"SELECT DISTINCT(`currency`) as `currency`  FROM `trx_"+month+"` "+where,
            fields:{}
        })

        if(currencies.err){
            return {
                error:Errors.DB_ERR,
                data:null
            }
        }
        

      
      

        if(!currencies.data || !Array.isArray(currencies.data)){
            return {
                error:Errors.DB_ERR,
                data:null
            }
        }

        if(currencies.data.length<1){
            return{
                error:null,
                data:[]
            }
        }

        const transaction =await GD.S_REQ_MYSQL_QUERY.request({
            query:"SELECT COUNT(`id`) as `trx`  FROM `trx_"+month+"` "+where,
            fields:{}
        })

        if(transaction.err){
            return {
                error:Errors.DB_ERR,
                data:null
            }
        }

        const queries:MySQLQueryVO[]=[]
        const maxrQueries:MySQLQueryVO[] = [];
        for(let i of currencies.data){
            const w =where + " AND `currency`=\""+i.currency+"\"";
            queries.push({
                query:"SELECT SUM(`amount`) as `a` FROM `trx_"+month+"` "+w,
                fields:{}
            })

            maxrQueries.push({
                query:"SELECT MAX(`rate`) as `r` FROM `trx_"+month+"` "+w,
                fields:{}
            })

        }

        // GET AMOUNTS
        const amounts = await GD.S_REQ_MYSQL_QUERY.request(queries)
        if(amounts.err){
            return {
                error:Errors.DB_ERR,
                data:null
            }
        }

        // GET RATES
        let rates
        if(maxrQueries.length>0){
            rates = await GD.S_REQ_MYSQL_QUERY.request(maxrQueries)
            if(rates.err){
                return {
                    error:Errors.DB_ERR,
                    data:null
                }
            }
        }

        if(!rates){
            return {
                error:Errors.BALANCE_NO_RATES,
                data:null
            }
        }

        const amountFinal = [];
        for(let i of amounts.data){
            amountFinal.push(Array.isArray(i)?i[0]:i)
        }
        const ratesFinal = [];
        for(let i of rates.data){
            ratesFinal.push(Array.isArray(i)?i[0]:i)
        }
       
        for(let i of amountFinal){
            for(let j of ratesFinal){
                if(j.currency === i.currency){
                    i.rate = j.rate;
                    break;
                }
            }
        }



        
        const today = new Date();
        const theday = Helper.dateFormatter.getDate(dateTime);
        if((today.getFullYear()!== theday.getFullYear()) || (Helper.dateFormatter.getDayOfYear(today) !=  Helper.dateFormatter.getDayOfYear(theday))){
  
                // not today
                GD.S_REQ_MYSQL_INSERT_QUERY.request({
                    table:"stat_revenue",
                    fields:[
                        {name:"type",value:"daily"},
                        {name:"value",value:JSON.stringify(amountFinal)},
                        {name:"date",value:Helper.dateFormatter.format(theday,"%y-%m-%d")}
                    ],
                    onUpdate:[
                        {name:"value",value:JSON.stringify(amountFinal).replaceAll('"','\\"')},
                    ]
                })
            
        }
       
        return {
            error:null,
            data:amountFinal
        }
    }
}
export default Balance;