"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = __importDefault(require("xml2js"));
const GD_1 = require("../GD");
const Helper_1 = __importDefault(require("../Helper"));
class RatesECB {
    urlDaily = "http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
    loading = false;
    lastUpdate = 0;
    lastUpdateDate = "";
    constructor() {
    }
    async request() {
        if (this.loading)
            return true;
        this.loading = true;
        console.log("ECB Request rates");
        if ((+new Date()) - this.lastUpdate < 1000 * 60 * 30) {
            console.log("No need to check ecb rates", (+new Date()) - this.lastUpdate, 1000 * 60 * 30);
            this.loading = false;
            return true;
        }
        const df = Helper_1.default.dateFormatter.format(new Date(), "%y-%m-%d");
        if (df === this.lastUpdateDate) {
            console.log("Got rates for today: " + df + " = " + this.lastUpdateDate);
            this.loading = false;
            return true;
        }
        const cres = await GD_1.GD.S_REQUEST_CURRENCY_NAMES.request();
        let currencyNames = null;
        if (cres && !cres.error && cres.data)
            currencyNames = cres.data;
        const resp = await axios_1.default.get(this.urlDaily);
        if (resp.status < 200 || resp.status > 399) {
            console.error("ecb request error");
            this.loading = false;
            return false;
        }
        const queries = [];
        try {
            const data = await xml2js_1.default.parseStringPromise(resp.data);
            const entries = data[`gesmes:Envelope`][`Cube`][`0`]['Cube'][`0`];
            const time = entries[`$`][`time`];
            const items = entries[`Cube`];
            if (time && typeof time === "string" && time.length > 5 && time === this.lastUpdateDate) {
                this.loading = false;
                console.error("Wrong date format in xml ", time);
                return true;
            }
            this.lastUpdateDate = time;
            for (let i in items) {
                const obj = items[i][`$`];
                const currency = obj[`currency`];
                const rate = obj['rate'];
                const currencyID = (currencyNames && currencyNames.get(currency.toLowerCase()))?.id ?? -1;
                queries.push({
                    table: "currencies_ecb_rates",
                    fields: [
                        { name: "rate", value: rate },
                        { name: "currency_code", value: currency },
                        { name: "currency_id", value: currencyID },
                        { name: "ctime", value: time }
                    ],
                    onUpdate: [
                        { name: "rate", value: rate }
                    ]
                });
            }
        }
        catch (e) {
            console.error("Pobably XML format from ECB was changed!");
            this.loading = false;
            return false;
        }
        const sql = await GD_1.GD.S_REQ_MYSQL_INSERT_QUERY.request(queries);
        if (sql.err) {
            console.error(sql.err);
            this.loading = false;
            return false;
        }
        this.lastUpdate = +new Date();
        this.loading = false;
        return true;
    }
}
exports.default = RatesECB;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmF0ZXNFQ0IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvUmF0ZXNFQ0IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBeUI7QUFDekIsb0RBQTJCO0FBQzNCLDhCQUEyQjtBQUMzQix1REFBK0I7QUFFL0IsTUFBTSxRQUFRO0lBRVYsUUFBUSxHQUFDLDhEQUE4RCxDQUFBO0lBQ3ZFLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDaEIsVUFBVSxHQUFDLENBQUMsQ0FBQztJQUNiLGNBQWMsR0FBQyxFQUFFLENBQUE7SUFFakI7SUFFQSxDQUFDO0lBRUQsS0FBSyxDQUFDLE9BQU87UUFFVCxJQUFHLElBQUksQ0FBQyxPQUFPO1lBQ1gsT0FBTyxJQUFJLENBQUM7UUFFaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFFcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBRWhDLElBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksR0FBQyxFQUFFLEdBQUMsRUFBRSxFQUFDO1lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFDLElBQUksR0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFDLENBQUE7WUFDcEYsSUFBSSxDQUFDLE9BQU8sR0FBRSxLQUFLLENBQUM7WUFDcEIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE1BQU0sRUFBRSxHQUFHLGdCQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxFQUFDLFVBQVUsQ0FBQyxDQUFBO1FBQzdELElBQUcsRUFBRSxLQUFLLElBQUksQ0FBQyxjQUFjLEVBQUM7WUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIs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