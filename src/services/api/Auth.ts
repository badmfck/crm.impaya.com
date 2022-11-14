import IService from "../base/IService";
import IAPIHandler from "../base/IAPIHandler";
import BaseHandler from "./BaseHandler";
import Errors from "../../structures/Error";


class Auth extends BaseHandler{
    constructor(){
        super("Auth")
    }

    async init(){}
    async execute(packet: ExecutionParamsVO):Promise<TransferPacketVO>{

        return {
            error:null,
            data:packet.data
        }

        super.execute(packet)
       
    }

}

export default Auth;