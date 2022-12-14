import Signal, { SyncSignal } from "./utils/Signal";

export class GD{
    static S_SERVICE_READY:Signal<string>=new Signal();
    static S_APP_READY:Signal<void>=new Signal();
    static S_CONFIG_REQUEST:SyncSignal<void,ConfigVO>=new SyncSignal();

    static S_REQ_MYSQL_SELECT:SyncSignal<MySQLSelectQueryVO,MySQLResult>=new SyncSignal();
    static S_REQ_MYSQL_INSERT_QUERY:SyncSignal<MySQLInsertQueryVO | MySQLInsertQueryVO[],MySQLResult>=new SyncSignal();
    static S_REQ_MYSQL_QUERY:SyncSignal<MySQLQueryVO | MySQLQueryVO[],MySQLResult>=new SyncSignal();

    static S_CLIENTS_REQUEST:SyncSignal<void,{clients:Map<number,ClientVO>,merchants:Map<number,MerchantVO>,err:ErrorVO|null}>=new SyncSignal();
    
    static S_SOLUTIONS_REQUEST:SyncSignal<void,TransferPacketVO<SolutionVO[]>>=new SyncSignal();
    static S_SOLUTION_TYPES_REQUEST:SyncSignal<void,TransferPacketVO<{name:string,id:number}[]>>=new SyncSignal();

    static S_EVENT_ADD:Signal<EventPacketVO>=new Signal();

    static S_REQUEST_CURRENCY_NAMES:SyncSignal<void,TransferPacketVO<Map<string,CurrencyVO>>>=new SyncSignal();
    
    static S_PAY_SERVICES_GET_TYPES:SyncSignal<void,TransferPacketVO<{name:string,id:number}[]>>=new SyncSignal();
}