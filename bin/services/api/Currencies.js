"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Error_1 = __importDefault(require("../../structures/Error"));
const ConcurencyLoader_1 = __importDefault(require("../../utils/ConcurencyLoader"));
const Signal_1 = __importDefault(require("../../utils/Signal"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Currencies extends BaseHandler_1.default {
    concurencyLoader;
    loading = false;
    onDataLoaded = new Signal_1.default();
    constructor() {
        super("Currencies");
        this.concurencyLoader = new ConcurencyLoader_1.default();
        this.concurencyLoader.setLoadingProcedure = async () => {
            const curr = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `currencies_list` @NOLIMIT",
                fields: {}
            });
            let result = null;
            let err = null;
            if (curr && curr.data && Array.isArray(curr.data)) {
                result = new Map();
                for (let i of curr.data)
                    result.set(i.code.toLowerCase(), i);
            }
            else {
                err = Error_1.default.CURRENCIES_CANT_LOAD;
                console.error(curr.err);
            }
            return { error: err, result: result };
        };
        GD_1.GD.S_REQUEST_CURRENCY_NAMES.listener = (data, cb) => {
            this.concurencyLoader.load((err) => {
                cb({ currencies: this.concurencyLoader.data, err });
            });
        };
    }
}
exports.default = Currencies;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VycmVuY2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvQ3VycmVuY2llcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlDQUE4QjtBQUM5QixtRUFBNEM7QUFDNUMsb0ZBQTREO0FBQzVELGdFQUF3QztBQUN4QyxnRUFBd0M7QUFFeEMsTUFBTSxVQUFXLFNBQVEscUJBQVc7SUFFaEMsZ0JBQWdCLENBQXFDO0lBQ3JELE9BQU8sR0FBQyxLQUFLLENBQUM7SUFDZCxZQUFZLEdBQXNCLElBQUksZ0JBQU0sRUFBRSxDQUFDO0lBRS9DO1FBQ0ksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLDBCQUFnQixFQUFFLENBQUM7UUFFL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixHQUFHLEtBQUssSUFBRyxFQUFFO1lBRWxELE1BQU0sSUFBSSxHQUFHLE1BQU0sT0FBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQztnQkFDN0MsS0FBSyxFQUFFLDBDQUEwQztnQkFDakQsTUFBTSxFQUFDLEVBQUU7YUFDWixDQUFDLENBQUE7WUFDRixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ2YsSUFBRyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQztnQkFDN0MsTUFBTSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ25CLEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUk7b0JBQ2xCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBQyxDQUFDLENBQUMsQ0FBQzthQUMxQztpQkFBSTtnQkFDRCxHQUFHLEdBQUMsZUFBTSxDQUFDLG9CQUFvQixDQUFBO2dCQUMvQixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUMxQjtZQUVELE9BQU8sRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsQ0FBQTtRQUNwQyxDQUFDLENBQUE7UUFFRCxPQUFFLENBQUMsd0JBQXdCLENBQUMsUUFBUSxHQUFDLENBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFnQixFQUFDLEVBQUU7Z0JBQzNDLEVBQUUsQ0FBQyxFQUFDLFVBQVUsRUFBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFDLEdBQUcsRUFBQyxDQUFDLENBQUE7WUFDbkQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUE7SUFDTCxDQUFDO0NBR0o7QUFFRCxrQkFBZSxVQUFVLENBQUMifQ==