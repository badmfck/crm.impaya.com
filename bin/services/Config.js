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
        SQL_MAX_CONNECTIONS: 10,
        IMPAYA_SERVER_USER_UID: "NBcaU1GMlI5vUWw"
    };
    constructor() {
        super("Config");
        GD_1.GD.S_CONFIG_REQUEST.listener = (a, b) => b(this.data);
        this.onServiceReady();
    }
}
exports.default = Config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDhCQUEyQjtBQUMzQixxRUFBNkM7QUFJN0MsTUFBTSxNQUFPLFNBQVEscUJBQVc7SUFJNUIsSUFBSSxHQUFVO1FBQ1YsaUJBQWlCLEVBQUMsSUFBSTtRQUN0QixlQUFlLEVBQUMsUUFBUTtRQUN4QixZQUFZLEVBQUMsSUFBSSxHQUFDLEVBQUU7UUFDcEIsUUFBUSxFQUFDLFdBQVc7UUFDcEIsUUFBUSxFQUFDLElBQUk7UUFDYixRQUFRLEVBQUMsS0FBSztRQUNkLFVBQVUsRUFBQyxnQkFBZ0I7UUFDM0IsbUJBQW1CLEVBQUMsRUFBRTtRQUV0QixzQkFBc0IsRUFBQyxpQkFBaUI7S0FDM0MsQ0FBQTtJQUVEO1FBQ0ksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2YsT0FBRSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDaEQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBRTFCLENBQUM7Q0FDSjtBQUNELGtCQUFlLE1BQU0sQ0FBQyJ9