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
    tempClear = false;
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
    clear() {
        if (this.busy) {
            this.tempClear = true;
            return;
        }
        this.callbacks = [];
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
        if (this.tempClear)
            this.clear();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2lnbmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL1NpZ25hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLE1BQU07SUFDUixNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQztJQUVSLElBQUksR0FBQyxLQUFLLENBQUM7SUFDWCxPQUFPLEdBQWlDLEVBQUUsQ0FBQztJQUMzQyxPQUFPLEdBQW1DLEVBQUUsQ0FBQztJQUM3QyxVQUFVLEdBQVksRUFBRSxDQUFDO0lBQ3pCLFNBQVMsR0FBaUMsRUFBRSxDQUFDO0lBQzdDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDMUIsWUFBWSxJQUFZLElBQUUsQ0FBQztJQUUzQixHQUFHLENBQUMsUUFBdUIsRUFBQyxFQUFVO1FBQ2xDLElBQUcsQ0FBQyxFQUFFO1lBQ0YsRUFBRSxHQUFDLEVBQUUsR0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBRzNCLElBQUcsSUFBSSxDQUFDLElBQUksRUFBQztZQUNULEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBQztnQkFDdEIsSUFBRyxDQUFDLENBQUMsRUFBRSxLQUFLLFFBQVE7b0JBQ2hCLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQzthQUNuQjtZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsRUFBRSxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQztZQUN2QyxPQUFPLEVBQUUsQ0FBQztTQUNiO1FBR0QsS0FBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFDO1lBQ3hCLElBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxRQUFRO2dCQUNoQixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDbkI7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFDLEVBQUUsRUFBQyxRQUFR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