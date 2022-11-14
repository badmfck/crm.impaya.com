import HTTPServer from "./services/HTTPServer";
import IService from "./services/base/BaseService";
import { GD } from "./GD";
import Config from "./services/Config";
import Helper from "./Helper";


class Main {
  
    constructor(){ this.init() }

    private async init(){
        await this.initializeServices();

        
        GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED")

        const a= JSON.stringify({
            method:"trx.add",
            data:{
                login:"text",
                passwd:"123",
                key:"привет медвед"
            }
        })

        const packed=Helper.pack("testing_key",a)
        console.log(packed,packed.length)
        console.log(Helper.unpack("testing_key",packed));

        console.log(">> ",Buffer.from(a).toString("base64"));
        console.log(a,a.length);
        
        
    }

    private async initializeServices():Promise<void>{
        return new Promise((resolve,reject)=>{
            let i=0;
            let services:(typeof IService)[]=[
                Config,
                HTTPServer
            ]

            GD.S_SERVICE_READY.add(name=>{
                console.log("Service "+name+" is ready")
                i++;
                if(i === services.length){
                    resolve();
                }
            })

            for(let i of services){
                new i();
            }
        })
    }
}

new Main();