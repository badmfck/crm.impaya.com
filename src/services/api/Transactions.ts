
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

        const mysql = await GD.S_REQ_MYSQL_SELECT.request({
            query:"SELECT * FROM trx_11 LIMIT 100",
            fields:{}
        })

        if(mysql.err){
            return {
                error:Errors.DB_ERR,
                data:null
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
        
        const fields =[
            {
                name:"ctime",
                value:"!@FROM_UNIXTIME("+(trx.timestamp ?? 0)+")"
            },
            {
                name:"data",
                value:trx.branch+", "+packet.user?.login+"@"+packet.ip+", trx."+packet.method
            }
        ]

        for(let i in trx.transaction){
            if(i === "ut_created" || i === "ut_updated"){
                fields.push({
                    name:i,
                    value:"!@FROM_UNIXTIME("+(trx.transaction as any)[i]+")"
                })
            }else{
                fields.push({
                    name:i,
                    value:(trx.transaction as any)[i]
                })
            }
        }
        
        //TODO: TABLE PREFIX MUST BE AS TRANSACTION UPDATE TIME!!!

        const result = await GD.S_REQ_MYSQL_INSERT_QUERY.request(
            {
                table:"trx_"+Helper.dateFormatter.format(new Date(),"%m"),
                fields:fields,
                onUpdate:[
                    {
                        name:"status_id",
                        value:trx.transaction.status_id  
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