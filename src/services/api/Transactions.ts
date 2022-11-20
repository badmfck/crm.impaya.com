
import { GD } from "../../GD";
import Helper from "../../Helper";
import Errors from "../../structures/Error";
import BaseHandler from "./BaseHandler";

class Transactions extends BaseHandler{
    constructor(){
        super("Transaxtions (trx)")
    }
    async init (){}

    async execute(packet: ExecutionParamsVO):Promise<TransferPacketVO>{

        switch(packet.method){
            case "add":
            return this.add(packet);
        }
        return super.execute(packet);
    }


    async add(packet: ExecutionParamsVO):Promise<TransferPacketVO>{
        if(packet.httpMethod!=="post"){
            return {
                error:Errors.WRONG_HTTP_METHOD,
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

        /*const token =JSON.parse(Helper.unpack("iNt3rna1_k3Y",request.token) ?? "");
        if(!token || token.secret !== "aW1wYXlhX3NlcnZlcl90b2tlbg"){
            return {
                error:Errors.WRONG_BRANCH,
                data:null
            }
        }*/

        //TODO: check timestamp, if incorrect - WRONG_TOKEN

        // PROTECT OVER INJECTION
        const trxdata = (typeof trx.transaction ==="string") ? trx.transaction : JSON.stringify(trx.transaction)

        const result = await GD.S_REQ_MYSQL_INSERT_QUERY.request(
            {
                table:"trx_"+Helper.dateFormatter.format(new Date(),"%m"),
                fields:[
                    {
                        name:"data",
                        value:trxdata
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