"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService_1 = __importDefault(require("./base/BaseService"));
const express_1 = __importDefault(require("express"));
const GD_1 = require("../GD");
const Error_1 = __importDefault(require("../structures/Error"));
const Auth_1 = __importDefault(require("./api/Auth"));
const Helper_1 = __importDefault(require("../Helper"));
const Transactions_1 = __importDefault(require("./api/Transactions"));
const Clients_1 = __importDefault(require("./api/Clients"));
class HTTPServer extends BaseService_1.default {
    cfg = null;
    handlers = {
        auth: new Auth_1.default(),
        trx: new Transactions_1.default(),
        clients: new Clients_1.default()
    };
    constructor() {
        super("HTTPServer");
        this.onServiceReady();
    }
    async onApplicationReady() {
        for (let i in this.handlers) {
            await this.handlers[i].init();
        }
        this.cfg = await GD_1.GD.S_CONFIG_REQUEST.request();
        const app = (0, express_1.default)();
        app.use(express_1.default.static(this.cfg.HTTP_PUBLIC_DIR));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        app.all("/api/", async (req, res) => {
            const tme = +new Date();
            if (req.method === "POST") {
                const b = req.body;
                this.handleRequest(req, res, b);
                return;
            }
            this.sendResponse(res, {
                error: Error_1.default.ERROR_NO_CDATA,
                data: null
            }, tme);
        });
        app.all("/api/:cdata", async (req, res) => {
            this.handleRequest(req, res, req.params.cdata);
        });
        app.use((req, res, next) => {
            const tme = +new Date();
            this.sendResponse(res, {
                error: Error_1.default.ERROR_BAD_REQUEST,
                data: `global`
            }, tme);
        });
        app.listen(this.cfg.HTTP_SERVICE_PORT, () => {
            console.log("HTTP Service started on: " + this.cfg?.HTTP_SERVICE_PORT);
        });
    }
    handleRequest(req, res, cdata) {
        const tme = +new Date();
        res.setTimeout(this.cfg?.HTTP_TIMEOUT ?? 1000 * 30, () => {
            this.sendResponse(res, {
                error: Error_1.default.ERROR_TIMEOUT,
                data: null
            }, tme);
        });
        const packet = this.parsePacket(cdata);
        if (packet.error) {
            this.sendResponse(res, {
                error: packet.error,
                data: packet.data
            }, tme);
            return;
        }
        const ip = req.socket.remoteAddress;
        if (!ip) {
            return this.sendResponse(res, {
                error: Error_1.default.NO_IP,
                data: null
            }, tme);
        }
        this.route(res, req.method.toLowerCase(), ip, packet, tme);
    }
    async route(res, httpMethod, ip, packet, tme) {
        const request = packet.data;
        if (!("method" in request) || typeof request.method !== "string") {
            return {
                error: Error_1.default.NO_METHOD,
                data: packet
            };
        }
        const tmp = request.method.split(".");
        const moduleName = tmp[0]?.replaceAll(/[^0-9a-zA-Z_]/gi, "");
        const method = tmp[1]?.replaceAll(/[^0-9a-zA-Z_]/gi, "");
        if (!moduleName || moduleName.length === 0 || !(moduleName in this.handlers)) {
            this.sendResponse(res, {
                error: Error_1.default.WRONG_METHOD,
                data: null
            }, tme);
            return;
        }
        const module = this.handlers[moduleName];
        let authorizedUser = null;
        if (packet.data.key) {
            try {
                authorizedUser = await this.handlers.auth.checkAuthKey(packet.data.key);
            }
            catch (e) {
                this.sendResponse(res, {
                    error: Error_1.default.RUNTIME_ERROR,
                    data: `${e}`
                }, tme);
                return;
            }
        }
        if (!authorizedUser && (module !== this.handlers.auth)) {
            this.sendResponse(res, {
                error: Error_1.default.UNAUTHORIZED_ACCESS,
                data: null
            }, tme);
            return;
        }
        let response;
        try {
            response = await module.execute({
                httpMethod: httpMethod,
                encrypted: packet.encrypted ?? false,
                method: method,
                data: request.data,
                ip: ip,
                user: authorizedUser
            });
        }
        catch (e) {
            this.sendResponse(res, {
                error: Error_1.default.RUNTIME_ERROR,
                data: `${e}`
            }, tme);
            return;
        }
        if (!response) {
            this.sendResponse(res, {
                error: Error_1.default.EMPTY_RESPONSE,
                data: null
            }, tme);
            return;
        }
        this.sendResponse(res, response, tme);
    }
    parsePacket(cdata) {
        let json = null;
        let encrypted = false;
        let packet = null;
        if (typeof cdata === "string") {
            encrypted = true;
            packet = Helper_1.default.unpack("testing_key", cdata);
            if (packet?.indexOf("{") !== 0)
                packet = null;
            if (!packet) {
                encrypted = false;
                if (cdata.indexOf("{") === 0) {
                    packet = cdata;
                }
                else {
                    try {
                        packet = Buffer.from(cdata, "base64").toString("utf8");
                    }
                    catch (e) {
                        return {
                            error: Error_1.default.ERROR_BAD_REQUEST,
                            data: `${e}`,
                            encrypted: false
                        };
                    }
                }
            }
            try {
                json = JSON.parse(packet);
            }
            catch (e) {
                return {
                    error: Error_1.default.ERROR_BAD_REQUEST,
                    data: `${e}`,
                    encrypted: encrypted
                };
            }
        }
        else {
            if (typeof cdata === "object")
                json = cdata;
        }
        if (!json) {
            return {
                error: Error_1.default.EMPTY_REQUEST,
                data: packet,
                encrypted: encrypted
            };
        }
        return {
            error: null,
            data: json,
            encrypted: encrypted
        };
    }
    sendResponse(res, data, requestTime) {
        data.responseTime = (+new Date()) - requestTime;
        if (res.destroyed || res.closed) {
            console.error("Connection already closed, can't send response", data);
            return;
        }
        try {
            res.send(data);
        }
        catch (e) {
            console.error("Can't send response! ", e);
        }
    }
}
exports.default = HTTPServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSFRUUFNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9IVFRQU2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUVBQTZDO0FBQzdDLHNEQUFvRDtBQUNwRCw4QkFBMkI7QUFFM0IsZ0VBQXlDO0FBQ3pDLHNEQUE4QjtBQUc5Qix1REFBK0I7QUFDL0Isc0VBQThDO0FBQzlDLDREQUFvQztBQVVwQyxNQUFNLFVBQVcsU0FBUSxxQkFBVztJQUV4QixHQUFHLEdBQWlCLElBQUksQ0FBQztJQUV6QixRQUFRLEdBQWM7UUFDMUIsSUFBSSxFQUFDLElBQUksY0FBSSxFQUFFO1FBQ2YsR0FBRyxFQUFDLElBQUksc0JBQVksRUFBRTtRQUN0QixPQUFPLEVBQUMsSUFBSSxpQkFBTyxFQUFFO0tBQ3hCLENBQUE7SUFFRDtRQUNJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNuQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0I7UUFHcEIsS0FBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ3hCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNoQztRQUdELElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxPQUFFLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBQSxpQkFBTyxHQUFFLENBQUM7UUFHdEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7UUFFakQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFB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