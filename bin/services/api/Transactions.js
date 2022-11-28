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
    config = null;
    constructor() {
        super("Transaxtions (trx)");
    }
    async init() {
        this.config = await GD_1.GD.S_CONFIG_REQUEST.request();
    }
    async execute(packet) {
        switch (packet.method) {
            case "add":
                return this.add(packet);
            case "request":
                return this.request(packet);
        }
        return super.execute(packet);
    }
    async request(packet) {
        const mysql = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
            query: "SELECT * FROM trx_11 LIMIT 100",
            fields: {}
        });
        if (mysql.err) {
            return {
                error: Error_1.default.DB_ERR,
                data: null
            };
        }
        return { error: null, data: mysql.data };
    }
    async add(packet) {
        if (packet.httpMethod !== "post") {
            return {
                error: Error_1.default.WRONG_HTTP_METHOD,
                data: null
            };
        }
        if (!packet.user || packet.user.uid !== this.config?.IMPAYA_SERVER_USER_UID) {
            return {
                error: Error_1.default.WRONG_SERVER_USER,
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
        if (!trx.transaction || !trx.transaction.status_id) {
            return {
                error: Error_1.default.TRX_NO_TRANSACTION_STATUS,
                data: null
            };
        }
        const fields = [
            {
                name: "ctime",
                value: "!@FROM_UNIXTIME(" + (trx.timestamp ?? 0) + ")"
            },
            {
                name: "data",
                value: trx.branch + ", " + packet.user?.login + "@" + packet.ip + ", trx." + packet.method
            }
        ];
        for (let i in trx.transaction) {
            if (i === "ut_created" || i === "ut_updated") {
                fields.push({
                    name: i,
                    value: "!@FROM_UNIXTIME(" + trx.transaction[i] + ")"
                });
            }
            else {
                fields.push({
                    name: i,
                    value: trx.transaction[i]
                });
            }
        }
        const result = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table: "trx_" + Helper_1.default.dateFormatter.format(new Date(), "%m"),
            fields: fields,
            onUpdate: [
                {
                    name: "status_id",
                    value: trx.transaction.status_id
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNhY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9UcmFuc2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxpQ0FBOEI7QUFDOUIsMERBQWtDO0FBQ2xDLG1FQUE0QztBQUM1QyxnRUFBd0M7QUFFeEMsTUFBTSxZQUFhLFNBQVEscUJBQVc7SUFDbEMsTUFBTSxHQUFpQixJQUFJLENBQUM7SUFFNUI7UUFDSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sT0FBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBRW5DLFFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBQztZQUNqQixLQUFLLEtBQUs7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLEtBQUssU0FBUztnQkFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0I7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBd0I7UUFJbEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxPQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO1lBQzlDLEtBQUssRUFBQyxnQ0FBZ0M7WUFDdEMsTUFBTSxFQUFDLEVBQUU7U0FDWixDQUFDLENBQUE7UUFFRixJQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUM7WUFDVCxPQUFPO2dCQUNILEtBQUssRUFBQyxlQUFNLENBQUMsTUFBTTtnQkFDbkIsSUFBSSxFQUFDLElBQUk7YUFDWixDQUFBO1NBQ0o7UUFJRCxP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