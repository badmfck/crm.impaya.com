import { GD } from "../GD";
import BaseService from "./base/BaseService";

export interface ConfigVO{
    HTTP_SERVICE_PORT:number
    HTTP_PUBLIC_DIR:string
    HTTP_TIMEOUT:number
}

class Config extends BaseService{
    
    data:ConfigVO={
        HTTP_SERVICE_PORT:8080,
        HTTP_PUBLIC_DIR:"public",
        HTTP_TIMEOUT:1000*30
    }

    constructor(){
        super("Config")
        GD.S_CONFIG_REQUEST.listener=(a,b)=>b(this.data)
        this.onServiceReady();

    }
}
export default Config;