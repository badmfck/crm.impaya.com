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
        HTTP_TIMEOUT: 1000 * 30,
        SQL_HOST: "127.0.0.1",
        SQL_PORT: 3306,
        SQL_USER: "crm",
        SQL_PASSWD: "{crm_iMpaya71)",
        SQL_MAX_CONNECTIONS: 10
    };
    constructor() {
        super("Config");
        GD_1.GD.S_CONFIG_REQUEST.listener = (a, b) => b(this.data);
        this.onServiceReady();
    }
}
exports.default = Config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDhCQUEyQjtBQUMzQixxRUFBNkM7QUFjN0MsTUFBTSxNQUFPLFNBQVEscUJBQVc7SUFJNUIsSUFBSSxHQUFVO1FBQ1YsaUJBQWlCLEVBQUMsSUFBSTtRQUN0QixlQUFlLEVBQUMsUUFBUTtRQUN4QixZQUFZLEVBQUMsSUFBSSxHQUFDLEVBQUU7UUFDcEIsUUFBUSxFQUFDLFdBQVc7UUFDcEIsUUFBUSxFQUFDLElBQUk7UUFDYixRQUFRLEVBQUMsS0FBSztRQUNkLFVBQVUsRUFBQyxnQkFBZ0I7UUFDM0IsbUJBQW1CLEVBQUMsRUFBRTtLQUN6QixDQUFBO0lBRUQ7UUFDSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDZixPQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNoRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFFMUIsQ0FBQztDQUNKO0FBQ0Qsa0JBQWUsTUFBTSxDQUFDIn0=