import { ConfigVO } from "./services/Config";
import Signal, { SyncSignal } from "./utils/Signal";

export class GD{
    static S_SERVICE_READY:Signal<string>=new Signal();
    static S_APP_READY:Signal<void>=new Signal();
    static S_CONFIG_REQUEST:SyncSignal<void,ConfigVO>=new SyncSignal();

    static S_REQ_MYSQL_SELECT:SyncSignal<MySQLSelectQueryVO,MySQLResult>=new SyncSignal();
    static S_REQ_MYSQL_INSERT_QUERY:SyncSignal<MySQLInsertQueryVO | MySQLInsertQueryVO[],MySQLResult>=new SyncSignal();
    static S_REQ_MYSQL_QUERY:SyncSignal<MySQLQueryVO | MySQLQueryVO[],MySQLResult>=new SyncSignal();

    static S_EVENT_ADD:Signal<EventPacketVO>=new Signal();
}