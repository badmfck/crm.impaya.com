"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Helper_1 = __importDefault(require("../../Helper"));
const Error_1 = __importDefault(require("../../structures/Error"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Balance extends BaseHandler_1.default {
    config = null;
    constructor() {
        super("Balance");
    }
    async init() {
        this.config = await GD_1.GD.S_CONFIG_REQUEST.request();
    }
    async execute(packet) {
        switch (packet.method) {
            case "getDayBalance":
                return this.getDayBalance(packet);
        }
        return super.execute(packet);
    }
    async getDayBalance(packet) {
        let dateTime = packet.data.day;
        if (!dateTime || dateTime < 1)
            dateTime = +new Date();
        const month = Helper_1.default.dateFormatter.format(dateTime, "%m");
        const from = Helper_1.default.dateFormatter.format(dateTime, "%y-%m-%d 00:00:00");
        const to = Helper_1.default.dateFormatter.format(dateTime, "%y-%m-%d 23:59:59");
        const where = "WHERE ut_updated >=\"" + from + "\" AND ut_updated <=\"" + to + "\"";
        const currencies = await GD_1.GD.S_REQ_MYSQL_QUERY.request({
            query: "SELECT DISTINCT(`currency`) as `currency`  FROM `trx_" + month + "` " + where,
            fields: {}
        });
        if (currencies.err) {
            return {
                error: Error_1.default.DB_ERR,
                data: null
            };
        }
        if (!currencies.data || !Array.isArray(currencies.data)) {
            return {
                error: Error_1.default.DB_ERR,
                data: null
            };
        }
        if (currencies.data.length < 1) {
            return {
                error: null,
                data: []
            };
        }
        const transaction = await GD_1.GD.S_REQ_MYSQL_QUERY.request({
            query: "SELECT COUNT(`id`) as `trx`  FROM `trx_" + month + "` " + where,
            fields: {}
        });
        if (transaction.err) {
            return {
                error: Error_1.default.DB_ERR,
                data: null
            };
        }
        const queries = [];
        const maxrQueries = [];
        for (let i of currencies.data) {
            const w = where + " AND `currency`=\"" + i.currency + "\"";
            queries.push({
                query: "SELECT SUM(`amount`) as `a` FROM `trx_" + month + "` " + w,
                fields: {}
            });
            maxrQueries.push({
                query: "SELECT MAX(`rate`) as `r` FROM `trx_" + month + "` " + w,
                fields: {}
            });
        }
        const amounts = await GD_1.GD.S_REQ_MYSQL_QUERY.request(queries);
        if (amounts.err) {
            return {
                error: Error_1.default.DB_ERR,
                data: null
            };
        }
        let rates;
        if (maxrQueries.length > 0) {
            rates = await GD_1.GD.S_REQ_MYSQL_QUERY.request(maxrQueries);
            if (rates.err) {
                return {
                    error: Error_1.default.DB_ERR,
                    data: null
                };
            }
        }
        if (!rates) {
            return {
                error: Error_1.default.BALANCE_NO_RATES,
                data: null
            };
        }
        const amountFinal = [];
        for (let i of amounts.data) {
            amountFinal.push(Array.isArray(i) ? i[0] : i);
        }
        const ratesFinal = [];
        for (let i of rates.data) {
            ratesFinal.push(Array.isArray(i) ? i[0] : i);
        }
        for (let i of amountFinal) {
            for (let j of ratesFinal) {
                if (j.currency === i.currency) {
                    i.rate = j.rate;
                    break;
                }
            }
        }
        const today = new Date();
        const theday = Helper_1.default.dateFormatter.getDate(dateTime);
        if ((today.getFullYear() !== theday.getFullYear()) || (Helper_1.default.dateFormatter.getDayOfYear(today) != Helper_1.default.dateFormatter.getDayOfYear(theday))) {
            GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
                table: "stat_revenue",
                fields: [
                    { name: "type", value: "daily" },
                    { name: "value", value: JSON.stringify(amountFinal) },
                    { name: "date", value: Helper_1.default.dateFormatter.format(theday, "%y-%m-%d") }
                ],
                onUpdate: [
                    { name: "value", value: JSON.stringify(amountFinal).replaceAll('"', '\\"') },
                ]
            });
        }
        return {
            error: null,
            data: amountFinal
        };
    }
}
exports.default = Balance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFsYW5jZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvQmFsYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlDQUE4QjtBQUM5QiwwREFBa0M7QUFDbEMsbUVBQTRDO0FBQzVDLGdFQUF3QztBQUd4QyxNQUFNLE9BQVEsU0FBUSxxQkFBVztJQUM3QixNQUFNLEdBQWlCLElBQUksQ0FBQztJQUU1QjtRQUNJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNwQixDQUFDO0lBQ0QsS0FBSyxDQUFDLElBQUk7UUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sT0FBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBQ25DLFFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBQztZQUNqQixLQUFLLGVBQWU7Z0JBQ3BCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNyQztRQUNELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUF5QjtRQU16QyxJQUFJLFFBQVEsR0FBSSxNQUFNLENBQUMsSUFBdUIsQ0FBQyxHQUFHLENBQUM7UUFDbkQsSUFBRyxDQUFDLFFBQVEsSUFBSSxRQUFRLEdBQUMsQ0FBQztZQUN0QixRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBSzNCLE1BQU0sS0FBSyxHQUFHLGdCQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUMsSUFBSSxDQUFDLENBQUM7UUFDekQsTUFBTSxJQUFJLEdBQUcsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sRUFB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