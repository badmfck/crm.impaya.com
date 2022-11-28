import HTTPServer from "./services/HTTPServer";
import IService from "./services/base/BaseService";
import { GD } from "./GD";
import Config from "./services/Config";
import Helper from "./Helper";
import MySQL from "./services/Mysql";
import Packer from "./utils/Packer";
import EventService from "./services/EventService";

import fs from "fs"


class Main {
  
    constructor(){ this.init() }

    private async init(){
        await this.initializeServices();
        GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED")


    
        let rawdata = fs.readFileSync('data/merchants.json');
        let data = JSON.parse(rawdata.toString("utf-8"));
        let q= "INSERT INTO `merchants` (`id`,`name`,`client_id`) VALUES";
        let z = 0;
        for(let i of data){
            if(z>0)
            q+=", ";
            q+=' ("'+i.id+'","'+i.name.replaceAll('"','\\"')+'","'+i.client_id+'") '
            z++;
        }
        fs.writeFileSync("data/client_q.txt",q)
    }

    private async initializeServices():Promise<void>{
        return new Promise((resolve,reject)=>{
            let i=0;
            let services:(typeof IService)[]=[
                Config,
                HTTPServer,
                MySQL,
                EventService
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