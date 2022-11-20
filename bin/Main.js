"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPServer_1 = __importDefault(require("./services/HTTPServer"));
const GD_1 = require("./GD");
const Config_1 = __importDefault(require("./services/Config"));
const Helper_1 = __importDefault(require("./Helper"));
const Mysql_1 = __importDefault(require("./services/Mysql"));
const Packer_1 = __importDefault(require("./utils/Packer"));
const EventService_1 = __importDefault(require("./services/EventService"));
class Main {
    constructor() { this.init(); }
    async init() {
        await this.initializeServices();
        GD_1.GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED");
        const a = JSON.stringify({
            secret: "aW1wYXlhX3NlcnZlcl90b2tlbg",
            ts: +new Date()
        });
        const packed = Helper_1.default.pack("iNt3rna1_k3Y", a);
        console.log(packed, packed.length);
        console.log(Helper_1.default.unpack("iNt3rna1_k3Y", packed));
        console.log(">> ", Buffer.from(a).toString("base64"));
        console.log(a, a.length);
        console.log(new Packer_1.default().generateUID());
        console.log("pass:", new Packer_1.default().passhash("3141592zdec"));
    }
    async initializeServices() {
        return new Promise((resolve, reject) => {
            let i = 0;
            let services = [
                Config_1.default,
                HTTPServer_1.default,
                Mysql_1.default,
                EventService_1.default
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsdUVBQStDO0FBRS9DLDZCQUEwQjtBQUMxQiwrREFBdUM7QUFDdkMsc0RBQThCO0FBQzlCLDZEQUFxQztBQUNyQyw0REFBb0M7QUFDcEMsMkVBQW1EO0FBSW5ELE1BQU0sSUFBSTtJQUVOLGdCQUFlLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQSxDQUFDLENBQUM7SUFFcEIsS0FBSyxDQUFDLElBQUk7UUFDZCxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBR2hDLE9BQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQVUzQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3JCLE1BQU0sRUFBQyw0QkFBNEI7WUFDbkMsRUFBRSxFQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7U0FDakIsQ0FBQyxDQUFBO1FBRUYsTUFBTSxNQUFNLEdBQUMsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRWxELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXhCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxnQkFBTSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBQyxJQUFJLGdCQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUc5RCxDQUFDO0lBRU8sS0FBSyxDQUFDLGtCQUFrQjtRQUM1QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQztZQUNSLElBQUksUUFBUSxHQUFxQjtnQkFDN0IsZ0JBQU07Z0JBQ04sb0JBQVU7Z0JBQ1YsZUFBSztnQkFDTCxzQkFBWTthQUNmLENBQUE7WUFFRCxPQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUEsRUFBRTtnQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUN4QyxDQUFDLEVBQUUsQ0FBQztnQkFDSixJQUFHLENBQUMsS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFDO29CQUNyQixPQUFPLEVBQUUsQ0FBQztpQkFDYjtZQUNMLENBQUMsQ0FBQyxDQUFBO1lBRUYsS0FBSSxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUM7Z0JBQ2xCLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDWDtRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztDQUNKO0FBRUQsSUFBSSxJQUFJLEVBQUUsQ0FBQyJ9