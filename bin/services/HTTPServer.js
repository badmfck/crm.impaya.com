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
const cors_1 = __importDefault(require("cors"));
const Balance_1 = __importDefault(require("./api/Balance"));
const Solutions_1 = __importDefault(require("./api/Solutions"));
const Currencies_1 = __importDefault(require("./api/Currencies"));
const Payservices_1 = __importDefault(require("./api/Payservices"));
class HTTPServer extends BaseService_1.default {
    cfg = null;
    handlers = {
        auth: new Auth_1.default(),
        trx: new Transactions_1.default(),
        clients: new Clients_1.default(),
        balance: new Balance_1.default(),
        solutions: new Solutions_1.default(),
        currencies: new Currencies_1.default(),
        payservice: new Payservices_1.default()
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
        if (!this.cfg) {
            console.error("Error, no config!");
            return;
        }
        const app = (0, express_1.default)();
        app.use(express_1.default.static(this.cfg.HTTP_PUBLIC_DIR));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true }));
        const whitelist = [
            'http://localhost:3000',
            "https://crm.impaya.com"
        ];
        const corsOptions = {
            origin: (origin, callback) => {
                console.log(origin);
                const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
                callback(null, originIsWhitelisted);
            },
            credentials: true
        };
        app.use((0, cors_1.default)(corsOptions));
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
        let ip = req.socket.remoteAddress;
        if ("x-real-ip" in req.header) {
            const tmp = req.header['x-real-ip'];
            if (tmp)
                ip = tmp;
        }
        if (!ip) {
            return this.sendResponse(res, {
                error: Error_1.default.NO_IP,
                data: null
            }, tme);
        }
        this.route(res, req.method.toLowerCase(), ip, packet, req.headers, tme);
    }
    async route(res, httpMethod, ip, packet, headers, tme) {
        const request = packet.data;
        if (!("method" in request) || typeof request.method !== "string") {
            return {
                error: Error_1.default.NO_METHOD,
                data: packet
            };
        }
        const tmp = request.method.split(".");
        let moduleName = tmp[0]?.replaceAll(/[^0-9a-zA-Z_]/gi, "");
        const method = tmp[1]?.replaceAll(/[^0-9a-zA-Z_]/gi, "");
        if (!moduleName || moduleName.length === 0 || !(moduleName in this.handlers)) {
            this.sendResponse(res, {
                error: Error_1.default.WRONG_METHOD,
                data: null
            }, tme, request.method);
            return;
        }
        moduleName = moduleName.toLowerCase();
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
                }, tme, request.method);
                return;
            }
        }
        if (!authorizedUser && (module !== this.handlers.auth)) {
            this.sendResponse(res, {
                error: Error_1.default.UNAUTHORIZED_ACCESS,
                data: null
            }, tme, request.method);
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
                user: authorizedUser,
                headers: headers
            });
        }
        catch (e) {
            this.sendResponse(res, {
                error: Error_1.default.RUNTIME_ERROR,
                data: `${e}`
            }, tme, request.method);
            return;
        }
        if (!response) {
            this.sendResponse(res, {
                error: Error_1.default.EMPTY_RESPONSE,
                data: null
            }, tme, request.method);
            return;
        }
        this.sendResponse(res, response, tme, request.method);
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
    sendResponse(res, data, requestTime, method) {
        data.responseTime = (+new Date()) - requestTime;
        data.version = this.cfg?.VERSION;
        data.method = method ?? "no_method";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSFRUUFNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9IVFRQU2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUVBQTZDO0FBQzdDLHNEQUFvRDtBQUNwRCw4QkFBMkI7QUFDM0IsZ0VBQXlDO0FBQ3pDLHNEQUE4QjtBQUc5Qix1REFBK0I7QUFDL0Isc0VBQThDO0FBQzlDLDREQUFvQztBQUVwQyxnREFBdUI7QUFDdkIsNERBQW9DO0FBQ3BDLGdFQUF3QztBQUN4QyxrRUFBMEM7QUFDMUMsb0VBQTJDO0FBYzNDLE1BQU0sVUFBVyxTQUFRLHFCQUFXO0lBRXhCLEdBQUcsR0FBaUIsSUFBSSxDQUFDO0lBRXpCLFFBQVEsR0FBYztRQUMxQixJQUFJLEVBQUMsSUFBSSxjQUFJLEVBQUU7UUFDZixHQUFHLEVBQUMsSUFBSSxzQkFBWSxFQUFFO1FBQ3RCLE9BQU8sRUFBQyxJQUFJLGlCQUFPLEVBQUU7UUFDckIsT0FBTyxFQUFDLElBQUksaUJBQU8sRUFBRTtRQUNyQixTQUFTLEVBQUMsSUFBSSxtQkFBUyxFQUFFO1FBQ3pCLFVBQVUsRUFBQyxJQUFJLG9CQUFVLEVBQUU7UUFDM0IsVUFBVSxFQUFDLElBQUkscUJBQVUsRUFBRTtLQUM5QixDQUFBO0lBRUQ7UUFDSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDbkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCO1FBR3BCLEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQztZQUN4QixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDaEM7UUFHRCxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sT0FBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQy9DLElBQUcsQ0FBQyxJQUFJLENB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