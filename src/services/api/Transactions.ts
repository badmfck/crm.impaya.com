
import { GD } from "../../GD";
import Helper from "../../Helper";
import Errors from "../../structures/Error";
import BaseHandler from "./BaseHandler";

class Transactions extends BaseHandler{

    config:ConfigVO|null = null;

    constructor(){
        super("Transaxtions (trx)")
    }

    async init (){
        this.config = await GD.S_CONFIG_REQUEST.request();
    }

    async execute(packet: ExecutionParamsVO):Promise<TransferPacketVO>{

        switch(packet.method){
            case "add":
            return this.add(packet);
            case "request":
            return this.request(packet);
        }
        return super.execute(packet);
    }

    async request(packet:ExecutionParamsVO):Promise<TransferPacketVO>{

        // TODO: CHECK ROLES

        let dateTime = (packet.data as SimpleObjectVO).day;
        if(!dateTime || dateTime<1)
            dateTime = +new Date();
        const month = Helper.dateFormatter.format(dateTime,"%m");

        //TODO: get from stored values

        const mysql = await GD.S_REQ_MYSQL_SELECT.request({
            query:"SELECT * FROM trx_"+month+" ORDER BY `ut_updated` DESC LIMIT 100",
            fields:{}
        })

        if(mysql.err){
            return {
                error:Errors.DB_ERR,
                data:null
            }
        }

        if(!Array.isArray(mysql.data) || mysql.data.length<1){
            return {error:null,data:[]}
        }

        const clientsData = await GD.S_CLIENTS_REQUEST.request();

        const solutionsData = await GD.S_SOLUTIONS_REQUEST.request();
        
        for(let i of mysql.data){
            const t:TransactionVO = i;
            if(!clientsData.err){
                i.merchant = clientsData.merchants.get(i.merchant_id)
                if(!i.merchant){
                    i.merchant ={
                        id:i.merchant_id,
                        name:"Unknown_"+i.merchant_id,
                        client_id:-1,
                        client:{
                            id:-1,
                            name:"Unknown?"
                        }

                    }
                }
            }
            if(!solutionsData.err && solutionsData.solutuions){
                i.solution = solutionsData.solutuions.get(i.psys_alias)
            }
        }

        return {error:null,data:mysql.data}
    }


    async add(packet: ExecutionParamsVO):Promise<TransferPacketVO>{
        if(packet.httpMethod!=="post"){
            return {
                error:Errors.WRONG_HTTP_METHOD,
                data:null
            }
        }

        if(!packet.user || packet.user.uid !== this.config?.IMPAYA_SERVER_USER_UID){
            return {
                error:Errors.WRONG_SERVER_USER,
                data:null
            }
        }

        const trx:TRXAddPacketVO=this.createTransactionVO(packet.data as any);
        if(!trx.branch || trx.branch !== "impaya"){
            return {
                error:Errors.TRX_WRONG_BRANCH,
                data:null
            }
        }

        if(!trx.transaction || !trx.transaction.status_id){
            return {
                error:Errors.TRX_NO_TRANSACTION_STATUS,
                data:null
            }
        }

        //TODO: validate transaction fields
        
        const fields =[
            {
                name:"ctime",
                value:"FROM_UNIXTIME("+(trx.timestamp ?? 0)+")",
                system:true
            },
            {
                name:"owner",
                value:packet.user.uid
            }
        ]

        let monthTimestamp = +new Date();
        let createdTimestamp = 0;
        for(let i in trx.transaction){
            if(i === "ut_created" || i === "ut_updated"){
                fields.push({
                    name:i,
                    value:"FROM_UNIXTIME("+(trx.transaction as any)[i]+")",
                    system:true
                })

                if(i === "ut_created")
                    createdTimestamp=parseInt((trx.transaction as any)[i])

            }else{
                fields.push({
                    name:i,
                    value:(trx.transaction as any)[i]
                })
            }
            if(i === this.config.MAJOR_DB_DATE_FIELD)
                monthTimestamp = parseInt((trx.transaction as any)[i])
        }

        // FIX ut_updated 
        
        //TODO: TABLE PREFIX MUST BE AS TRANSACTION UPDATE TIME!!!

        let month = Helper.dateFormatter.format(monthTimestamp,"%m")
        const cM = Helper.dateFormatter.format(createdTimestamp,"%m");
        if(cM!==month){
            console.log("Month is different then created time month, using created time")
            month = cM
        }


        const result = await GD.S_REQ_MYSQL_INSERT_QUERY.request(
            {
                table:"trx_"+month,
                fields:fields,
                onUpdate:[
                    {
                        name:"status_id",
                        value:trx.transaction.status_id  
                    },
                    {
                        name:"ut_updated",
                        value:"FROM_UNIXTIME("+trx.transaction.ut_updated+")",
                        system:true
                        
                    }
                    ,
                    {
                        name:"update_cnt",
                        value:"`update_cnt`+1",
                        system:true
                    }
                    ,
                    {
                        name:"rate",
                        value:trx.transaction.rate 
                    }
                    ,
                    {
                        name:"psys_alias",
                        value:trx.transaction.psys_alias 
                    }
                    ,
                    {
                        name:"ref_transaction_id",
                        value:trx.transaction.ref_transaction_id 
                    }
                
                
                ]
            }
        )

        let status="packet_saved"
        let success=true;
        let reason=null;

        if(result.err){
            // Can't add trx id,
            reason = `${result.err}`
            console.error(reason)
            success=false;
            status="can't store packet";
            console.error("Can't add trx ID")
        }

        return {
            error:null,
            data:{
                success:success,
                status:status,
                reason:reason
            }
        }
    }

    createTransactionVO(packet:any):TRXAddPacketVO{
        return {
            branch:packet.branch,
            timestamp:packet.timestamp,
            transaction:packet.transaction
        }
    }
    
}
export default Transactions;