
import BaseService from "./base/BaseService"
class APIService extends BaseService{
    constructor(){
        super("APIService");

        // Attach services

        this.onServiceReady();
    }
}

export default APIService;

