import { GD } from "../GD";
import BaseService from "./BaseService";

export interface ConfigVO{
    HTTP_SERVICE_PORT:number
}

class Config extends BaseService{
    
    data:ConfigVO={
        HTTP_SERVICE_PORT:8080
    }

    constructor(){
        super("Config")
        GD.S_CONFIG_REQUEST.listener=(a,b)=>b(this.data)
        this.onServiceReady();

    }
}
export default Config;