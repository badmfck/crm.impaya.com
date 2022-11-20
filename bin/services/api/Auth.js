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
        }
        return super.execute(packet);
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
        const key = Helper_1.default.passhash(Helper_1.default.pack("internal_key", packet.ip + '_' + user.uid + "_" + (+new Date()) + "_" + Math.random() * 1000000));
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
            console.error("Wrong auth key: " + key);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvQXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdFQUF3QztBQUN4QyxtRUFBNEM7QUFDNUMsaUNBQThCO0FBQzlCLDBEQUFrQztBQUdsQyxNQUFNLElBQUssU0FBUSxxQkFBVztJQUUxQixLQUFLLEdBQW9CLElBQUksR0FBRyxFQUFFLENBQUM7SUFDbkMsSUFBSSxHQUF1QyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBRXJEO1FBQ0ksS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pCLENBQUM7SUFFRCxLQUFLLENBQUMsSUFBSSxLQUFHLENBQUM7SUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBRW5DLElBQUcsTUFBTSxDQUFDLFVBQVUsS0FBRyxNQUFNLEVBQUM7WUFDMUIsT0FBTztnQkFDSCxLQUFLLEVBQUMsZUFBTSxDQUFDLGlCQUFpQjtnQkFDOUIsSUFBSSxFQUFDLElBQUk7YUFDWixDQUFBO1NBQ0o7UUFFRCxRQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUM7WUFDakIsS0FBSyxPQUFPO2dCQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixLQUFLLFNBQVM7Z0JBQ2QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQy9CO1FBR0QsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRWhDLENBQUM7SUFJRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBRW5DLElBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUM7WUFDdkMsT0FBTztnQkFDSCxLQUFLLEVBQUMsZUFBTSxDQUFDLG1CQUFtQjtnQkFDaEMsSUFBSSxFQUFDLElBQUk7YUFDWixDQUFBO1NB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