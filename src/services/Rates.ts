import BaseService from "./base/BaseService";
import RatesECB from "./RatesECB";

class Rates extends BaseService{
    
    ratesECB:RatesECB;



    constructor(){
        super("Rates");
        this.ratesECB = new RatesECB();
        this.onServiceReady();
    }

    onApplicationReady(): void {
        // start watchdog
       this.watchdogStart();
    }

    watchdogStart(){
        this.ratesECB.request()
        setTimeout(()=>{
            this.watchdogStart();
        },1000 * 60 * 30) // each 30 min
    }
}

export default Rates;
