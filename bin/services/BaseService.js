"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../GD");
class BaseService {
    constructor(name) {
        this._serivceName = "BaseService";
        this.onServiceReady = () => { GD_1.GD.S_SERVICE_READY.invoke(this._serivceName); };
        this._serivceName = name !== null && name !== void 0 ? name : "uknown service " + (BaseService.serviceID++);
        GD_1.GD.S_APP_READY.add(() => this.onApplicationReady());
    }
    get serviceName() { return this._serivceName; }
    onApplicationReady() { }
}
BaseService.serviceID = 1;
exports.default = BaseService;
