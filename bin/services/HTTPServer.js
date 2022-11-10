"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseService_1 = __importDefault(require("./BaseService"));
const express_1 = __importDefault(require("express"));
const GD_1 = require("../GD");
class HTTPServer extends BaseService_1.default {
    cfg = null;
    constructor() {
        super("HTTPServer");
        this.onServiceReady();
    }
    async onApplicationReady() {
        this.cfg = await GD_1.GD.S_CONFIG_REQUEST.request();
        const app = (0, express_1.default)();
        //attach public dir
        app.use(express_1.default.static(this.cfg.HTTP_PUBLIC_DIR));
        // listen all on /
        app.all("/api", (req, resp) => {
            resp.send("api");
        });
        // final handler
        app.use(function (req, res, next) {
            res.send("bad");
            /*res.format({
              html: function () {
                res.render('404', { url: req.url })
              },
              json: function () {
                res.json({ error: 'Not found' })
              },
              default: function () {
                res.type('txt').send('Not found')
              }
            })*/
        });
        // start
        app.listen(this.cfg.HTTP_SERVICE_PORT, () => {
            console.log("HTTP Service started on: " + this.cfg?.HTTP_SERVICE_PORT);
        });
    }
}
exports.default = HTTPServer;
