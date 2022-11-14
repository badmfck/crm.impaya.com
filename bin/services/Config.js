"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../GD");
const BaseService_1 = __importDefault(require("./base/BaseService"));
class Config extends BaseService_1.default {
    data = {
        HTTP_SERVICE_PORT: 8080,
        HTTP_PUBLIC_DIR: "public",
        HTTP_TIMEOUT: 1000 * 30
    };
    constructor() {
        super("Config");
        GD_1.GD.S_CONFIG_REQUEST.listener = (a, b) => b(this.data);
        this.onServiceReady();
    }
}
exports.default = Config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDhCQUEyQjtBQUMzQixxRUFBNkM7QUFRN0MsTUFBTSxNQUFPLFNBQVEscUJBQVc7SUFFNUIsSUFBSSxHQUFVO1FBQ1YsaUJBQWlCLEVBQUMsSUFBSTtRQUN0QixlQUFlLEVBQUMsUUFBUTtRQUN4QixZQUFZLEVBQUMsSUFBSSxHQUFDLEVBQUU7S0FDdkIsQ0FBQTtJQUVEO1FBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2YsT0FBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDaEQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRTFCLENBQUM7Q0FDSjtBQUNELGtCQUFlLE1BQU0sQ0FBQyJ9