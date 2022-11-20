"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncSignal = exports.SignalHandler = void 0;
class Signal {
    static nextID = 0;
    busy = false;
    tempAdd = [];
    tempRem = [];
    tempInvoke = [];
    callbacks = [];
    constructor(name) { }
    add(callback, id) {
        if (!id)
            id = "" + (Signal.nextID++);
        if (this.busy) {
            for (let i of this.tempAdd) {
                if (i.cb === callback)
                    return i.id;
            }
            this.tempAdd.push({ cb: callback, id: id });
            return id;
        }
        for (let i of this.callbacks) {
            if (i.cb === callback)
                return i.id;
        }
        this.callbacks.push({ cb: callback, id: id });
        return id;
    }
    remove(callback, id) {
        if (!callback && !id)
            return;
        if (this.busy) {
            for (let i of this.tempRem) {
                if (callback) {
                    if (i.cb === callback)
                        return;
                }
                if (id) {
                    if (i.id === id)
                        return;
                }
            }
            this.tempRem.push({ cb: callback, id: id });
            return id;
        }
        for (let i = 0; i < this.callbacks.length; i++) {
            const itm = this.callbacks[i];
            let remove = false;
            if (callback)
                remove = itm.cb === callback;
            if (id)
                remove = remove || itm.id === id;
            if (remove) {
                this.callbacks.splice(i, 1);
                i--;
            }
        }
    }
    invoke(data) {
        if (this.busy) {
            this.tempInvoke.push({ data: data });
            return;
        }
        this.busy = true;
        for (let i of this.callbacks) {
            if (i && i.cb && typeof i.cb === "function") {
                i.cb(data);
            }
        }
        this.busy = false;
        for (let i of this.tempAdd) {
            this.add(i.cb, i.id);
        }
        this.tempAdd = [];
        for (let i of this.tempRem) {
            this.remove(i.cb, i.id);
        }
        this.tempRem = [];
        for (let i of this.tempInvoke) {
            this.invoke(i.data);
        }
    }
}
class SignalHandler {
    static nextID = 0;
    id;
    signals = [];
    constructor() {
        this.id = SignalHandler.nextID++;
    }
    add(signal, cb) {
        let added = false;
        for (let i of this.signals) {
            if (i === signal) {
                added = true;
                break;
            }
        }
        if (!added)
            this.signals.push(signal);
        signal.add(cb, "signaller_" + this.id);
    }
    clear() {
        for (let i of this.signals)
            i.remove(undefined, "signaller_" + this.id);
        this.signals = [];
    }
}
exports.SignalHandler = SignalHandler;
class SyncSignal {
    worker;
    request(data) {
        const executor = (resolve, reject) => {
            if (!this.worker) {
                reject("No worker registered in SyncSignal");
                return;
            }
            this.worker(data, resolve);
        };
        const promise = new Promise(executor);
        return promise;
    }
    set listener(_listener) {
        this.worker = _listener;
    }
}
exports.SyncSignal = SyncSignal;
exports.default = Signal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1NpZ25hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLE1BQU07SUFDUixNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQztJQUVSLElBQUksR0FBQyxLQUFLLENBQUM7SUFDWCxPQUFPLEdBQWlDLEVBQUUsQ0FBQztJQUMzQyxPQUFPLEdBQW1DLEVBQUUsQ0FBQztJQUM3QyxVQUFVLEdBQVksRUFBRSxDQUFDO0lBQ3pCLFNBQVMsR0FBaUMsRUFBRSxDQUFDO0lBQ3JELFlBQVksSUFBWSxJQUFFLENBQUM7SUFFM0IsR0FBRyxDQUFDLFFBQXVCLEVBQUMsRUFBVTtRQUNsQyxJQUFHLENBQUMsRUFBRTtZQUNGLEVBQUUsR0FBQyxFQUFFLEdBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtRQUczQixJQUFHLElBQUksQ0FBQyxJQUFJLEVBQUM7WUFDVCxLQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUM7Z0JBQ3RCLElBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxRQUFRO29CQUNoQixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDbkI7WUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxDQUFDLENBQUM7WUFDdkMsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUdELEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBQztZQUN4QixJQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssUUFBUTtnQkFDaEIsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ25CO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBQyxFQUFFLEVBQUMsUUFBUSxFQUFDLEVBQUUsRUFBQyxFQUFFLEVBQUMs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