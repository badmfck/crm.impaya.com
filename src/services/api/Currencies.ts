import { GD } from "../../GD";
import Errors from "../../structures/Error";
import ConcurencyLoader from "../../utils/ConcurencyLoader";
import Signal from "../../utils/Signal";
import BaseHandler from "./BaseHandler";

class Currencies extends BaseHandler{
    
    concurencyLoader:ConcurencyLoader<string,CurrencyVO>;
    loading=false;
    onDataLoaded:Signal<ErrorVO|null>=new Signal();

    constructor(){
        super("Currencies")
        this.concurencyLoader = new ConcurencyLoader();

        this.concurencyLoader.setLoadingProcedure = async ()=>{
            // Request clients
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
            
            return {error:err,result:result}
        }

        GD.S_REQUEST_CURRENCY_NAMES.listener=(data,cb)=>{
            this.concurencyLoader.load((err:ErrorVO|null)=>{
                cb({currencies:this.concurencyLoader.data,err})
            });
        }
    }

   
}

export default Currencies;