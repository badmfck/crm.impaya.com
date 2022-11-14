"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Error_1 = __importDefault(require("../../structures/Error"));
class Bridge {
    constructor() {
    }
    async init() {
    }
    async execute(packet) {
        return {
            error: Error_1.default.NO_METHOD_IMPLEMENTATION,
            data: null
        };
    }
}
exports.default = Bridge;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9CcmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtRUFBNEM7QUFHNUMsTUFBTSxNQUFNO0lBQ1I7SUFFQSxDQUFDO0lBQ0QsS0FBSyxDQUFDLElBQUk7SUFFVixDQUFDO0lBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUF5QjtRQUNuQyxPQUFPO1lBQ0gsS0FBSyxFQUFDLGVBQU0sQ0FBQyx3QkFBd0I7WUFDckMsSUFBSSxFQUFDLElBQUk7U0FDWixDQUFBO0lBQ0wsQ0FBQztDQUVKO0FBQ0Qsa0JBQWUsTUFBTSxDQUFDIn0=