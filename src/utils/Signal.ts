class Signal<T> {
    static nextID=0;

    private busy=false;
    private tempAdd:{cb:(data:T)=>void,id:string}[]=[];
    private tempRem:{cb?:(data:T)=>void,id?:string}[]=[];
    private tempInvoke:{data:T}[]=[];
    private callbacks:{cb:(data:T)=>void,id:string}[]=[];
    private tempClear = false;
    constructor(name?:string){}

    add(callback:(data:T)=>void,id?:string):string{
        if(!id)
            id=""+(Signal.nextID++)

        // add to temprary
        if(this.busy){
            for(let i of this.tempAdd){
                if(i.cb === callback)
                    return i.id;
            }
            this.tempAdd.push({cb:callback,id:id});
            return id;
        }

        // add to stocks
        for(let i of this.callbacks){
            if(i.cb === callback)
                return i.id;
        }
        this.callbacks.push({cb:callback,id:id});
        return id;
    }

    clear(){
        if(this.busy){
            this.tempClear = true;
            return;
        }
        this.callbacks = [];
    }

    remove(callback?:(data:T)=>void,id?:string){
        if(!callback && !id)
            return;
        // add to temprary
        if(this.busy){
            for(let i of this.tempRem){
                if(callback){
                    if(i.cb === callback)
                        return;
                }
                if(id){
                    if(i.id === id)
                        return;
                }
            }
            this.tempRem.push({cb:callback,id:id});
            return id;
        }

        // rem from stocks
        for(let i=0;i<this.callbacks.length;i++){
            const itm=this.callbacks[i]
            let remove=false;
            if(callback)
                remove =itm.cb === callback
            if(id)
                remove = remove || itm.id === id
            
            if(remove){
                this.callbacks.splice(i,1);
                i--
                
            }
        }
       
    }

    invoke(data:T){

        if(this.busy){
            this.tempInvoke.push({data:data})
            return;
        }
        this.busy=true;
        for(let i of this.callbacks){
            if(i && i.cb && typeof i.cb === "function"){
                i.cb(data)
            }
        }
        this.busy=false;

        for(let i of this.tempAdd){
            this.add(i.cb,i.id)
        }
        this.tempAdd=[];

        for(let i of this.tempRem){
            this.remove(i.cb,i.id)
        }
        this.tempRem=[];
        
        for(let i of this.tempInvoke){
            this.invoke(i.data)
        }
        if(this.tempClear)
            this.clear();
    }
}


export class SignalHandler{
    static nextID=0;
    private id;
    private signals:Signal<any>[]=[]
    constructor(){
        this.id=SignalHandler.nextID++;
    }
    add<T>(signal:Signal<T>,cb:(data:T)=>void){
        let added=false;
        for(let i of this.signals){
            if(i === signal){
                added=true;
                break;
            }
        }
        if(!added)
            this.signals.push(signal);
        signal.add(cb,"signaller_"+this.id);
    }
    clear(){
        for(let i of this.signals)
            i.remove(undefined,"signaller_"+this.id);
        this.signals=[];
    }
}

export class SyncSignal<T,K> {

    private worker?:(request:T,response:(data:K)=>void)=>void;

    request(data:T):Promise<K>{
        const executor=(resolve:(value:K)=>void,reject:(reason?:any)=>void)=>{
            if(!this.worker){
                reject("No worker registered in SyncSignal")
                return;
            }
            this.worker(data,resolve);
        };
        const promise=new Promise<K>(executor)
        return promise;
    }

    /*
    invoke(data:T,resolve:(value:K)=>void){
        if(this.worker)
            this.worker(data,resolve);
    }
    */
   
    set listener(_listener:(request:T,response:(data:K)=>void)=>void){
        this.worker=_listener;
    }
    
}

export default Signal;