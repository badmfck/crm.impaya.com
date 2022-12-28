"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Error_1 = __importDefault(require("../../structures/Error"));
const ConcurencyLoader_1 = __importDefault(require("../../utils/ConcurencyLoader"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Currencies extends BaseHandler_1.default {
    concurencyLoader;
    constructor() {
        super("currencies");
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
            return { error: err, data: result };
        };
        GD_1.GD.S_REQUEST_CURRENCY_NAMES.listener = (data, cb) => {
            this.concurencyLoader.load(cb);
        };
    }
    execute(packet) {
        switch (packet.method) {
            case "get":
                return this.get(packet);
        }
        return super.execute(packet);
    }
    async get(packet) {
        const res = await GD_1.GD.S_REQUEST_CURRENCY_NAMES.request();
        let d = null;
        if (res.data && res.data.size > 0)
            d = Array.from(res.data.values());
        return {
            error: res.error,
            data: d
        };
    }
}
exports.default = Currencies;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VycmVuY2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvQ3VycmVuY2llcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlDQUE4QjtBQUM5QixtRUFBNEM7QUFDNUMsb0ZBQTREO0FBRTVELGdFQUF3QztBQUV4QyxNQUFNLFVBQVcsU0FBUSxxQkFBVztJQUVoQyxnQkFBZ0IsQ0FBMEM7SUFFMUQ7UUFDSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDbkIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksMEJBQWdCLEVBQUUsQ0FBQztRQUUvQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxJQUFHLEVBQUU7WUFFbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO2dCQUM3QyxLQUFLLEVBQUUsMENBQTBDO2dCQUNqRCxNQUFNLEVBQUMsRUFBRTthQUNaLENBQUMsQ0FBQTtZQUNGLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFDZixJQUFHLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO2dCQUM3QyxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsS0FBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSTtvQkFDbEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFDO2lCQUFJO2dCQUNELEdBQUcsR0FBQyxlQUFNLENBQUMsb0JBQW9CLENBQUE7Z0JBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQzFCO1lBRUQsT0FBTyxFQUFDLEtBQUssRUFBQyxHQUFHLEVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQTtRQUVELE9BQUUsQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEdBQUMsQ0FBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLEVBQUU7WUFDNUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUE7SUFDTCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQXlCO1FBQzdCLFFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBQztZQUNqQixLQUFLLEtBQUs7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQzFCO1FBQ0QsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQXlCO1FBQy9CLE1BQU0sR0FBRyxHQUFHLE1BQU0sT0FBRSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxHQUFDLElBQUksQ0FBQztRQUNYLElBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBQyxDQUFDO1lBQzFCLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtRQUNyQyxPQUFPO1lBQ0gsS0FBSyxFQUFDLEdBQUcsQ0FBQyxLQUFLO1lBQ2YsSUFBSSxFQUFDLENBQUM7U0FDVCxDQUFBO0lBQ0wsQ0FBQztDQUlKO0FBRUQsa0JBQWUsVUFBVSxDQUFDIn0=