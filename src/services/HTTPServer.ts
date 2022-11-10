import BaseService from "./BaseService";
import express from "express";
import { GD } from "../GD";
import { ConfigVO } from "./Config";

class HTTPServer extends BaseService{
    private cfg:ConfigVO|null = null;

    constructor(){
        super("HTTPServer")
        this.onServiceReady();
    }
    async onApplicationReady(){
        this.cfg = await GD.S_CONFIG_REQUEST.request();
        const app = express();
        
        app.all("/",(req,resp)=>{
            resp.send("OK")
        });

        // start
        app.listen(this.cfg.HTTP_SERVICE_PORT,()=>{
            console.log("HTTP Service started on: "+this.cfg?.HTTP_SERVICE_PORT)
        })
    }
}

export default HTTPServer;