"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPServer_1 = __importDefault(require("./services/HTTPServer"));
const GD_1 = require("./GD");
const Config_1 = __importDefault(require("./services/Config"));
class Main {
    constructor() { this.init(); }
    async init() {
        await this.initializeServices();
        GD_1.GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED");
    }
    async initializeServices() {
        return new Promise((resolve, reject) => {
            let i = 0;
            let services = [
                Config_1.default,
                HTTPServer_1.default
            ];
            GD_1.GD.S_SERVICE_READY.add(name => {
                console.log("Service " + name + " is ready");
                i++;
                if (i === services.length) {
                    resolve();
                }
            });
            for (let i of services) {
                new i();
            }
        });
    }
}
new Main();
