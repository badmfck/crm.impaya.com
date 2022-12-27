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
    constructor() {
    }
    async load(cb) {
        if (this.data && this.data.size > 0) {
            cb(null);
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
            err = Error_1.default.CORE_CONCURENCY_LOADER_NO_PROCEDURE;
        }
        if (res) {
            if (res.error) {
                err = res.error;
            }
            else if (res.result) {
                this.data = res.result;
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
        this.onDataLoaded.invoke(err);
        this.onDataLoaded.clear();
    }
}
exports.default = ConcurencyLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uY3VyZW5jeUxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9Db25jdXJlbmN5TG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsZ0VBQXlDO0FBQ3pDLHNEQUE4QjtBQUU5QixNQUFNLGdCQUFnQjtJQUVsQixJQUFJLEdBQWUsSUFBSSxDQUFDO0lBQ3hCLE9BQU8sR0FBQyxLQUFLLENBQUM7SUFDZCxZQUFZLEdBQXNCLElBQUksZ0JBQU0sRUFBRSxDQUFDO0lBQy9DLG1CQUFtQixDQUEwRDtJQUM3RSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBRWY7SUFFQSxDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUEyQjtRQUVsQyxJQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUMsQ0FBQyxFQUFDO1lBQzdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNULE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRXpCLElBQUcsSUFBSSxDQUFDLE9BQU87WUFDWCxPQUFPO1FBRVgsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUM7UUFDbEIsSUFBSSxHQUFHLEdBQUMsSUFBSSxDQUFDO1FBQ2IsSUFBSSxHQUFHLENBQUE7UUFFUCxJQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBQztZQUN4QixHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztTQUMxQzthQUFJO1lBQ0QsR0FBRyxHQUFHLGVBQU0sQ0FBQyxtQ0FBbUMsQ0FBQTtTQUNuRDtRQUVELElBQUcsR0FBRyxFQUFDO1lBQ0gsSUFBRyxHQUFHLENBQUMsS0FBSyxFQUFDO2dCQUNULEdBQUcsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFBO2FBQ2xCO2lCQUFLLElBQUcsR0FBRyxDQUFDLE1BQU0sRUFBQztnQkFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFBO2FBQ3pCO2lCQUFJO2dCQUNELEdBQUcsR0FBRyxlQUFNLENBQUMsOEJBQThCLENBQUE7YUFDOUM7U0FDSjthQUFJO1lBQ0QsR0FBRyxHQUFHLGVBQU0sQ0FBQyxnQ0FBZ0MsQ0FBQztTQUNqRDtRQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDOUIsQ0FBQztDQUNKO0FBQ0Qsa0JBQWUsZ0JBQWdCLENBQUMifQ==