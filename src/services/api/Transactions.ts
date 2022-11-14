import Errors from "../../structures/Error";
import IAPIHandler from "../base/IAPIHandler";
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
        return super.execute(packet)
    }
    
}
export default Transactions;