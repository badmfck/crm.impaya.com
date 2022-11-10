import HTTPServer from "./services/HTTPServer";
import IService from "./services/BaseService";
import BaseService from "./services/BaseService";
import { GD } from "./GD";
import Config from "./services/Config";

class Main {
  
    constructor(){ this.init() }

    private async init(){
        await this.initializeServices();

        
        GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED")
    }

    private async initializeServices():Promise<void>{
        return new Promise((resolve,reject)=>{
            let i=0;
            let services:(typeof IService)[]=[
                Config,
                HTTPServer
            ]

            GD.S_SERVICE_READY.add(name=>{
                console.log("Service: "+name+" ready")
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