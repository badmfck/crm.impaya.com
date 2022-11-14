"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
class API {
    router = express_1.default.Router();
    constructor() {
        this.router.get("/", (req, res) => {
            console.log("Request to api router");
            res.send("Ok");
        });
        this.router.get("/status", (req, res) => {
            console.log("send status");
            res.send("status");
        });
    }
}
exports.default = API;
