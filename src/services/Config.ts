import { GD } from "../GD";
import BaseService from "./base/BaseService";

export interface ConfigVO{
    HTTP_SERVICE_PORT:number
    HTTP_PUBLIC_DIR:string
    HTTP_TIMEOUT:number

    SQL_HOST:string
    SQL_PORT?:number
    SQL_USER:string
    SQL_PASSWD:string
    SQL_MAX_CONNECTIONS:number
}

class Config extends BaseService{
    /*
     127.0.0.1:8888
    */
    data:ConfigVO={
        HTTP_SERVICE_PORT:8080,
        HTTP_PUBLIC_DIR:"public",
        HTTP_TIMEOUT:1000*30,
        SQL_HOST:"127.0.0.1",
        SQL_PORT:3306,
        SQL_USER:"crm",
        SQL_PASSWD:"{crm_iMpaya71)",
        SQL_MAX_CONNECTIONS:10
    }

    constructor(){
        super("Config")
        GD.S_CONFIG_REQUEST.listener=(a,b)=>b(this.data)
        this.onServiceReady();

    }
}
export default Config;