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
        this.createPool();
        this.onServiceReady();
    }
    async onApplicationReady() {
    }
    executeSelectQuery(request, response) {
        let q = request.query;
        for (let i in request.fields) {
            const val = `${request.fields[i]}`.replaceAll('"', '\\"');
            q = q.replaceAll("@" + i, val);
        }
        if (q.toLowerCase().indexOf("limit") === -1)
            q += " LIMIT 100";
        q = q.replaceAll("@NOLIMIT", "");
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
        try {
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
                try {
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
                        return;
                    });
                }
                catch (e) {
                    if (conn)
                        conn.removeAllListeners();
                    response({
                        err: e,
                        data: null,
                        fields: null
                    });
                    return;
                }
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
        catch (e) {
            response({
                err: e,
                data: null,
                fields: null
            });
        }
    }
    prepareInsertQuery(q) {
        if (!Array.isArray(q))
            q = [q];
        let rawQuery = "";
        for (let query of q) {
            const fields = [];
            for (let i of query.fields) {
                if (i.value)
                    fields.push(i);
            }
            const names = fields.map(val => {
                let name = val.name;
                name = name.replaceAll(/[^a-zA-Z0-9_\-]/gi, '');
                return '`' + name + '`';
            }).join(",");
            const values = fields.map(field => {
                let val = field;
                if (!val.system && typeof val.value === "string") {
                    val.value = val.value ? val.value.replaceAll('"', '\\"') : null;
                    val.value = '"' + val.value + '"';
                }
                return val.value;
            }).join(",");
            let updateQuery = "";
            if (query.onUpdate && Array.isArray(query.onUpdate) && query.onUpdate.length > 0) {
                updateQuery = "ON DUPLICATE KEY UPDATE ";
                let j = 0;
                for (let i of query.onUpdate) {
                    if (j > 0)
                        updateQuery += ",";
                    if (typeof i.value === "string" && i.system) {
                        updateQuery += " `" + i.name + "` = " + i.value;
                    }
                    else
                        updateQuery += " `" + i.name + "` = \"" + i.value + '" ';
                    j++;
                }
            }
            if (rawQuery.length > 0)
                rawQuery += ";\n";
            rawQuery += `INSERT INTO \`${query.table}\` (${names}) VALUES (${values}) ${updateQuery}`;
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
    async createPool() {
        const cfg = await GD_1.GD.S_CONFIG_REQUEST.request();
        console.log("Connecting to mysql");
        try {
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
        catch (e) {
            console.error(e);
        }
    }
}
exports.default = MySQL;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTXlzcWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvTXlzcWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSxrREFBd0M7QUFDeEMsOEJBQTJCO0FBQzNCLHFFQUE2QztBQUU3QyxNQUFNLEtBQU0sU0FBUSxxQkFBVztJQUUzQixtQkFBbUIsR0FBQyxJQUFJLEdBQUMsQ0FBQyxDQUFDO0lBQzNCLFlBQVksR0FBQyxLQUFLLENBQUM7SUFDbkIsSUFBSSxHQUFXLElBQUksQ0FBQztJQUVwQjtRQUNJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVmLE9BQUUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEdBQUMsQ0FBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLEVBQUU7WUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBQyxRQUFRLENBQUMsQ0FBQztRQUM5QyxDQUFDLENBQUE7UUFFRCxPQUFFLENBQUMsd0JBQXdCLENBQUMsUUFBUSxHQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFBO1FBRUQsT0FBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRTtZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUE7UUFFRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCO0lBRXhCLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxPQUEwQixFQUFDLFFBQWlDO1FBQzNFLElBQUksQ0FBQyxHQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDckIs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