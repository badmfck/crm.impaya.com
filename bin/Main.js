"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPServer_1 = __importDefault(require("./services/HTTPServer"));
const GD_1 = require("./GD");
const Config_1 = __importDefault(require("./services/Config"));
const Helper_1 = __importDefault(require("./Helper"));
class Main {
    constructor() { this.init(); }
    async init() {
        await this.initializeServices();
        GD_1.GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED");
        const a = JSON.stringify({
            method: "trx.add",
            data: {
                login: "text",
                passwd: "123",
                key: "привет медвед"
            }
        });
        const packed = Helper_1.default.pack("testing_key", a);
        console.log(packed, packed.length);
        console.log(Helper_1.default.unpack("testing_key", packed));
        console.log(">> ", Buffer.from(a).toString("base64"));
        console.log(a, a.length);
    }
    async initializeServices() {
        return new Promise((resolve, reject) => {
            let i = 0;
            let services = [
                Config_1.default,
                HTTPServer_1.default
            ];
            GD_1.GD.S_SERVICE_READY.add(name => {
                console.log("Service " + name + " is ready");
                i++;
                if (i === services.length) {
                    resolve();
                }
            });
            for (let i of services) {
                new i();
            }
        });
    }
}
new Main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsdUVBQStDO0FBRS9DLDZCQUEwQjtBQUMxQiwrREFBdUM7QUFDdkMsc0RBQThCO0FBRzlCLE1BQU0sSUFBSTtJQUVOLGdCQUFlLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQSxDQUFDLENBQUM7SUFFcEIsS0FBSyxDQUFDLElBQUk7UUFDZCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBR2hDLE9BQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUUzQixNQUFNLENBQUMsR0FBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3BCLE1BQU0sRUFBQyxTQUFTO1lBQ2hCLElBQUksRUFBQztnQkFDRCxLQUFLLEVBQUMsTUFBTTtnQkFDWixNQUFNLEVBQUMsS0FBSztnQkFDWixHQUFHLEVBQUMsZUFBZTthQUN0QjtTQUNKLENBQUMsQ0FBQTtRQUVGLE1BQU0sTUFBTSxHQUFDLGdCQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUVqRCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUc1QixDQUFDO0lBRU8sS0FBSyxDQUFDLGtCQUFrQjtRQUM1QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQztZQUNSLElBQUksUUFBUSxHQUFxQjtnQkFDN0IsZ0JBQU07Z0JBQ04sb0JBQVU7YUFDYixDQUFBO1lBRUQsT0FBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFBLEVBQUU7Z0JBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFDLElBQUksR0FBQyxXQUFXLENBQUMsQ0FBQTtnQkFDeEMsQ0FBQyxFQUFFLENBQUM7Z0JBQ0osSUFBRyxDQUFDLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBQztvQkFDckIsT0FBTyxFQUFFLENBQUM7aUJBQ2I7WUFDTCxDQUFDLENBQUMsQ0FBQTtZQUVGLEtBQUksSUFBSSxDQUFDLElBQUksUUFBUSxFQUFDO2dCQUNsQixJQUFJLENBQUMsRUFBRSxDQUFDO2FBQ1g7UUFDTCxDQUFDLENBQUMsQ0FBQTtJQUNOLENBQUM7Q0FDSjtBQUVELElBQUksSUFBSSxFQUFFLENBQUMifQ==