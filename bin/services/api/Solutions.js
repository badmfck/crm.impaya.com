"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
const Error_1 = __importDefault(require("../../structures/Error"));
const Signal_1 = __importDefault(require("../../utils/Signal"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Solutions extends BaseHandler_1.default {
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
    }
    execute(packet) {
        switch (packet.method) {
            case "get":
                return this.get(packet);
            case "update":
                return this.update(packet);
        }
        return super.execute(packet);
    }
    async update(packet) {
        return {
            error: null,
            data: Array.from(this.solutions?.values() ?? [])
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
}
exports.default = Solutions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29sdXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9Tb2x1dGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpQ0FBOEI7QUFDOUIsbUVBQTRDO0FBQzVDLGdFQUF3QztBQUN4QyxnRUFBd0M7QUFFeEMsTUFBTSxTQUFVLFNBQVEscUJBQVc7SUFFL0IsU0FBUyxHQUE2QixJQUFJLENBQUM7SUFDM0MsT0FBTyxHQUFDLEtBQUssQ0FBQztJQUNkLFlBQVksR0FBc0IsSUFBSSxnQkFBTSxFQUFFLENBQUM7SUFDL0MsV0FBVyxHQUFDLENBQUMsQ0FBQztJQUNkLGVBQWUsR0FBRyxJQUFJLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFDO0lBRW5DO1FBQ0ksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2xCLE9BQUUsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEdBQUMsQ0FBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLEVBQUU7WUFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQWdCLEVBQUMsRUFBRTtnQkFDbEMsRUFBRSxDQUFDLEVBQUMsVUFBVSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxDQUFDLENBQUE7WUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFDTixDQUFDLENBQUE7SUFDTCxDQUFDO0lBRUQsT0FBTyxDQUFDLE1BQXlCO1FBQzdCLFFBQU8sTUFBTSxDQUFDLE1BQU0sRUFBQztZQUNqQixLQUFLLEtBQUs7Z0JBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3ZCLEtBQUssUUFBUTtnQkFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDN0I7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFD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