"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GD = void 0;
const Signal_1 = __importStar(require("./utils/Signal"));
class GD {
    static S_SERVICE_READY = new Signal_1.default();
    static S_APP_READY = new Signal_1.default();
    static S_CONFIG_REQUEST = new Signal_1.SyncSignal();
    static S_REQ_MYSQL_SELECT = new Signal_1.SyncSignal();
    static S_REQ_MYSQL_INSERT_QUERY = new Signal_1.SyncSignal();
    static S_REQ_MYSQL_QUERY = new Signal_1.SyncSignal();
    static S_EVENT_ADD = new Signal_1.default();
}
exports.GD = GD;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvR0QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5REFBb0Q7QUFFcEQsTUFBYSxFQUFFO0lBQ1gsTUFBTSxDQUFDLGVBQWUsR0FBZ0IsSUFBSSxnQkFBTSxFQUFFLENBQUM7SUFDbkQsTUFBTSxDQUFDLFdBQVcsR0FBYyxJQUFJLGdCQUFNLEVBQUUsQ0FBQztJQUM3QyxNQUFNLENBQUMsZ0JBQWdCLEdBQTJCLElBQUksbUJBQVUsRUFBRSxDQUFDO0lBRW5FLE1BQU0sQ0FBQyxrQkFBa0IsR0FBNEMsSUFBSSxtQkFBVSxFQUFFLENBQUM7SUFDdEYsTUFBTSxDQUFDLHdCQUF3QixHQUFtRSxJQUFJLG1CQUFVLEVBQUUsQ0FBQztJQUNuSCxNQUFNLENBQUMsaUJBQWlCLEdBQXVELElBQUksbUJBQVUsRUFBRSxDQUFDO0lBRWhHLE1BQU0sQ0FBQyxXQUFXLEdBQXVCLElBQUksZ0JBQU0sRUFBRSxDQUFDOztBQVQxRCxnQkFVQyJ9