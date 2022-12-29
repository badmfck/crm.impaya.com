"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Helper_1 = __importDefault(require("../../Helper"));
const Error_1 = __importDefault(require("../../structures/Error"));
const ConcurencyLoader_1 = __importDefault(require("../../utils/ConcurencyLoader"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Solutions extends BaseHandler_1.default {
    solutionTypes = new ConcurencyLoader_1.default();
    solutions = new ConcurencyLoader_1.default();
    constructor() {
        super("Solutions");
        this.solutions.setLoadingProcedure = async () => {
            let sql = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `solutions` WHERE `status` = \"active\" LIMIT 1000",
                fields: {}
            });
            if (sql.err || !sql.data || sql.data.length === 0) {
                return {
                    error: Error_1.default.SOLUTIONS_CANT_LOAD,
                    data: null
                };
            }
            const sol = sql.data;
            const ids = [];
            for (let i of sol) {
                ids.push(i.id);
            }
            sql = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: `SELECT * FROM \`pay_services\` WHERE \`status\`="active" AND \`solution_id\` in (${ids.join(",")})`,
                fields: {}
            });
            if (sql.err || !sql.data) {
                return {
                    error: Error_1.default.PAYSERVICES_CANT_LOAD,
                    data: null
                };
            }
            const payservices = sql.data;
            sql = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: `SELECT * FROM \`contacts\` WHERE \`target_id\` in (${ids.join(",")})`,
                fields: {}
            });
            if (sql.err || !sql.data) {
                return {
                    error: Error_1.default.CONTACTS_CANT_LOAD,
                    data: null
                };
            }
            const contacts = sql.data;
            const solutions = [];
            for (let i of sol) {
                let c = null;
                if (contacts && Array.isArray(contacts)) {
                    for (let j = 0; j < contacts.length; j++) {
                        if (contacts[j].target_id === i.id) {
                            c = contacts[j];
                            contacts.splice(j, 1);
                            break;
                        }
                    }
                }
                const p = [];
                if (payservices && Array.isArray(payservices)) {
                    for (let j = 0; j < payservices.length; j++) {
                        if (payservices[j].solution_id === i.id) {
                            p.push(payservices[j]);
                            payservices.splice(j, 1);
                            break;
                        }
                    }
                }
                const s = {
                    id: i.id,
                    ctime: i.ctime,
                    utime: i.utime,
                    common: {
                        name: i.name,
                        type_id: i.type_id
                    },
                    contacts: c,
                    services: p
                };
                solutions.push(s);
            }
            return {
                error: null,
                data: solutions
            };
        };
        GD_1.GD.S_SOLUTIONS_REQUEST.listener = (data, cb) => {
            this.solutions.load(cb);
        };
        this.solutionTypes.setLoadingProcedure = async () => {
            const sql = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `solution_types` @NOLIMIT",
                fields: {}
            });
            let result = null;
            let err = null;
            if (sql && sql.data && Array.isArray(sql.data)) {
                result = sql.data;
            }
            else {
                err = Error_1.default.SOLUTIONS_CANT_LOAD_TYPES;
                console.error(sql.err);
            }
            return { error: err, data: result };
        };
        GD_1.GD.S_SOLUTION_TYPES_REQUEST.listener = (data, cb) => {
            this.solutionTypes.load(cb);
        };
    }
    execute(packet) {
        switch (packet.method) {
            case "get":
                return this.get(packet);
            case "update":
                return this.update(packet);
            case "getTypes":
                return this.getTypes(packet);
        }
        return super.execute(packet);
    }
    async getTypes(packet) {
        const types = await GD_1.GD.S_SOLUTION_TYPES_REQUEST.request();
        return types;
    }
    async update(packet) {
        const sol = this.createSolutionVO(packet);
        if (!sol) {
            return {
                error: Error_1.default.SOLUTIONS_WRONG_SOLUTION_OBJECT,
                data: null
            };
        }
        let action = "add";
        if (sol.id > 0) {
            action = "update";
            return {
                error: Error_1.default.NO_METHOD_IMPLEMENTATION,
                data: "NO METHOD FOR UPDATE"
            };
        }
        const hash = Helper_1.default.passhash(sol.common.name.toLowerCase() + "_" + sol.common.type_id);
        let sql = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table: "solutions",
            fields: [
                { name: "name", value: sol.common.name },
                { name: "type_id", value: sol.common.type_id },
                { name: "hash", value: hash }
            ]
        });
        if (sql.err) {
            if (`${sql.err}`.indexOf("Duplicate entry") !== 1) {
                return {
                    error: Error_1.default.SOLUTION_CANT_SAVE_DUPLICATE,
                    data: null
                };
            }
        }
        sol.id = sql.data.insertId;
        sql = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table: "contacts",
            fields: [
                { name: "target_id", value: sol.id },
                { name: "country", value: sol.contacts.country },
                { name: "city", value: sol.contacts.city },
                { name: "street", value: sol.contacts.street },
                { name: "zip", value: sol.contacts.zip },
                { name: "email", value: sol.contacts.email },
                { name: "phone", value: sol.contacts.phone },
                { name: "type", value: "solution" },
            ],
            onUpdate: [
                { name: "country", value: sol.contacts.country },
                { name: "city", value: sol.contacts.city },
                { name: "street", value: sol.contacts.street },
                { name: "zip", value: sol.contacts.zip },
                { name: "email", value: sol.contacts.email },
                { name: "phone", value: sol.contacts.phone },
            ]
        });
        let contactsError = null;
        if (sql.err) {
            contactsError = Error_1.default.SOLUTIONS_CANT_SAVE_CONTACT_INFO;
        }
        else {
            sol.contacts.id = sql.data.insertId;
        }
        let serviceErrors = [];
        if (Array.isArray(sol.services)) {
            for (let i of sol.services) {
                let alias = i.alias;
                if (!alias || alias.length === 0)
                    alias = null;
                if (alias) {
                    let sql = await GD_1.GD.S_REQ_MYSQL_QUERY.request({
                        query: "SELECT `alias` FROM pay_services where alias=@alias LIMIT 1",
                        fields: { alias: alias }
                    });
                    if (sql.err) {
                        serviceErrors.push({
                            id: i.id,
                            error: Error_1.default.SOLUTIONS_CANT_CHECK_PAYSERVICE_ALIAS
                        });
                        continue;
                    }
                    if (sql.data.length > 0) {
                        serviceErrors.push({
                            id: i.id,
                            error: Error_1.default.SOLUTIONS_PAYSERVICE_ALIAS_ALREADY_EXISTS
                        });
                        continue;
                    }
                }
                const fields = [
                    { name: "solution_id", value: sol.id },
                    { name: "service_id", value: i.service_id },
                    { name: "currency_id", value: i.currency_id },
                    { name: "alias", value: alias },
                    { name: "fee_proc", value: i.fee_proc },
                    { name: "fix_success", value: i.fix_success },
                    { name: "fix_decline", value: i.fix_decline },
                    { name: "fx_fee", value: i.fx_fee },
                    { name: "chargeback", value: i.chargeback },
                    { name: "refund", value: i.refund },
                    { name: "settlement_fee_proc", value: i.settlement_fee_proc },
                    { name: "settlement_fee", value: i.settlement_fee },
                    { name: "rolling_proc", value: i.rolling_proc },
                    { name: "rolling_period", value: i.rolling_period },
                    { name: "rolling_deposit", value: i.rolling_deposit }
                ];
                const hash = Helper_1.default.passhash(sol.id + "_" + i.service_id + "_" + i.currency_id);
                let sql = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
                    table: "pay_services",
                    fields: [...fields, { name: "hash", value: hash }],
                    onUpdate: fields
                });
                if (sql.err) {
                    serviceErrors.push({
                        id: i.id,
                        error: Error_1.default.SOLUTIONS_PAYSERVICE_SAVE_ERROR
                    });
                    continue;
                }
                i.id = sql.data.insertId;
                if (alias === null) {
                    alias = Helper_1.default.passhash(sol.common.name + "_" + sol.common.type_id + "_" + hash);
                    const updatesql = await GD_1.GD.S_REQ_MYSQL_QUERY.request({
                        query: "UPDATE pay_services SET alias = \"@alias\" WHERE id=\"@id\"",
                        fields: { alias: alias, id: i.id }
                    });
                    if (!updatesql.err)
                        i.alias = alias;
                    else {
                        serviceErrors.push({
                            id: i.id,
                            error: Error_1.default.SOLUTIONS_PAYSERVICE_CANT_UPDATE_ALIAS
                        });
                    }
                }
            }
        }
        if (!contactsError && !serviceErrors) {
        }
        return {
            error: null,
            data: {
                contactsError: contactsError,
                serviceErrors: serviceErrors,
                solution: sol
            }
        };
    }
    async get(packet) {
        let solution_id = -1;
        if (packet.data && typeof packet.data === "object" && packet.data.solution_id) {
            solution_id = parseInt(packet.data.solution_id);
        }
        const sols = await GD_1.GD.S_SOLUTIONS_REQUEST.request();
        if (sols.error || solution_id < 1) {
            return sols;
        }
        if (!sols.data) {
            return {
                error: Error_1.default.SOLUTIONS_WRONG_SOLUTION_OBJECT,
                data: null
            };
        }
        for (let i of sols.data) {
            if (i.id === solution_id) {
                return {
                    error: null,
                    data: i
                };
            }
        }
        return {
            error: Error_1.default.SOLUTIONS_CANT_FIND_SPECIFIC_SOLUTION,
            data: { solution_id: solution_id }
        };
    }
    createSolutionVO(packet) {
        const sol = packet.data;
        return sol;
    }
}
exports.default = Solutions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29sdXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9Tb2x1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxpQ0FBOEI7QUFDOUIsMERBQWtDO0FBQ2xDLG1FQUE0QztBQUM1QyxvRkFBNEQ7QUFHNUQsZ0VBQXdDO0FBRXhDLE1BQU0sU0FBVSxTQUFRLHFCQUFXO0lBRS9CLGFBQWEsR0FBK0MsSUFBSSwwQkFBZ0IsRUFBRSxDQUFBO0lBQ2xGLFNBQVMsR0FBZ0MsSUFBSSwwQkFBZ0IsRUFBRSxDQUFDO0lBR2hFO1FBQ0ksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBRWxCLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEdBQUMsS0FBSyxJQUFHLEVBQUU7WUFHekMsSUFBSSxHQUFHLEdBQUcsTUFBTSxPQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO2dCQUMxQyxLQUFLLEVBQUUsa0VBQWtFO2dCQUN6RSxNQUFNLEVBQUMsRUFBRTthQUNaLENBQUMsQ0FBQTtZQUVGLElBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUcsQ0FBQyxFQUFDO2dCQUMzQyxPQUFPO29CQUNILEtBQUssRUFBQyxlQUFNLENBQUMsbUJBQW1CO29CQUNoQyxJQUFJLEVBQUMsSUFBSTtpQkFDWixDQUFBO2FBQ0o7WUFFRCxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ3JCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtZQUNkLEtBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFDO2dCQUNiLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ2xCO1lBRUQsR0FBRyxHQUFHLE1BQU0sT0FBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FB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