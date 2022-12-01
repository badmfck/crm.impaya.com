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
        process.env.TZ = "Europe/Riga";
        await this.initializeServices();
        GD_1.GD.S_APP_READY.invoke();
        const buff = fs_1.default.readFileSync("data/psystems.json");
        const arr = JSON.parse(buff.toString("utf-8"));
        console.log("APP LAUNCHED");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9NYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsdUVBQStDO0FBRS9DLDZCQUEwQjtBQUMxQiwrREFBdUM7QUFFdkMsNkRBQXFDO0FBRXJDLDJFQUFtRDtBQUVuRCw0Q0FBbUI7QUFHbkIsTUFBTSxJQUFJO0lBRU4sZ0JBQWUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBLENBQUMsQ0FBQztJQUVwQixLQUFLLENBQUMsSUFBSTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLGFBQWEsQ0FBQTtRQUM5QixNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQ2hDLE9BQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFeEIsTUFBTSxJQUFJLEdBQUcsWUFBRSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBRWxELE1BQU0sR0FBRyxHQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO1FBbUI3QyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQy9CLENBQUM7SUFFTyxLQUFLLENBQUMsa0JBQWtCO1FBQzVCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLEVBQUU7WUFDakMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDO1lBQ1IsSUFBSSxRQUFRLEdBQXFCO2dCQUM3QixnQkFBTTtnQkFDTixvQkFBVTtnQkFDVixlQUFLO2dCQUNMLHNCQUFZO2FBQ2YsQ0FBQTtZQUVELE9BQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQSxFQUFFO2dCQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBQyxJQUFJLEdBQUMsV0FBVyxDQUFDLENBQUE7Z0JBQ3hDLENBQUMsRUFBRSxDQUFDO2dCQUNKLElBQUcsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxNQUFNLEVBQUM7b0JBQ3JCLE9BQU8sRUFBRSxDQUFDO2lCQUNiO1lBQ0wsQ0FBQyxDQUFDLENBQUE7WUFFRixLQUFJLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBQztnQkFDbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUNYO1FBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0NBQ0o7QUFFRCxJQUFJLElBQUksRUFBRSxDQUFDIn0=