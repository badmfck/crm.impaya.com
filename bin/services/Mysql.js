"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const GD_1 = require("../GD");
const BaseService_1 = __importDefault(require("./base/BaseService"));
class MySQL extends BaseService_1.default {
    reconnectionTimeout = 1000 * 3;
    reconnecting = false;
    pool = null;
    constructor() {
        super("mysql");
        GD_1.GD.S_REQ_MYSQL_SELECT.listener = (request, response) => {
            this.executeSelectQuery(request, response);
        };
        GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.listener = (req, res) => {
            this.executeInsertQuery(req, res);
        };
        GD_1.GD.S_REQ_MYSQL_QUERY.listener = (req, res) => {
            this.executeQuery(req, res);
        };
        this.onServiceReady();
    }
    executeSelectQuery(request, response) {
        let q = request.query;
        for (let i in request.fields) {
            const val = `${request.fields[i]}`.replaceAll('"', '\\"');
            q = q.replaceAll("@" + i, val);
        }
        if (q.toLowerCase().indexOf("limit") === -1)
            q += " LIMIT 100";
        this.execute(q, response);
    }
    executeInsertQuery(query, response) {
        const rawQuery = this.prepareInsertQuery(query);
        this.execute(rawQuery, response);
    }
    executeQuery(query, response) {
        const rawQuery = this.prepareQuery(query);
        this.execute(rawQuery, response);
    }
    execute(query, response) {
        if (!this.pool) {
            console.error("NO POOL");
            response({
                err: "No connections pool",
                data: null,
                fields: null
            });
            return;
        }
        this.pool.getConnection((err, conn) => {
            if (err) {
                console.error(`${err}`);
                response({
                    err: err,
                    data: null,
                    fields: null
                });
                return;
            }
            console.log(query);
            conn.query(query, (err, res, fields) => {
                conn.release();
                conn.removeAllListeners();
                if (err) {
                    console.error(`${err}`);
                    response({
                        err: err,
                        data: null,
                        fields: null
                    });
                    return;
                }
                response({
                    err: err,
                    data: res,
                    fields: fields
                });
            });
            conn.on("error", err => {
                console.error(`${err}`);
                conn.removeAllListeners();
                response({
                    err: err,
                    data: null,
                    fields: null
                });
            });
        });
    }
    prepareInsertQuery(q) {
        if (!Array.isArray(q))
            q = [q];
        let rawQuery = "";
        for (let query of q) {
            const names = query.fields.map(val => "`" + val.name + "`").join(",");
            const values = query.fields.map(val => val.value ? ("\"" + val.value.replaceAll('"', '\\"') + "\"") : null).join(",");
            if (rawQuery.length > 0)
                rawQuery += ";\n";
            rawQuery += `INSERT INTO \`${query.table}\` (${names}) VALUES (${values})`;
        }
        return rawQuery;
    }
    prepareQuery(q) {
        if (!Array.isArray(q))
            q = [q];
        let rawQuery = "";
        for (let query of q) {
            let tmp = query.query;
            for (let i in query.fields) {
                const val = `${query.fields[i]}`.replaceAll('"', '\\"');
                tmp = tmp.replaceAll("@" + i, val);
            }
            if (tmp.toLowerCase().indexOf("select") === 0 && tmp.toLowerCase().indexOf("limit") === -1)
                tmp += " LIMIT 100";
            if (rawQuery.length > 0)
                rawQuery += ";\n";
            rawQuery += tmp;
        }
        return rawQuery;
    }
    async onApplicationReady() {
        this.createPool();
    }
    async createPool() {
        const cfg = await GD_1.GD.S_CONFIG_REQUEST.request();
        console.log("Connecting to mysql");
        this.pool = mysql_1.default.createPool({
            connectionLimit: cfg.SQL_MAX_CONNECTIONS,
            host: cfg.SQL_HOST,
            user: cfg.SQL_USER,
            password: cfg.SQL_PASSWD,
            port: cfg.SQL_PORT,
            database: "crm",
            multipleStatements: true
        });
    }
}
exports.default = MySQL;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlzcWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvTXlzcWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxrREFBd0M7QUFDeEMsOEJBQTJCO0FBQzNCLHFFQUE2QztBQUU3QyxNQUFNLEtBQU0sU0FBUSxxQkFBVztJQUUzQixtQkFBbUIsR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDO0lBQzNCLFlBQVksR0FBQyxLQUFLLENBQUM7SUFDbkIsSUFBSSxHQUFXLElBQUksQ0FBQztJQUVwQjtRQUNJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLE9BQUUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEdBQUMsQ0FBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLEVBQUU7WUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUE7UUFFRCxPQUFFLENBQUMsd0JBQXdCLENBQUMsUUFBUSxHQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFBO1FBRUQsT0FBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRTtZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUE7UUFFRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELGtCQUFrQixDQUFDLE9BQTBCLEVBQUMsUUFBaUM7UUFDM0UsSUFBSSxDQUFDLEdBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUNyQixLQUFJLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUM7WUFDeEIsTUFBTSxHQUFHLEdBQUcsR0FB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