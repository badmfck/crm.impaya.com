"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../GD");
const Helper_1 = __importDefault(require("../Helper"));
const BaseService_1 = __importDefault(require("./base/BaseService"));
class EventService extends BaseService_1.default {
    events = [];
    sending = false;
    sendRequest = false;
    timeoutID = null;
    constructor() {
        super("EventService");
        GD_1.GD.S_EVENT_ADD.add((event) => {
            this.storeEvent(event);
        });
        this.onServiceReady();
    }
    storeEvent(event) {
        this.events.push({ event: event, id: +new Date() + "_" + Math.random() * 100000 });
        if (this.timeoutID)
            clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => { this.sendEvents(); }, 1000);
    }
    async sendEvents() {
        if (this.sending) {
            this.sendRequest = true;
            return;
        }
        this.sending = true;
        this.sendRequest = false;
        const fullQueries = [];
        let queries = [];
        const month = Helper_1.default.dateFormatter.format(new Date(), "%m");
        for (let i of this.events) {
            const evt = i.event;
            const query = {
                table: "events_" + month,
                fields: [
                    { name: "action", value: evt.action },
                    { name: "user_uid", value: evt.user_uid },
                    { name: "data", value: evt.data },
                    { name: "source", value: evt.source },
                    { name: "etime", value: `${evt.etime}` }
                ]
            };
            queries.push({ query: query, id: i.id });
            if (queries.length > 100) {
                fullQueries.push(queries);
                queries = [];
            }
        }
        if (queries.length !== 0)
            fullQueries.push(queries);
        for (let i of fullQueries) {
            if (!i || !Array.isArray(i))
                continue;
            const q = [];
            for (let j of i) {
                q.push(j.query);
            }
            const res = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request(q);
            if (res.err) {
                console.error(res.err);
                continue;
            }
            for (let j of i) {
                for (let z = 0; z < this.events.length; z++) {
                    if (this.events[z].id === j.id) {
                        this.events.splice(z, 1);
                        break;
                    }
                }
            }
        }
        this.sending = false;
        if (this.sendRequest) {
            this.sendEvents();
        }
    }
}
exports.default = EventService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL0V2ZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDhCQUEyQjtBQUMzQix1REFBK0I7QUFDL0IscUVBQTZDO0FBRTdDLE1BQU0sWUFBYSxTQUFRLHFCQUFXO0lBQ2xDLE1BQU0sR0FBbUMsRUFBRSxDQUFDO0lBQzVDLE9BQU8sR0FBQyxLQUFLLENBQUM7SUFDZCxXQUFXLEdBQUMsS0FBSyxDQUFDO0lBQ2xCLFNBQVMsR0FBcUIsSUFBSSxDQUFDO0lBRW5DO1FBQ0ksS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBQ3JCLE9BQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBbUIsRUFBQyxFQUFFO1lBQ3RDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7SUFDekIsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFtQjtRQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsR0FBQyxHQUFHLEdBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFDLE1BQU0sRUFBQyxDQUFDLENBQUE7UUFDdkUsSUFBRyxJQUFJLENBQUMsU0FBUztZQUNiLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsR0FBRSxFQUFFLEdBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBLENBQUEsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVTtRQUNaLElBQUcsSUFBSSxDQUFDLE9BQU8sRUFB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