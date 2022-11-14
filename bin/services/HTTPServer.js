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
class HTTPServer extends BaseService_1.default {
    cfg = null;
    handlers = {
        auth: new Auth_1.default(),
        trx: new Transactions_1.default()
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
                console.log(typeof b);
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
        this.route(res, req.method.toLowerCase(), packet, tme);
    }
    async route(res, httpMethod, packet, tme) {
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
        let response;
        try {
            response = await module.execute({
                httpMethod: httpMethod,
                encrypted: packet.encrypted ?? false,
                method: method,
                data: request.data
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSFRUUFNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9IVFRQU2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscUVBQTZDO0FBQzdDLHNEQUFvRDtBQUNwRCw4QkFBMkI7QUFFM0IsZ0VBQXlDO0FBQ3pDLHNEQUE4QjtBQUc5Qix1REFBK0I7QUFDL0Isc0VBQThDO0FBTzlDLE1BQU0sVUFBVyxTQUFRLHFCQUFXO0lBRXhCLEdBQUcsR0FBaUIsSUFBSSxDQUFDO0lBRXpCLFFBQVEsR0FBYztRQUMxQixJQUFJLEVBQUMsSUFBSSxjQUFJLEVBQUU7UUFDZixHQUFHLEVBQUMsSUFBSSxzQkFBWSxFQUFFO0tBQ3pCLENBQUE7SUFFRDtRQUNJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNuQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELEtBQUssQ0FBQyxrQkFBa0I7UUFHcEIsS0FBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFDO1lBQ3hCLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNoQztRQUdELElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxPQUFFLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0MsTUFBTSxHQUFHLEdBQUcsSUFBQSxpQkFBTyxHQUFFLENBQUM7UUFHdEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7UUFFakQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7UUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FB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