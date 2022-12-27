import HTTPServer from "./services/HTTPServer";
import IService from "./services/base/BaseService";
import { GD } from "./GD";
import Config from "./services/Config";
import Helper from "./Helper";
import MySQL from "./services/Mysql";
import Packer from "./utils/Packer";
import EventService from "./services/EventService";

import fs from "fs"
import Rates from "./services/Rates";


class Main {
  
    constructor(){ this.init() }

    private async init(){
        process.env.TZ = "Europe/Riga"
        await this.initializeServices();
        GD.S_APP_READY.invoke();

        //const buff = fs.readFileSync("data/psystems.json")

       // const arr =JSON.parse(buff.toString("utf-8"))

        /*
        const query:MySQLInsertQueryVO[]= [];
        for(let j in arr as any){
            const i = (arr as any)[j]
            query.push({
                table:"currencies_list",
                fields:[
                    {name:"code",value:i.code},
                    {name:"name",value:i.name},
                    {name:"decimal",value:i.decimal_digits+""},
                    {name:"rounding",value:i.rounding+""}
                ]
            })
        }

       const r = await GD.S_REQ_MYSQL_INSERT_QUERY.request(query)
       console.log(r)*/
      

        console.log("APP LAUNCHED")
    }

    private async initializeServices():Promise<void>{
        return new Promise((resolve,reject)=>{
            let i=0;
            let services:(typeof IService)[]=[
                Config,
                HTTPServer,
                MySQL,
                EventService,
                Rates
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