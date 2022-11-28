import { GD } from "../GD";
import BaseService from "./base/BaseService";



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
        SQL_MAX_CONNECTIONS:10,

        IMPAYA_SERVER_USER_UID:"NBcaU1GMlI5vUWw"
    }

    constructor(){
        super("Config")
        GD.S_CONFIG_REQUEST.listener=(a,b)=>b(this.data)
        this.onServiceReady();

    }
}
export default Config;