"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Packer_1 = __importDefault(require("./utils/Packer"));
class Services {
    static packer = new Packer_1.default();
}
exports.default = Services;
