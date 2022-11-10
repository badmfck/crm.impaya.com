"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService_1 = __importDefault(require("./BaseService"));
const express_1 = __importDefault(require("express"));
const GD_1 = require("../GD");
class HTTPServer extends BaseService_1.default {
    constructor() {
        super("HTTPServer");
        this.cfg = null;
        this.onServiceReady();
    }
    onApplicationReady() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cfg = yield GD_1.GD.S_CONFIG_REQUEST.request();
            const app = (0, express_1.default)();
            app.all("/", (req, resp) => {
                resp.send("OK");
            });
            // start
            app.listen(this.cfg.HTTP_SERVICE_PORT, () => {
                var _a;
                console.log("HTTP Service started on: " + ((_a = this.cfg) === null || _a === void 0 ? void 0 : _a.HTTP_SERVICE_PORT));
            });
        });
    }
}
exports.default = HTTPServer;
