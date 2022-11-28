import BaseService from "./base/BaseService";
import express, { Response,Request } from "express";
import { GD } from "../GD";
import Errors from "../structures/Error";
import Auth from "./api/Auth";
import Bridge from "./api/Transactions";
import IAPIHandler from "./base/IAPIHandler";
import Helper from "../Helper";
import Transactions from "./api/Transactions";
import Clients from "./api/Clients";
import { IncomingHttpHeaders } from "http";
import cors from "cors"



interface HandlersVO{
    [key:string]:IAPIHandler
    auth:Auth,
    trx:Transactions,
    clients:Clients
}
class HTTPServer extends BaseService{

    private cfg:ConfigVO|null = null;

    private handlers:HandlersVO = {
        auth:new Auth(),
        trx:new Transactions(),
        clients:new Clients()
    }

    constructor(){
        super("HTTPServer")
        this.onServiceReady();
    }

    async onApplicationReady(){

        // create handlers
        for(let i in this.handlers){
           await this.handlers[i].init();
        }


        this.cfg = await GD.S_CONFIG_REQUEST.request();
        if(!this.cfg){
            console.error("Error, no config!")
            return;
        }
        const app = express();

        
        
        //attach public dir
        app.use(express.static(this.cfg.HTTP_PUBLIC_DIR))
        app.use(express.json()) // for parsing application/json
        app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
       
        const whitelist = [
            'http://localhost:3000',
            "https://crm.impaya.com"
        ];
        const corsOptions = {
            origin: (origin:any, callback:any)=>{
                console.log(origin)
                const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
                callback(null, originIsWhitelisted);
            },
            credentials: true
        };
        app.use(cors(corsOptions))


        // listen all on /
        app.all("/api/",async (req,res)=>{
            const tme = +new Date();

            
            if(req.method === "POST"){
                const b =  req.body
                this.handleRequest(req,res,b)
                return;
            }

            this.sendResponse(res,{
                error:Errors.ERROR_NO_CDATA,
                data:null
            },tme)
        })


        app.all("/api/:cdata",async (req,res)=>{
            this.handleRequest(req,res,req.params.cdata)
 
        })

        // final handler
        app.use((req, res, next)=>{
            const tme = +new Date();
            this.sendResponse(res,{
                error:Errors.ERROR_BAD_REQUEST,
                data:`global`
            },tme)
        });

        // start
        app.listen(this.cfg.HTTP_SERVICE_PORT,()=>{
            console.log("HTTP Service started on: "+this.cfg?.HTTP_SERVICE_PORT)
        })
    }

    handleRequest(req:Request,res:Response,cdata:string){
        const tme=+new Date();
        res.setTimeout(this.cfg?.HTTP_TIMEOUT ?? 1000*30,()=>{
            this.sendResponse(res,{
                error:Errors.ERROR_TIMEOUT,
                data:null
            },tme)
        });

        const packet = this.parsePacket(cdata)
        if(packet.error){
            this.sendResponse(res,{
                error:packet.error,
                data:packet.data
            },tme)
            return;
        }

        let ip = req.socket.remoteAddress;

        if("x-real-ip" in req.header){
            const tmp =(req.header as any)['x-real-ip'];
            if(tmp)
                ip=tmp
        }
        if(!ip){
            return this.sendResponse(res,{
                error:Errors.NO_IP,
                data:null
            },tme)
        }

        
        // route throught hadlres, sends response
        this.route(res,req.method.toLowerCase(),ip,packet,req.headers,tme)
    }

    async route(res:Response,httpMethod:string,ip:string,packet:TransferPacketVO,headers:IncomingHttpHeaders,tme:number){
        const request = packet.data as SimpleObjectVO;

            if(!("method" in request) || typeof request.method !== "string"){
                return {
                    error:Errors.NO_METHOD,
                    data:packet
                }
            }
            
            const tmp = request.method.split(".")
            let moduleName=tmp[0]?.replaceAll(/[^0-9a-zA-Z_]/gi,"")
            const method=tmp[1]?.replaceAll(/[^0-9a-zA-Z_]/gi,"");
            if(!moduleName || moduleName.length === 0 || !(moduleName in this.handlers)){   
                this.sendResponse(res, {
                    error:Errors.WRONG_METHOD,
                    data:null
                },tme)
                return;
            }
            moduleName=moduleName.toLowerCase();
            const module = this.handlers[moduleName];


            // check auth
            let authorizedUser:UserVO|null = null;
            if(packet.data.key){
                try{
                    authorizedUser = await this.handlers.auth.checkAuthKey(packet.data.key)
                }catch(e){
                    this.sendResponse(res,{
                        error:Errors.RUNTIME_ERROR,
                        data:`${e}`
                    },tme)
                    return;
                }
            }


            if(!authorizedUser && (module !== this.handlers.auth)){
                this.sendResponse(res,{
                    error:Errors.UNAUTHORIZED_ACCESS,
                    data:null
                },tme)
                return;
            }

            let response;
            
            try{
               response = await module.execute({
                    httpMethod:httpMethod,
                    encrypted:packet.encrypted ?? false,
                    method:method,
                    data:request.data,
                    ip:ip,
                    user:authorizedUser,
                    headers:headers
               })
            }catch(e){
                this.sendResponse(res,{
                    error:Errors.RUNTIME_ERROR,
                    data:`${e}`
                },tme)
                return;
            }
            
            if(!response){
                this.sendResponse(res,{
                    error:Errors.EMPTY_RESPONSE,
                    data:null
                },tme)
                return;
            }
            
            this.sendResponse(res,response,tme);
    }

    parsePacket(cdata:any):TransferPacketVO{


        let json = null;
        let encrypted=false;
        let packet = null
        if(typeof cdata === "string"){

        encrypted=true;
        packet = Helper.unpack("testing_key",cdata)
        if(packet?.indexOf("{")!==0)
            packet=null;
        
        if(!packet){
            encrypted=false;
            if(cdata.indexOf("{")===0){
                packet=cdata;
            }else{
                try{
                    packet=Buffer.from(cdata,"base64").toString("utf8");
                }catch(e){
                    return {
                        error:Errors.ERROR_BAD_REQUEST,
                        data:`${e}`,
                        encrypted:false
                    }
                }
            }
        }

       
        try{
            json = JSON.parse(packet)
        }catch(e){
            return {
                error:Errors.ERROR_BAD_REQUEST,
                data:`${e}`,
                encrypted:encrypted
            }
        }}else{
            if(typeof cdata === "object")
                json = cdata;
        }

        if(!json){
            return {
                error:Errors.EMPTY_REQUEST,
                data:packet,
                encrypted:encrypted
            }
        }

        return {
            error:null,
            data:json,
            encrypted:encrypted
        }

    }

    sendResponse(res:Response,data:TransferPacketVO,requestTime:number){
        //TODO: make logger, cut big packets
        data.responseTime = (+new Date()) - requestTime;
        if(res.destroyed || res.closed){
            console.error("Connection already closed, can't send response",data)
            return;
        }
        try{
            
            res.send(data);
        }catch(e){
            console.error("Can't send response! ",e)
        }
    }


}

export default HTTPServer;