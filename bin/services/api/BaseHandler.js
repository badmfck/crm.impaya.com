"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Error_1 = __importDefault(require("../../structures/Error"));
class BaseHandler {
    name = "BaseHandler";
    constructor(name) {
        this.name = name;
    }
    async init() { }
    async execute(packet) {
        return {
            error: Error_1.default.NO_METHOD_IMPLEMENTATION,
            data: this.name + "." + packet.method
        };
    }
}
exports.default = BaseHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvYXBpL0Jhc2VIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsbUVBQTRDO0FBRzVDLE1BQU0sV0FBVztJQUNiLElBQUksR0FBUSxhQUFhLENBQUE7SUFDekIsWUFBWSxJQUFXO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFBO0lBQ2xCLENBQUM7SUFDRCxLQUFLLENBQUMsSUFBSSxLQUFJLENBQUM7SUFDZixLQUFLLENBQUMsT0FBTyxDQUFDLE1BQXlCO1FBQ25DLE9BQU87WUFDSCxLQUFLLEVBQUMsZUFBTSxDQUFDLHdCQUF3QjtZQUNyQyxJQUFJLEVBQUMsSUFBSSxDQUFDLElBQUksR0FBQyxHQUFHLEdBQUMsTUFBTSxDQUFDLE1BQU07U0FDbkMsQ0FBQTtJQUNMLENBQUM7Q0FDSjtBQUNELGtCQUFlLFdBQVcsQ0FBQyJ9