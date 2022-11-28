"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HTTPServer_1 = __importDefault(require("./services/HTTPServer"));
const GD_1 = require("./GD");
const Config_1 = __importDefault(require("./services/Config"));
const Mysql_1 = __importDefault(require("./services/Mysql"));
const EventService_1 = __importDefault(require("./services/EventService"));
const fs_1 = __importDefault(require("fs"));
class Main {
    constructor() { this.init(); }
    async init() {
        await this.initializeServices();
        GD_1.GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED");
        let rawdata = fs_1.default.readFileSync('data/merchants.json');
        let data = JSON.parse(rawdata.toString("utf-8"));
        let q = "INSERT INTO `merchants` (`id`,`name`,`client_id`) VALUES";
        let z = 0;
        for (let i of data) {
            if (z > 0)
                q += ", ";
            q += ' ("' + i.id + '","' + i.name.replaceAll('"', '\\"') + '","' + i.client_id + '") ';
            z++;
        }
        fs_1.default.writeFileSync("data/client_q.txt", q);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsdUVBQStDO0FBRS9DLDZCQUEwQjtBQUMxQiwrREFBdUM7QUFFdkMsNkRBQXFDO0FBRXJDLDJFQUFtRDtBQUVuRCw0Q0FBbUI7QUFHbkIsTUFBTSxJQUFJO0lBRU4sZ0JBQWUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUMsQ0FBQztJQUVwQixLQUFLLENBQUMsSUFBSTtRQUNkLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDaEMsT0FBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBSTNCLElBQUksT0FBTyxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUNyRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsR0FBRSwwREFBMEQsQ0FBQztRQUNsRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixLQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBQztZQUNkLElBQUcsQ0FBQyxHQUFDLENBQUM7Z0JBQ04sQ0FBQyxJQUFFLElBQUksQ0FBQztZQUNSLENBQUMsSUFBRSxLQUFLLEdBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBQyxLQUFLLEdBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFDLEtBQUssQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsU0FBUyxHQUFDLEtBQUssQ0FBQTtZQUN4RSxDQUFDLEVBQUUsQ0FBQztTQUNQO1FBQ0QsWUFBRSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsRUFBQyxDQUFDLENBQUMsQ0FBQTtJQUMzQyxDQUFDO0lBRU8sS0FBSyxDQUFDLGtCQUFrQjtRQUM1QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQztZQUNSLElBQUksUUFBUSxHQUFxQjtnQkFDN0IsZ0JBQU07Z0JBQ04sb0JBQVU7Z0JBQ1YsZUFBSztnQkFDTCxzQkFBWTthQUNmLENBQUE7WUFFRCxPQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUEsRUFBRTtnQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUN4QyxDQUFDLEVBQUUsQ0FBQztnQkFDSixJQUFHLENBQUMsS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFDO29CQUNyQixPQUFPLEVBQUUsQ0FBQztpQkFDYjtZQUNMLENBQUMsQ0FBQyxDQUFBO1lBRUYsS0FBSSxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUM7Z0JBQ2xCLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDWDtRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztDQUNKO0FBRUQsSUFBSSxJQUFJLEVBQUUsQ0FBQyJ9