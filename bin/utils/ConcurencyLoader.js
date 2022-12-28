"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Error_1 = __importDefault(require("../structures/Error"));
const Signal_1 = __importDefault(require("./Signal"));
class ConcurencyLoader {
    data = null;
    loading = false;
    onDataLoaded = new Signal_1.default();
    setLoadingProcedure;
    lastUpdate = 0;
    constructor() { }
    async load(cb) {
        if (this.data) {
            cb({ data: this.data, error: null });
            return;
        }
        this.onDataLoaded.add(cb);
        if (this.loading)
            return;
        this.loading = true;
        let err = null;
        let res;
        if (this.setLoadingProcedure) {
            res = await this.setLoadingProcedure();
        }
        else {
            res = {
                error: Error_1.default.CORE_CONCURENCY_LOADER_NO_PROCEDURE,
                data: null
            };
        }
        if (res) {
            if (res.error) {
                err = res.error;
            }
            else if (res.data) {
                this.data = res.data;
            }
            else {
                err = Error_1.default.CORE_CONCURENCY_LOADER_NO_DATA;
            }
        }
        else {
            err = Error_1.default.CORE_CONCURENCY_LOADER_NO_RESULT;
        }
        this.lastUpdate = +new Date();
        this.loading = false;
        this.onDataLoaded.invoke(res);
        this.onDataLoaded.clear();
    }
}
exports.default = ConcurencyLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uY3VyZW5jeUxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9Db25jdXJlbmN5TG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsZ0VBQXlDO0FBQ3pDLHNEQUE4QjtBQUU5QixNQUFNLGdCQUFnQjtJQUVsQixJQUFJLEdBQVEsSUFBSSxDQUFDO0lBQ2pCLE9BQU8sR0FBQyxLQUFLLENBQUM7SUFDZCxZQUFZLEdBQTZCLElBQUksZ0JBQU0sRUFBRSxDQUFDO0lBQ3RELG1CQUFtQixDQUFrQztJQUNyRCxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBRWYsZ0JBQWMsQ0FBQztJQUVmLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBbUM7UUFFMUMsSUFBRyxJQUFJLENBQUMsSUFBSSxFQUFDO1lBQ1QsRUFBRSxDQUFDLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxJQUFJLEVBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxDQUFDLENBQUM7WUFDaEMsT0FBTztTQUNWO1FBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7UUFFekIsSUFBRyxJQUFJLENBQUMsT0FBTztZQUNYLE9BQU87UUFFWCxJQUFJLENBQUMsT0FBTyxHQUFDLElBQUksQ0FBQztRQUNsQixJQUFJLEdBQUcsR0FBQyxJQUFJLENBQUM7UUFDYixJQUFJLEdBQXVCLENBQUE7UUFFM0IsSUFBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUM7WUFDeEIsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDMUM7YUFBSTtZQUNELEdBQUcsR0FBQztnQkFDQSxLQUFLLEVBQUMsZUFBTSxDQUFDLG1DQUFtQztnQkFDaEQsSUFBSSxFQUFDLElBQUk7YUFDWixDQUFBO1NBQ0o7UUFFRCxJQUFHLEdBQUcsRUFBQztZQUNILElBQUcsR0FBRyxDQUFDLEtBQUssRUFBQztnQkFDVCxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQTthQUNsQjtpQkFBSyxJQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUM7Z0JBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO2FBQ3ZCO2lCQUFJO2dCQUNELEdBQUcsR0FBRyxlQUFNLENBQUMsOEJBQThCLENBQUE7YUFDOUM7U0FDSjthQUFJO1lBQ0QsR0FBRyxHQUFHLGVBQU0sQ0FBQyxnQ0FBZ0MsQ0FBQztTQUNqRDtRQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDOUIsQ0FBQztDQUNKO0FBQ0Qsa0JBQWUsZ0JBQWdCLENBQUMifQ==