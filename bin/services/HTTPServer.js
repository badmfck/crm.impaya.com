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
class HTTPServer extends BaseService_1.default {
    cfg = null;
    handlers = {
        auth: new Auth_1.default(),
        trx: new Transactions_1.default(),
        clients: new Clients_1.default(),
        balance: new Balance_1.default(),
        solutions: new Solutions_1.default()
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
            }, tme);
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
                user: authorizedUser,
                headers: headers
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
        data.version = this.cfg?.VERSION;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSFRUUFNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9IVFRQU2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUVBQTZDO0FBQzdDLHNEQUFvRDtBQUNwRCw4QkFBMkI7QUFDM0IsZ0VBQXlDO0FBQ3pDLHNEQUE4QjtBQUc5Qix1REFBK0I7QUFDL0Isc0VBQThDO0FBQzlDLDREQUFvQztBQUVwQyxnREFBdUI7QUFDdkIsNERBQW9DO0FBQ3BDLGdFQUF3QztBQVl4QyxNQUFNLFVBQVcsU0FBUSxxQkFBVztJQUV4QixHQUFHLEdBQWlCLElBQUksQ0FBQztJQUV6QixRQUFRLEdBQWM7UUFDMUIsSUFBSSxFQUFDLElBQUksY0FBSSxFQUFFO1FBQ2YsR0FBRyxFQUFDLElBQUksc0JBQVksRUFBRTtRQUN0QixPQUFPLEVBQUMsSUFBSSxpQkFBTyxFQUFFO1FBQ3JCLE9BQU8sRUFBQyxJQUFJLGlCQUFPLEVBQUU7UUFDckIsU0FBUyxFQUFDLElBQUksbUJBQVMsRUFBRTtLQUM1QixDQUFBO0lBRUQ7UUFDSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDbkIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCO1FBR3BCLEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBQztZQUN4QixNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDaEM7UUFHRCxJQUFJLENBQUMsR0FBRyxHQUFHLE1BQU0sT0FBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQy9DLElBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDO1lBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1lBQ2xDLE9BQU87U0FDVjtRQUNELE1BQU0sR0FBRyxHQUFH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