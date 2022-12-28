import { GD } from "../../GD";
import Errors from "../../structures/Error";
import ConcurencyLoader from "../../utils/ConcurencyLoader";
import BaseHandler from "./BaseHandler";

class Payservice extends BaseHandler{

    payservicesNames:ConcurencyLoader<{name:string,id:number}[]> = new ConcurencyLoader()
    
    constructor(){
        super("payservice")

        // loading 
        this.payservicesNames.setLoadingProcedure=async ()=>{
            const sql = await GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `pay_services_types` @NOLIMIT",
                fields:{}
            })
            let result = null;
            let err = null;
            if(sql && sql.data && Array.isArray(sql.data)){
                result = sql.data;
            }else{
                err=Errors.PAYSERVICES_CANT_LOAD
                console.error(sql.err)
            }

            return {error:err,data:result}
        }
        GD.S_PAY_SERVICES_GET_TYPES.listener = (data,cb)=>{
            this.payservicesNames.load(cb)
        }
    }

    execute(packet: ExecutionParamsVO): Promise<TransferPacketVO<any>> {
        switch(packet.method){
            case "getNames":
            return this.getNames(packet)
        }
        return super.execute(packet);
    }

    async getNames(packet:ExecutionParamsVO):Promise<TransferPacketVO<any>>{
        return await GD.S_PAY_SERVICES_GET_TYPES.request();
    }

}
export default Payservice;