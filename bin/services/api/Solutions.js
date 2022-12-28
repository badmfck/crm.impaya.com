"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Helper_1 = __importDefault(require("../../Helper"));
const Error_1 = __importDefault(require("../../structures/Error"));
const ConcurencyLoader_1 = __importDefault(require("../../utils/ConcurencyLoader"));
const Signal_1 = __importDefault(require("../../utils/Signal"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Solutions extends BaseHandler_1.default {
    solutionTypes = new ConcurencyLoader_1.default();
    solutions = null;
    loading = false;
    onDataLoaded = new Signal_1.default();
    lastUpdated = 0;
    updateCacheTime = 1000 * 60 * 60 * 24 * 15;
    constructor() {
        super("Solutions");
        GD_1.GD.S_SOLUTIONS_REQUEST.listener = (data, cb) => {
            this.loadSolutions((err) => {
                cb({ solutuions: this.solutions, err: err });
            });
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
                data: Array.from(this.solutions?.values() ?? [])
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
        const hash = Helper_1.default.passhash(sol.common.name.toLowerCase() + "_" + sol.common.type);
        let sql = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table: "solutions",
            fields: [
                { name: "name", value: sol.common.name },
                { name: "type_id", value: sol.common.type },
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
                    alias = Helper_1.default.passhash(sol.common.name + "_" + sol.common.type + "_" + hash);
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
        const data = await GD_1.GD.S_SOLUTIONS_REQUEST.request();
        if (data.err) {
            return {
                error: data.err,
                data: null
            };
        }
        return {
            error: null,
            data: Array.from(this.solutions?.values() ?? [])
        };
    }
    async loadSolutions(cb) {
        if (this.solutions && this.solutions.size > 0) {
            if (+new Date() - this.lastUpdated < this.updateCacheTime) {
                cb(null);
                return;
            }
        }
        this.onDataLoaded.add(cb);
        if (this.loading)
            return;
        this.loading = true;
        let err = null;
        const sols = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
            query: "SELECT * FROM `solutions` @NOLIMIT",
            fields: {}
        });
        if (sols && sols.data && Array.isArray(sols.data)) {
            this.solutions = new Map();
            for (let i of sols.data)
                this.solutions.set(i.alias, i);
        }
        else {
            err = Error_1.default.SOLUTIONS_CANT_LOAD;
            console.error(sols.err);
        }
        this.lastUpdated = +new Date();
        this.loading = false;
        this.onDataLoaded.invoke(err);
        this.onDataLoaded.clear();
    }
    createSolutionVO(packet) {
        const sol = packet.data;
        return sol;
    }
}
exports.default = Solutions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29sdXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9Tb2x1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxpQ0FBOEI7QUFDOUIsMERBQWtDO0FBQ2xDLG1FQUE0QztBQUM1QyxvRkFBNEQ7QUFDNUQsZ0VBQXdDO0FBQ3hDLGdFQUF3QztBQUV4QyxNQUFNLFNBQVUsU0FBUSxxQkFBVztJQUUvQixhQUFhLEdBQStDLElBQUksMEJBQWdCLEVBQUUsQ0FBQTtJQUVsRixTQUFTLEdBQTZCLElBQUksQ0FBQztJQUUzQyxPQUFPLEdBQUMsS0FBSyxDQUFDO0lBQ2QsWUFBWSxHQUFzQixJQUFJLGdCQUFNLEVBQUUsQ0FBQztJQUMvQyxXQUFXLEdBQUMsQ0FBQyxDQUFDO0lBQ2QsZUFBZSxHQUFHLElBQUksR0FBQyxFQUFFLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxFQUFFLENBQUM7SUFFbkM7UUFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUE7UUFFbEIsT0FBRSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsR0FBQyxDQUFDLElBQUksRUFBQyxFQUFFLEVBQUMsRUFBRTtZQUN4QyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBZ0IsRUFBQyxFQUFFO2dCQUNsQyxFQUFFLENBQUMsRUFBQyxVQUFVLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLENBQUMsQ0FBQTtZQUM1QyxDQUFDLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQTtRQUdELElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLEdBQUMsS0FBSyxJQUFHLEVBQUU7WUFDN0MsTUFBTSxHQUFHLEdBQUcsTUFBTSxPQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDO2dCQUM1QyxLQUFLLEVBQUUseUNBQXlDO2dCQUNoRCxNQUFNLEVBQUMsRUFBRTthQUNaLENBQUMsQ0FBQTtZQUNG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