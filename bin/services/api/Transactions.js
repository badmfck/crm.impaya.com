"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Helper_1 = __importDefault(require("../../Helper"));
const Error_1 = __importDefault(require("../../structures/Error"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Transactions extends BaseHandler_1.default {
    constructor() {
        super("Transaxtions (trx)");
    }
    async init() { }
    async execute(packet) {
        switch (packet.method) {
            case "add":
                return this.add(packet);
        }
        return super.execute(packet);
    }
    async add(packet) {
        if (packet.httpMethod !== "post") {
            return {
                error: Error_1.default.WRONG_HTTP_METHOD,
                data: null
            };
        }
        const trx = this.createTransactionVO(packet.data);
        if (!trx.branch || trx.branch !== "impaya") {
            return {
                error: Error_1.default.TRX_WRONG_BRANCH,
                data: null
            };
        }
        const trxdata = (typeof trx.transaction === "string") ? trx.transaction : JSON.stringify(trx.transaction);
        const result = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table: "trx_" + Helper_1.default.dateFormatter.format(new Date(), "%m"),
            fields: [
                {
                    name: "data",
                    value: trxdata
                }
            ]
        });
        let status = "packet_saved";
        let success = true;
        let reason = null;
        if (result.err) {
            reason = `${result.err}`;
            console.error(reason);
            success = false;
            status = "can't store packet";
            console.error("Can't add trx ID");
        }
        return {
            error: null,
            data: {
                success: success,
                status: status,
                reason: reason
            }
        };
    }
    createTransactionVO(packet) {
        return {
            branch: packet.branch,
            timestamp: packet.timestamp,
            transaction: packet.transaction
        };
    }
}
exports.default = Transactions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNhY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9UcmFuc2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxpQ0FBOEI7QUFDOUIsMERBQWtDO0FBQ2xDLG1FQUE0QztBQUM1QyxnRUFBd0M7QUFFeEMsTUFBTSxZQUFhLFNBQVEscUJBQVc7SUFDbEM7UUFDSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBQ0QsS0FBSyxDQUFDLElBQUksS0FBSSxDQUFDO0lBRWYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUF5QjtRQUVuQyxRQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUM7WUFDakIsS0FBSyxLQUFLO2dCQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzQjtRQUNELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBR0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUF5QjtRQUMvQixJQUFHLE1BQU0sQ0FBQyxVQUFVLEtBQUcsTUFBTSxFQUFDO1lBQzFCLE9BQU87Z0JBQ0gsS0FBSyxFQUFDLGVBQU0sQ0FBQyxpQkFBaUI7Z0JBQzlCLElBQUksRUFBQyxJQUFJO2FBQ1osQ0FBQTtTQUNKO1FBRUQsTUFBTSxHQUFHLEdBQWdCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBVyxDQUFDLENBQUM7UUFDdEUsSUFBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxRQUFRLEVBQUM7WUFDdEMsT0FBTztnQkFDSCxLQUFLLEVBQUMsZUFBTSxDQUFDLGdCQUFnQjtnQkFDN0IsSUFBSSxFQUFDLElBQUk7YUFDWixDQUFBO1NBQ0o7UUFhRCxNQUFNLE9BQU8sR0FBRyxDQUFDLE9BQU8sR0FBRyxDQUFDLFdBQVcsS0FBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFFeEcsTUFBTSxNQUFNLEdBQUcsTUFBTSxPQUFFLENBQUMsd0JBQXdCLENBQUMsT0FBTyxDQUNwRDtZQUNJLEtBQUssRUFBQyxNQUFNLEdBQUMsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUMsSUFBSSxDQUFDO1lBQ3pELE1BQU0sRUFBQztnQkFDSDtvQkFDSSxJQUFJLEVBQUMsTUFBTTtvQkFDWCxLQUFLLEVBQUMsT0FBTztpQkFDaEI7YUFDSjtTQUNKLENBQ0osQ0FBQTtRQUVELElBQUksTUFBTSxHQUFDLGNBQWMsQ0FBQTtRQUN6QixJQUFJLE9BQU8sR0FBQyxJQUFJLENBQUM7UUFDakIsSUFBSSxNQUFNLEdBQUMsSUFBSSxDQUFDO1FBQ2hCLElBQUcsTUFBTSxDQUFDLEdBQUcsRUFBQztZQUdWLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUN4QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBRXJCLE9BQU8sR0FBQyxLQUFLLENBQUM7WUFDZCxNQUFNLEdBQUMsb0JBQW9CLENBQUM7WUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1NBQ3BDO1FBSUQsT0FBTztZQUNILEtBQUssRUFBQyxJQUFJO1lBQ1YsSUFBSSxFQUFDO2dCQUNELE9BQU8sRUFBQyxPQUFPO2dCQUNmLE1BQU0sRUFBQyxNQUFNO2dCQUNiLE1BQU0sRUFBQyxNQUFNO2FBQ2hCO1NBQ0osQ0FBQTtJQUNMLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxNQUFVO1FBQzFCLE9BQU87WUFDSCxNQUFNLEVBQUMsTUFBTSxDQUFDLE1BQU07WUFDcEIsU0FBUyxFQUFDLE1BQU0sQ0FBQyxTQUFTO1lBQzFCLFdBQVcsRUFBQyxNQUFNLENBQUMsV0FBVztTQUNqQyxDQUFBO0lBQ0wsQ0FBQztDQUVKO0FBQ0Qsa0JBQWUsWUFBWSxDQUFDIn0=