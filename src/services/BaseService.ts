import { GD } from "../GD";
import IService from "./IService";

class BaseService implements IService{
    private _serivceName:string="BaseService"
    get serviceName():string{return this._serivceName}
    static serviceID:number=1;
    constructor(name?:string){
        this._serivceName = name ?? "uknown service "+(BaseService.serviceID++);
        GD.S_APP_READY.add(()=>this.onApplicationReady())
    }
    
    onServiceReady=()=>{GD.S_SERVICE_READY.invoke(this._serivceName)}
    onApplicationReady(){}
}

export default BaseService;