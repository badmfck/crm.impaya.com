"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Error_1 = __importDefault(require("../../structures/Error"));
const Signal_1 = __importDefault(require("../../utils/Signal"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Clients extends BaseHandler_1.default {
    clients = null;
    merchants = null;
    loading = false;
    onDataLoaded = new Signal_1.default();
    lastUpdated = 0;
    updateCacheTime = 1000 * 60 * 60 * 24 * 15;
    constructor() {
        super("Clients");
    }
    async init() {
        GD_1.GD.S_CLIENTS_REQUEST.listener = (a, b) => {
            this.loadClients((err) => {
                b({ clients: this.clients ?? new Map(), merchants: this.merchants ?? new Map(), err: err });
            });
        };
    }
    async execute(packet) {
        return super.execute(packet);
    }
    async getClients(packet) {
        const data = await GD_1.GD.S_CLIENTS_REQUEST.request();
        if (data.err) {
            return {
                error: data.err,
                data: null
            };
        }
        return {
            error: null,
            data: Array.from(this.clients?.values() ?? [])
        };
    }
    async getMerchants(packet) {
        const data = await GD_1.GD.S_CLIENTS_REQUEST.request();
        if (data.err) {
            return {
                error: data.err,
                data: null
            };
        }
        return {
            error: null,
            data: Array.from(this.merchants?.values() ?? [])
        };
    }
    async loadClients(cb) {
        if (this.clients && this.merchants && this.clients.size > 0 && this.merchants.size > 0) {
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
        if (!this.clients) {
            const cresponse = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `clients` @NOLIMIT",
                fields: {}
            });
            if (cresponse && cresponse.data && Array.isArray(cresponse.data)) {
                this.clients = new Map();
                for (let i of cresponse.data) {
                    this.clients.set(i.id, i);
                }
            }
            else {
                err = Error_1.default.CLIENTS_CANT_GET_CLIENTS;
                console.error(cresponse.err);
            }
        }
        if (!this.merchants && !err) {
            const mresponse = await GD_1.GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `merchants` @NOLIMIT",
                fields: {}
            });
            if (mresponse && mresponse.data && Array.isArray(mresponse.data)) {
                this.merchants = new Map();
                for (let i of mresponse.data) {
                    const client = this.clients?.get(i.client_id);
                    if (client) {
                        i.client = {
                            id: client.id,
                            name: client.name
                        };
                        let m = client.merchants;
                        if (!m) {
                            m = [];
                            client.merchants = m;
                        }
                        m.push(i);
                    }
                    this.merchants.set(i.id, i);
                }
            }
            else {
                err = Error_1.default.CLIENTS_CANT_GET_MERCHANTS;
            }
        }
        this.lastUpdated = +new Date();
        this.loading = false;
        this.onDataLoaded.invoke(err);
        this.onDataLoaded.clear();
    }
}
exports.default = Clients;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvQ2xpZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGlDQUE4QjtBQUM5QixtRUFBNEM7QUFDNUMsZ0VBQXdDO0FBQ3hDLGdFQUF3QztBQUV4QyxNQUFNLE9BQVEsU0FBUSxxQkFBVztJQUU3QixPQUFPLEdBQTJCLElBQUksQ0FBQztJQUN2QyxTQUFTLEdBQStCLElBQUksQ0FBQztJQUM3QyxPQUFPLEdBQUMsS0FBSyxDQUFDO0lBQ2QsWUFBWSxHQUFzQixJQUFJLGdCQUFNLEVBQUUsQ0FBQztJQUMvQyxXQUFXLEdBQUMsQ0FBQyxDQUFDO0lBQ2QsZUFBZSxHQUFHLElBQUksR0FBQyxFQUFFLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxFQUFFLENBQUM7SUFFbkM7UUFDSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUNELEtBQUssQ0FBQyxJQUFJO1FBQ04sT0FBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRTtZQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBZ0IsRUFBQyxFQUFFO2dCQUNqQyxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEdBQUcsRUFBRSxFQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksR0FBRyxFQUFFLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxDQUFDLENBQUM7WUFDekYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUE7SUFDTCxDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUF5QjtRQUNuQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUdELEtBQUssQ0FBQyxVQUFV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