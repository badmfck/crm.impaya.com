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
const HTTPServer_1 = __importDefault(require("./services/HTTPServer"));
const GD_1 = require("./GD");
const Config_1 = __importDefault(require("./services/Config"));
class Main {
    constructor() { this.init(); }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initializeServices();
            GD_1.GD.S_APP_READY.invoke();
            console.log("APP LAUNCHED");
        });
    }
    initializeServices() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let i = 0;
                let services = [
                    Config_1.default,
                    HTTPServer_1.default
                ];
                GD_1.GD.S_SERVICE_READY.add(name => {
                    console.log("Service: " + name + " ready");
                    i++;
                    if (i === services.length) {
                        resolve();
                    }
                });
                for (let i of services) {
                    new i();
                }
            });
        });
    }
}
new Main();
