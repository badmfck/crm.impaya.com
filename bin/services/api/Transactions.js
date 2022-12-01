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
            query: "SELECT * FROM trx_11 ORDER BY `ut_updated` DESC LIMIT 100",
            fields: {}
        });
        if (mysql.err) {
            return {
                error: Error_1.default.DB_ERR,
                data: null
            };
        }
        if (!Array.isArray(mysql.data) || mysql.data.length < 1) {
            return { error: null, data: [] };
        }
        const clientsData = await GD_1.GD.S_CLIENTS_REQUEST.request();
        const solutionsData = await GD_1.GD.S_SOLUTIONS_REQUEST.request();
        for (let i of mysql.data) {
            const t = i;
            if (!clientsData.err) {
                i.merchant = clientsData.merchants.get(i.merchant_id);
                if (!i.merchant) {
                    i.merchant = {
                        id: i.merchant_id,
                        name: "Unknown_" + i.merchant_id,
                        client_id: -1,
                        client: {
                            id: -1,
                            name: "Unknown?"
                        }
                    };
                }
            }
            if (!solutionsData.err && solutionsData.solutuions) {
                i.solution = solutionsData.solutuions.get(i.psys_alias);
            }
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
                value: "FROM_UNIXTIME(" + (trx.timestamp ?? 0) + ")",
                system: true
            },
            {
                name: "owner",
                value: packet.user.uid
            }
        ];
        let monthTimestamp = +new Date();
        let createdTimestamp = 0;
        for (let i in trx.transaction) {
            if (i === "ut_created" || i === "ut_updated") {
                fields.push({
                    name: i,
                    value: "FROM_UNIXTIME(" + trx.transaction[i] + ")",
                    system: true
                });
                if (i === "ut_created")
                    createdTimestamp = parseInt(trx.transaction[i]);
            }
            else {
                fields.push({
                    name: i,
                    value: trx.transaction[i]
                });
            }
            if (i === this.config.MAJOR_DB_DATE_FIELD)
                monthTimestamp = parseInt(trx.transaction[i]);
        }
        let month = Helper_1.default.dateFormatter.format(monthTimestamp, "%m");
        const cM = Helper_1.default.dateFormatter.format(createdTimestamp, "%m");
        if (cM !== month) {
            console.log("Month is different then created time month, using created time");
            month = cM;
        }
        const result = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table: "trx_" + month,
            fields: fields,
            onUpdate: [
                {
                    name: "status_id",
                    value: trx.transaction.status_id
                },
                {
                    name: "ut_updated",
                    value: "FROM_UNIXTIME(" + trx.transaction.ut_updated + ")",
                    system: true
                },
                {
                    name: "update_cnt",
                    value: "`update_cnt`+1",
                    system: true
                },
                {
                    name: "rate",
                    value: trx.transaction.rate
                },
                {
                    name: "psys_alias",
                    value: trx.transaction.psys_alias
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNhY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9UcmFuc2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxpQ0FBOEI7QUFDOUIsMERBQWtDO0FBQ2xDLG1FQUE0QztBQUM1QyxnRUFBd0M7QUFFeEMsTUFBTSxZQUFhLFNBQVEscUJBQVc7SUFFbEMsTUFBTSxHQUFpQixJQUFJLENBQUM7SUFFNUI7UUFDSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sT0FBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBRW5DLFFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBQztZQUNqQixLQUFLLEtBQUs7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLEtBQUssU0FBUztnQkFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0I7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBd0I7UUFJbEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxPQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO1lBQzlDLEtBQUssRUFBQywyREFBMkQ7WUFDakUsTUFBTSxFQUFDLEVBQUU7U0FDWixDQUFDLENBQUE7UUFFRixJQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUM7WUFDVCxPQUFPO2dCQUNILEtBQUssRUFBQyxlQUFNLENBQUMsTUFBTTtnQkFDbkIsSUFBSSxFQUFDLElBQUk7YUFDWixDQUFBO1NBQ0o7UUFFRCxJ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