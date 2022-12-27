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
const Rates_1 = __importDefault(require("./services/Rates"));
class Main {
    constructor() { this.init(); }
    async init() {
        process.env.TZ = "Europe/Riga";
        await this.initializeServices();
        GD_1.GD.S_APP_READY.invoke();
        console.log("APP LAUNCHED");
    }
    async initializeServices() {
        return new Promise((resolve, reject) => {
            let i = 0;
            let services = [
                Config_1.default,
                HTTPServer_1.default,
                Mysql_1.default,
                EventService_1.default,
                Rates_1.default
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsdUVBQStDO0FBRS9DLDZCQUEwQjtBQUMxQiwrREFBdUM7QUFFdkMsNkRBQXFDO0FBRXJDLDJFQUFtRDtBQUduRCw2REFBcUM7QUFHckMsTUFBTSxJQUFJO0lBRU4sZ0JBQWUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUMsQ0FBQztJQUVwQixLQUFLLENBQUMsSUFBSTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLGFBQWEsQ0FBQTtRQUM5QixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2hDLE9BQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUF5QnhCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDL0IsQ0FBQztJQUVPLEtBQUssQ0FBQyxrQkFBa0I7UUFDNUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsRUFBRTtZQUNqQyxJQUFJLENBQUMsR0FBQyxDQUFDLENBQUM7WUFDUixJQUFJLFFBQVEsR0FBcUI7Z0JBQzdCLGdCQUFNO2dCQUNOLG9CQUFVO2dCQUNWLGVBQUs7Z0JBQ0wsc0JBQVk7Z0JBQ1osZUFBSzthQUNSLENBQUE7WUFFRCxPQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUEsRUFBRTtnQkFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEdBQUMsSUFBSSxHQUFDLFdBQVcsQ0FBQyxDQUFBO2dCQUN4QyxDQUFDLEVBQUUsQ0FBQztnQkFDSixJQUFHLENBQUMsS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFDO29CQUNyQixPQUFPLEVBQUUsQ0FBQztpQkFDYjtZQUNMLENBQUMsQ0FBQyxDQUFBO1lBRUYsS0FBSSxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUM7Z0JBQ2xCLElBQUksQ0FBQyxFQUFFLENBQUM7YUFDWDtRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztDQUNKO0FBRUQsSUFBSSxJQUFJLEVBQUUsQ0FBQyJ9