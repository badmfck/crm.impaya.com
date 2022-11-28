"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
const Error_1 = __importDefault(require("../../structures/Error"));
const GD_1 = require("../../GD");
const Helper_1 = __importDefault(require("../../Helper"));
class Auth extends BaseHandler_1.default {
    users = new Map();
    keys = new Map();
    constructor() {
        super("Auth");
    }
    async init() { }
    async execute(packet) {
        if (packet.httpMethod !== "post") {
            return {
                error: Error_1.default.WRONG_HTTP_METHOD,
                data: null
            };
        }
        switch (packet.method) {
            case "login":
                return this.login(packet);
            case "addUser":
                return this.addUser(packet);
            case "getIP":
                return this.getIP(packet);
            case "check":
                return this.check(packet);
        }
        return super.execute(packet);
    }
    async check(packet) {
        if (!packet.user) {
            return {
                error: Error_1.default.UNAUTHORIZED_ACCESS,
                data: null
            };
        }
        return {
            error: null,
            data: true
        };
    }
    async getIP(packet) {
        return {
            error: null,
            data: {
                ip: packet.ip,
                method: packet.httpMethod,
                headers: packet.headers
            }
        };
    }
    async addUser(packet) {
        if (!packet.user || !packet.user.role_admin) {
            return {
                error: Error_1.default.UNAUTHORIZED_ACCESS,
                data: null
            };
        }
        const request = packet.data;
        const validationError = this.validateLoginAndPass(request);
        if (validationError != null)
            return validationError;
        const displayName = request.displayName ?? request.login;
        const userUID = Helper_1.default.generateUID();
        const queries = [];
        queries.push({
            table: "users",
            fields: [
                { name: "uid", value: userUID },
                { name: "login", value: request.login },
                { name: "passwd", value: Helper_1.default.passhash(request.password) },
                { name: "display_name", value: displayName },
                { name: "phone", value: request.phone ?? "??" },
                { name: "mail", value: request.mail ?? "??" }
            ]
        });
        const resp = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request(queries);
        return {
            error: resp.err ? Error_1.default.AUTH_USER_NOT_ADDED : null,
            data: resp.err ? `${resp.err}` : null
        };
    }
    async login(packet) {
        const request = packet.data;
        const validationError = this.validateLoginAndPass(request);
        if (validationError != null)
            return validationError;
        const res = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
            query: 'SELECT * FROM users WHERE login="@login" AND passwd="@password" LIMIT 1',
            fields: { login: request.login, password: Helper_1.default.passhash(request.password) }
        });
        if (!res.data || !Array.isArray(res.data) || res.data.length !== 1) {
            if (res.err) {
                return {
                    error: Error_1.default.DB_ERR,
                    data: res.err
                };
            }
            return {
                error: Error_1.default.AUTH_WRONG_LOGIN_OR_PASSWD,
                data: res.err ? res.err : null
            };
        }
        if (parseInt(res.data[0].atime) < 1)
            res.data[0].atime = +new Date();
        const user = this.createUserVO(res.data[0]);
        if (user.locked) {
            return {
                error: Error_1.default.AUTH_USER_LOCKED,
                data: null
            };
        }
        if (!user.uid) {
            return {
                error: Error_1.default.AUTH_DAMAGED_USER,
                data: null
            };
        }
        const keyscount = await GD_1.GD.S_REQ_MYSQL_QUERY.request({
            query: "SELECT COUNT(`id`) as `count` from `auth` WHERE `user_uid` = \"@userUID\" ORDER BY `id` DESC",
            fields: { userUID: user.uid }
        });
        if (!keyscount.err && keyscount.data && Array.isArray(keyscount.data) && keyscount.data.length === 1) {
            const cnt = parseInt(keyscount.data[0].count);
            if (cnt > 2) {
                GD_1.GD.S_REQ_MYSQL_QUERY.request({
                    query: "DELETE FROM `auth` WHERE `user_uid` =\"@userUID\" ORDER BY `id` DESC LIMIT @limit",
                    fields: { userUID: user.uid, limit: cnt - 2 }
                });
                for (let i of this.keys) {
                    if (i[1].user.uid === user.uid) {
                        this.keys.delete(i[0]);
                    }
                }
            }
        }
        let key = Helper_1.default.passhash(Helper_1.default.pack("internal_key", packet.ip + '_' + user.uid + "_" + (+new Date()) + "_" + Math.random() * 1000000));
        if (key.length > 64)
            key = key.substring(0, 64);
        const resp = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table: "auth",
            fields: [
                { name: "key", value: key },
                { name: "user_uid", value: user.uid },
                { name: "ip", value: packet.ip }
            ]
        });
        GD_1.GD.S_REQ_MYSQL_QUERY.request({
            query: "UPDATE `users` SET `atime`=NOW(),`logins`=`logins`+1 WHERE uid=\"@userUID\" LIMIT 1",
            fields: {
                userUID: user.uid
            }
        });
        if (!resp.err) {
            this.users.set(user.uid, user);
            this.keys.set(key, { time: +new Date(), user: user });
            GD_1.GD.S_EVENT_ADD.invoke({
                action: "login",
                user_uid: user.uid,
                data: packet.ip,
                source: "Auth.login",
                etime: Math.round((+new Date()) / 1000)
            });
        }
        return {
            error: resp.err ? Error_1.default.AUTH_USER_NOT_AUTHENTICATED : null,
            data: resp.err ? `${resp.err}` : { key: key, user: user }
        };
    }
    async checkAuthKey(key) {
        const authInfo = this.keys.get(key);
        if (authInfo) {
            if (+new Date() - authInfo?.time < 1000 * 60 * 60 * 24 * 14) {
                this.keys.set(key, { time: +new Date(), user: authInfo.user });
                return authInfo.user;
            }
            this.keys.delete(key);
        }
        const resp = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
            query: "SELECT * FROM `auth` WHERE `key`=\"@key\" LIMIT 1",
            fields: { key: key }
        });
        if (resp.err) {
            console.error("Wrong auth key: " + key, resp.err);
            return null;
        }
        if (!resp.data || !Array.isArray(resp.data) || resp.data.length !== 1) {
            return null;
        }
        const userUID = resp.data[0].user_uid;
        const result = await GD_1.GD.S_REQ_MYSQL_QUERY.request([{
                query: "select * from users WHERE uid=\"@userUID\" LIMIT 1",
                fields: { "userUID": userUID }
            },
            {
                query: "update `users` set `atime` = NOW() WHERE uid=\"@userUID\"",
                fields: { "userUID": userUID }
            },
            {
                query: "update `auth` set `atime` = NOW() WHERE `key`=\"@key\"",
                fields: { "key": key }
            }]);
        if (!result.data)
            return null;
        if (Array.isArray(result.data) && result.data.length > 0) {
            const user = this.createUserVO(result.data[0][0]);
            if (user.uid && user.uid === userUID) {
                this.keys.set(key, { time: +new Date(), user: user });
                this.users.set(user.uid, user);
                return user;
            }
        }
        return null;
    }
    createUserVO(data) {
        return {
            uid: data.uid,
            login: data.login,
            atime: +new Date(data.atime),
            ctime: +new Date(data.ctime),
            display_name: data.display_name,
            locked: data.locked === 1 ? true : false,
            phone: data.phone,
            mail: data.mail,
            role_accounter: data.role_accounter && data.role_accounter === 1,
            role_admin: data.role_admin && data.role_admin === 1,
            role_sales: data.role_sales && data.role_sales === 1
        };
    }
    validateLoginAndPass(request) {
        if (!request.login || !request.password) {
            return {
                error: Error_1.default.NO_FIELDS,
                data: null
            };
        }
        if (typeof request.login !== "string" || typeof request.password !== "string" || request.login.length < 3 || request.password.length < 8 || request.password.length > 20) {
            return {
                error: Error_1.default.AUTH_CHECK_LOGIN_OR_PASSWD,
                data: null
            };
        }
        request.login = request.login.replaceAll(/[^a-zA-Z0-9_.@]/gi, "");
        if (request.login.length < 3) {
            return {
                error: Error_1.default.AUTH_WRONG_SYMBOLS_IN_LOGIN,
                data: null
            };
        }
        return null;
    }
}
exports.default = Auth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvQXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdFQUF3QztBQUN4QyxtRUFBNEM7QUFDNUMsaUNBQThCO0FBQzlCLDBEQUFrQztBQUdsQyxNQUFNLElBQUssU0FBUSxxQkFBVztJQUUxQixLQUFLLEdBQW9CLElBQUksR0FBRyxFQUFFLENBQUM7SUFDbkMsSUFBSSxHQUF1QyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXJEO1FBQ0ksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFHRCxLQUFLLENBQUMsSUFBSSxLQUFHLENBQUM7SUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBRW5DLElBQUcsTUFBTSxDQUFDLFVBQVUsS0FBRyxNQUFNLEVBQUM7WUFDMUIsT0FBTztnQkFDSCxLQUFLLEVBQUMsZUFBTSxDQUFDLGlCQUFpQjtnQkFDOUIsSUFBSSxFQUFDLElBQUk7YUFDWixDQUFBO1NBQ0o7UUFFRCxRQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUM7WUFDakIsS0FBSyxPQUFPO2dCQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixLQUFLLFNBQVM7Z0JBQ2QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLEtBQUssT0FBTztnQkFDWixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsS0FBSyxPQUFPO2dCQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM3QjtRQUdELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUVoQyxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUF3QjtRQUNoQyxJQUFHLENBQUMsTUFBTSxDQUFD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