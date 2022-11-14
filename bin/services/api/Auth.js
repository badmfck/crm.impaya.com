"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Auth extends BaseHandler_1.default {
    constructor() {
        super("Auth");
    }
    async init() { }
    async execute(packet) {
        return {
            error: null,
            data: packet.data
        };
        super.execute(packet);
    }
}
exports.default = Auth;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hcGkvQXV0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUVBLGdFQUF3QztBQUl4QyxNQUFNLElBQUssU0FBUSxxQkFBVztJQUMxQjtRQUNJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixDQUFDO0lBRUQsS0FBSyxDQUFDLElBQUksS0FBRyxDQUFDO0lBQ2QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUF5QjtRQUVuQyxPQUFPO1lBQ0gsS0FBSyxFQUFDLElBQUk7WUFDVixJQUFJLEVBQUMsTUFBTSxDQUFDLElBQUk7U0FDbkIsQ0FBQTtRQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFekIsQ0FBQztDQUVKO0FBRUQsa0JBQWUsSUFBSSxDQUFDIn0=