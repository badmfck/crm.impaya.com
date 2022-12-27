"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService_1 = __importDefault(require("./base/BaseService"));
const RatesECB_1 = __importDefault(require("./RatesECB"));
class Rates extends BaseService_1.default {
    ratesECB;
    constructor() {
        super("Rates");
        this.ratesECB = new RatesECB_1.default();
        this.onServiceReady();
    }
    onApplicationReady() {
        this.watchdogStart();
    }
    watchdogStart() {
        this.ratesECB.request();
        setTimeout(() => {
            this.watchdogStart();
        }, 1000 * 1 * 1);
    }
}
exports.default = Rates;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvUmF0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxRUFBNkM7QUFDN0MsMERBQWtDO0FBRWxDLE1BQU0sS0FBTSxTQUFRLHFCQUFXO0lBRTNCLFFBQVEsQ0FBVTtJQUlsQjtRQUNJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxrQkFBUSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxrQkFBa0I7UUFFZixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELGFBQWE7UUFDVCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3ZCLFVBQVUsQ0FBQyxHQUFFLEVBQUU7WUFDWCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsQ0FBQyxFQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDbkIsQ0FBQztDQUNKO0FBRUQsa0JBQWUsS0FBSyxDQUFDIn0=