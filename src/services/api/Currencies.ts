import { GD } from "../../GD";
import Errors from "../../structures/Error";
import ConcurencyLoader from "../../utils/ConcurencyLoader";
import Signal from "../../utils/Signal";
import BaseHandler from "./BaseHandler";

class Currencies extends BaseHandler{
    
    concurencyLoader:ConcurencyLoader<Map<string,CurrencyVO>>;

    constructor(){
        super("currencies")
        this.concurencyLoader = new ConcurencyLoader();

        this.concurencyLoader.setLoadingProcedure = async ()=>{
            // Request currencies
            const curr = await GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `currencies_list` @NOLIMIT",
                fields:{}
            })
            let result = null;
            let err = null;
            if(curr && curr.data && Array.isArray(curr.data)){
                result = new Map();
                for(let i of curr.data)
                    result.set(i.code.toLowerCase(),i);
            }else{
                err=Errors.CURRENCIES_CANT_LOAD
                console.error(curr.err)
            }

            return {error:err,data:result}
        }

        GD.S_REQUEST_CURRENCY_NAMES.listener=(data,cb)=>{
            this.concurencyLoader.load(cb);
        }
    }

    execute(packet: ExecutionParamsVO): Promise<TransferPacketVO<any>> {
        switch(packet.method){
            case "get":
            return this.get(packet)
        }
        return super.execute(packet);
    }

    async get(packet: ExecutionParamsVO): Promise<TransferPacketVO<any>> {
        const res = await GD.S_REQUEST_CURRENCY_NAMES.request();
        let d=null;
        if(res.data && res.data.size>0)
            d = Array.from(res.data.values())
        return {
            error:res.error,
            data:d
        }
    }


   
}

export default Currencies;