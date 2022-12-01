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
        process.env.TZ = "Europe/Riga"
        await this.initializeServices();
        GD.S_APP_READY.invoke();

        const buff = fs.readFileSync("data/psystems.json")

        const arr =JSON.parse(buff.toString("utf-8"))
        
        
       /* const query:MySQLInsertQueryVO[]= [];
        for(let i of arr){
            query.push({
                table:"solutions",
                fields:[
                    {name:"id",value:parseInt(i.id)},
                    {name:"alias",value:i.alias},
                    {name:"title",value:i.title},
                    {name:"description",value:i.title_orig}
                ]
            })
        }

        GD.S_REQ_MYSQL_INSERT_QUERY.request(query)*/
      

        console.log("APP LAUNCHED")
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