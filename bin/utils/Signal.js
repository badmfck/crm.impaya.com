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
        // add to temprary
        if (this.busy) {
            for (let i of this.tempAdd) {
                if (i.cb === callback)
                    return i.id;
            }
            this.tempAdd.push({ cb: callback, id: id });
            return id;
        }
        // add to stocks
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
        // add to temprary
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
        // rem from stocks
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
                reject("No worker registered");
                return;
            }
            this.worker(data, resolve);
        };
        const promise = new Promise(executor);
        return promise;
    }
    /*
    invoke(data:T,resolve:(value:K)=>void){
        if(this.worker)
            this.worker(data,resolve);
    }
    */
    set listener(_listener) {
        this.worker = _listener;
    }
}
exports.SyncSignal = SyncSignal;
exports.default = Signal;
