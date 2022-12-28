"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Error_1 = __importDefault(require("../../structures/Error"));
const ConcurencyLoader_1 = __importDefault(require("../../utils/ConcurencyLoader"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Payservice extends BaseHandler_1.default {
    payservicesNames = new ConcurencyLoader_1.default();
    constructor() {
        super("payservice");
        this.payservicesNames.setLoadingProcedure = async () => {
            const sql = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `pay_services_types` @NOLIMIT",
                fields: {}
            });
            let result = null;
            let err = null;
            if (sql && sql.data && Array.isArray(sql.data)) {
                result = sql.data;
            }
            else {
                err = Error_1.default.PAYSERVICES_CANT_LOAD;
                console.error(sql.err);
            }
            return { error: err, data: result };
        };
        GD_1.GD.S_PAY_SERVICES_GET_TYPES.listener = (data, cb) => {
            this.payservicesNames.load(cb);
        };
    }
    execute(packet) {
        switch (packet.method) {
            case "getNames":
                return this.getNames(packet);
        }
        return super.execute(packet);
    }
    async getNames(packet) {
        return await GD_1.GD.S_PAY_SERVICES_GET_TYPES.request();
    }
}
exports.default = Payservice;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF5c2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvYXBpL1BheXNlcnZpY2VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsaUNBQThCO0FBQzlCLG1FQUE0QztBQUM1QyxvRkFBNEQ7QUFDNUQsZ0VBQXdDO0FBRXhDLE1BQU0sVUFBVyxTQUFRLHFCQUFXO0lBRWhDLGdCQUFnQixHQUErQyxJQUFJLDBCQUFnQixFQUFFLENBQUE7SUFFckY7UUFDSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7UUFHbkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixHQUFDLEtBQUssSUFBRyxFQUFFO1lBQ2hELE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztnQkFDNUMsS0FBSyxFQUFFLDZDQUE2QztnQkFDcEQsTUFBTSxFQUFDLEVBQUU7YUFDWixDQUFDLENBQUE7WUFDRixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2YsSUFBRyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBQztnQkFDMUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7YUFDckI7aUJBQUk7Z0JBQ0QsR0FBRyxHQUFDLGVBQU0sQ0FBQyxxQkFBcUIsQ0FBQTtnQkFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDekI7WUFFRCxPQUFPLEVBQUMsS0FBSyxFQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLENBQUE7UUFDbEMsQ0FBQyxDQUFBO1FBQ0QsT0FBRSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksRUFBQyxFQUFFLEVBQUMsRUFBRTtZQUM5QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQTtJQUNMLENBQUM7SUFFRCxPQUFPLENBQUMsTUFBeUI7UUFDN0IsUUFBTyxNQUFNLENBQUMsTUFBTSxFQUFDO1lBQ2pCLEtBQUssVUFBVTtnQkFDZixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDL0I7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBd0I7UUFDbkMsT0FBTyxNQUFNLE9BQUUsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0NBRUo7QUFDRCxrQkFBZSxVQUFVLENBQUMifQ==