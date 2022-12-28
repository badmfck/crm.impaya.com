import Errors from "../../structures/Error";
import IAPIHandler from "../base/IAPIHandler";

class BaseHandler implements IAPIHandler{
    name:string="BaseHandler"
    constructor(name:string){
        this.name=name
    }
    async init (){}
    async execute(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{
        return {
            error:Errors.NO_METHOD_IMPLEMENTATION,
            data:this.name+"."+packet.method
        }
    }
}
export default BaseHandler;