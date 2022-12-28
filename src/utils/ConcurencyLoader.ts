import Errors from "../structures/Error";
import Signal from "./Signal";

class ConcurencyLoader<T>{
    
    data:T|null=null; // alias
    loading=false;
    onDataLoaded:Signal<TransferPacketVO<T>>=new Signal();
    setLoadingProcedure?:()=>Promise<TransferPacketVO<T>>
    lastUpdate = 0;

    constructor(){}

    async load(cb:(resp:TransferPacketVO<T>)=>void){

        if(this.data){
            cb({data:this.data,error:null});
            return;
        }

        this.onDataLoaded.add(cb)

        if(this.loading)
            return;
        
        this.loading=true;
        let err=null;
        let res:TransferPacketVO<T>
   
        if(this.setLoadingProcedure){
            res = await this.setLoadingProcedure();
        }else{
            res={
                error:Errors.CORE_CONCURENCY_LOADER_NO_PROCEDURE,
                data:null
            }
        }

        if(res){
            if(res.error){
                err = res.error
            }else if(res.data){
                this.data = res.data
            }else{
                err = Errors.CORE_CONCURENCY_LOADER_NO_DATA
            }
        }else{
            err = Errors.CORE_CONCURENCY_LOADER_NO_RESULT;
        }

        this.lastUpdate = +new Date();
        this.loading = false;
        this.onDataLoaded.invoke(res);
        this.onDataLoaded.clear();
    }
}
export default ConcurencyLoader;