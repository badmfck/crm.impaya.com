import { ConfigVO } from "./services/Config";
import Signal, { SyncSignal } from "./utils/Signal";

export class GD{
    static S_SERVICE_READY:Signal<string>=new Signal();
    static S_APP_READY:Signal<void>=new Signal();
    static S_CONFIG_REQUEST:SyncSignal<void,ConfigVO>=new SyncSignal();
}