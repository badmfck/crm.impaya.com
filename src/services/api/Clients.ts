import { GD } from "../../GD";
import Errors from "../../structures/Error";
import Signal from "../../utils/Signal";
import BaseHandler from "./BaseHandler";

class Clients extends BaseHandler{

    clients:Map<number,ClientVO>|null=null;
    merchants:Map<number,MerchantVO>|null = null;
    loading=false;
    onDataLoaded:Signal<ErrorVO|null>=new Signal();
    lastUpdated=0;
    updateCacheTime = 1000*60*60*24*15; // 15 days

    constructor(){
        super("Clients")
    }
    async init(){
        GD.S_CLIENTS_REQUEST.listener=(a,b)=>{
            this.loadClients((err:ErrorVO|null)=>{
                b({clients:this.clients ?? new Map(),merchants:this.merchants ?? new Map(),err:err});
            });
        }
    }
    async execute(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{
        return super.execute(packet);
    }


    async getClients(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{
       
        const data = await GD.S_CLIENTS_REQUEST.request();

        if(data.err){
            return {
                error:data.err,
                data:null
            }
        }

        return {
            error:null,
            data:Array.from(this.clients?.values() ?? [])
        }
    }

    async getMerchants(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{
       
        const data = await GD.S_CLIENTS_REQUEST.request();

        if(data.err){
            return {
                error:data.err,
                data:null
            }
        }

        return {
            error:null,
            data:Array.from(this.merchants?.values() ?? [])
        }
    }



    async loadClients(cb:(err:ErrorVO|null)=>void){

        if(this.clients && this.merchants && this.clients.size>0 && this.merchants.size>0){
            if(+new Date() - this.lastUpdated<this.updateCacheTime){
                cb(null);
                return; // cache for 2 days
            }
        }

        this.onDataLoaded.add(cb)
        if(this.loading)
            return;

        this.loading=true;

        let err=null;

        // add client/merchant
        if(!this.clients){

            // Request clients
            const cresponse = await GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `clients` @NOLIMIT",
                fields:{}
            })

            if(cresponse && cresponse.data && Array.isArray(cresponse.data)){
                this.clients = new Map();
                for(let i of cresponse.data){
                    this.clients.set(i.id,i)
                }
            }else{
                err=Errors.CLIENTS_CANT_GET_CLIENTS
                console.error(cresponse.err)
            }
        }

        if(!this.merchants && !err){

            // requeset merchants
            const mresponse = await GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `merchants` @NOLIMIT",
                fields:{}
            })

            if(mresponse && mresponse.data && Array.isArray(mresponse.data)){
                this.merchants = new Map();
                for(let i of mresponse.data){
                    const client = this.clients?.get(i.client_id);
                    if(client){
                        i.client = {
                            id:client.id,
                            name:client.name
                        };
                        let m=client.merchants;
                        if(!m){
                            m=[];
                            client.merchants = m;
                        }
                        m.push(i)
                    }
                    this.merchants.set(i.id,i)
                }
            }else{
                err=Errors.CLIENTS_CANT_GET_MERCHANTS;
            }
        }

        this.lastUpdated = +new Date();
        this.loading = false;
        this.onDataLoaded.invoke(err);
        this.onDataLoaded.clear();
    }
}
export default Clients;