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
        let dateTime = packet.data.day;
        if (!dateTime || dateTime < 1)
            dateTime = +new Date();
        const month = Helper_1.default.dateFormatter.format(dateTime, "%m");
        const mysql = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
            query: "SELECT * FROM trx_" + month + " ORDER BY `ut_updated` DESC LIMIT 100",
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
                },
                {
                    name: "ref_transaction_id",
                    value: trx.transaction.ref_transaction_id
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNhY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9UcmFuc2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxpQ0FBOEI7QUFDOUIsMERBQWtDO0FBQ2xDLG1FQUE0QztBQUM1QyxnRUFBd0M7QUFFeEMsTUFBTSxZQUFhLFNBQVEscUJBQVc7SUFFbEMsTUFBTSxHQUFpQixJQUFJLENBQUM7SUFFNUI7UUFDSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUk7UUFDTixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sT0FBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBRW5DLFFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBQztZQUNqQixLQUFLLEtBQUs7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLEtBQUssU0FBUztnQkFDZCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0I7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBd0I7UUFJbEMsSUFBSSxRQUFRLEdBQUksTUFBTSxDQUFDLElBQXVCLENBQUMsR0FBRyxDQUFDO1FBQ25ELElBQUcsQ0FBQyxRQUFRLElBQUksUUFBUSxHQUFDLENBQUM7WUFDdEIsUUFBUSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMzQixNQUFNLEtBQUssR0FBRyxnQkFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFDLElBQUksQ0FBQyxDQUFDO1FBSXpELE1BQU0sS0FBSyxHQUFH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