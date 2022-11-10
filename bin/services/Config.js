"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../GD");
const BaseService_1 = __importDefault(require("./BaseService"));
class Config extends BaseService_1.default {
    data = {
        HTTP_SERVICE_PORT: 8080,
        HTTP_PUBLIC_DIR: "public"
    };
    constructor() {
        super("Config");
        GD_1.GD.S_CONFIG_REQUEST.listener = (a, b) => b(this.data);
        this.onServiceReady();
    }
}
exports.default = Config;
