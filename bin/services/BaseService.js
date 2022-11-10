"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../GD");
class BaseService {
    _serivceName = "BaseService";
    get serviceName() { return this._serivceName; }
    static serviceID = 1;
    constructor(name) {
        this._serivceName = name ?? "uknown service " + (BaseService.serviceID++);
        GD_1.GD.S_APP_READY.add(() => this.onApplicationReady());
    }
    onServiceReady = () => { GD_1.GD.S_SERVICE_READY.invoke(this._serivceName); };
    onApplicationReady() { }
}
exports.default = BaseService;
