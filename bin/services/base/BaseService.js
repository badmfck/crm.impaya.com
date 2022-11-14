"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GD_1 = require("../../GD");
class BaseService {
    _serivceName = "BaseService";
    get serviceName() { return this._serivceName; }
    static serviceID = 1;
    constructor(name) {
        this._serivceName = name ?? "uknown service " + (BaseService.serviceID++);
        GD_1.GD.S_APP_READY.add(() => this.onApplicationReady());
    }
    onServiceReady = () => { GD_1.GD.S_SERVICE_READY.invoke(this._serivceName); };
    onApplicationReady() { }
}
exports.default = BaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvYmFzZS9CYXNlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUc5QixNQUFNLFdBQVc7SUFDTCxZQUFZLEdBQVEsYUFBYSxDQUFBO0lBQ3pDLElBQUksV0FBVyxLQUFVLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQSxDQUFBLENBQUM7SUFDbEQsTUFBTSxDQUFDLFNBQVMsR0FBUSxDQUFDLENBQUM7SUFDMUIsWUFBWSxJQUFZO1FBQ3BCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxJQUFJLGlCQUFpQixHQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDeEUsT0FBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRSxFQUFFLENBQUEsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsY0FBYyxHQUFDLEdBQUUsRUFBRSxHQUFDLE9BQUUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQSxDQUFBLENBQUMsQ0FBQTtJQUNqRSxrQkFBa0IsS0FBRyxDQUFDOztBQUcxQixrQkFBZSxXQUFXLENBQUMifQ==