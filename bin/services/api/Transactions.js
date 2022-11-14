"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Error_1 = __importDefault(require("../../structures/Error"));
const BaseHandler_1 = __importDefault(require("./BaseHandler"));
class Transactions extends BaseHandler_1.default {
    constructor() {
        super("Transaxtions (trx)");
    }
    async init() { }
    async execute(packet) {
        switch (packet.method) {
            case "add":
                return this.add(packet);
        }
        return super.execute(packet);
    }
    async add(packet) {
        if (packet.httpMethod !== "post") {
            return {
                error: Error_1.default.WRONG_HTTP_METHOD,
                data: null
            };
        }
        return super.execute(packet);
    }
}
exports.default = Transactions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNhY3Rpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2FwaS9UcmFuc2FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxtRUFBNEM7QUFFNUMsZ0VBQXdDO0FBRXhDLE1BQU0sWUFBYSxTQUFRLHFCQUFXO0lBQ2xDO1FBQ0ksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDL0IsQ0FBQztJQUNELEtBQUssQ0FBQyxJQUFJLEtBQUksQ0FBQztJQUVmLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBeUI7UUFFbkMsUUFBTyxNQUFNLENBQUMsTUFBTSxFQUFDO1lBQ2pCLEtBQUssS0FBSztnQkFDVixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDM0I7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUdELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBeUI7UUFDL0IsSUFBRyxNQUFNLENBQUMsVUFBVSxLQUFHLE1BQU0sRUFBQztZQUMxQixPQUFPO2dCQUNILEtBQUssRUFBQyxlQUFNLENBQUMsaUJBQWlCO2dCQUM5QixJQUFJLEVBQUMsSUFBSTthQUNaLENBQUE7U0FDSjtRQUNELE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNoQyxDQUFDO0NBRUo7QUFDRCxrQkFBZSxZQUFZLENBQUMifQ==