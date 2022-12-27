import e from "express";
import Errors from "../structures/Error";
import Signal from "./Signal";

class ConcurencyLoader<K,T>{
    
    data:Map<K,T>|null=null; // alias
    loading=false;
    onDataLoaded:Signal<ErrorVO|null>=new Signal();
    setLoadingProcedure?:()=>Promise<{error?:ErrorVO|null,result?:Map<K,T>|null}>
    lastUpdate = 0;

    constructor(){

    }

    async load(cb:(err:ErrorVO|null)=>void){

        if(this.data && this.data.size>0){
            cb(null);
            return;
        }

        this.onDataLoaded.add(cb)

        if(this.loading)
            return;
        
        this.loading=true;
        let err=null;
        let res
   
        if(this.setLoadingProcedure){
            res = await this.setLoadingProcedure();
        }else{
            err = Errors.CORE_CONCURENCY_LOADER_NO_PROCEDURE
        }

        if(res){
            if(res.error){
                err = res.error
            }else if(res.result){
                this.data = res.result
            }else{
                err = Errors.CORE_CONCURENCY_LOADER_NO_DATA
            }
        }else{
            err = Errors.CORE_CONCURENCY_LOADER_NO_RESULT;
        }

        this.lastUpdate = +new Date();
        this.loading = false;
        this.onDataLoaded.invoke(err);
        this.onDataLoaded.clear();
    }
}
export default ConcurencyLoader;