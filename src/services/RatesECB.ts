import axios from "axios"
import xml2js from "xml2js"
import { GD } from "../GD";
import Helper from "../Helper";

class RatesECB{

    urlDaily="http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml"
    loading = false;
    lastUpdate=0;
    lastUpdateDate=""

    constructor(){

    }

    async request():Promise<boolean>{

        if(this.loading)
            return true;

        this.loading = true;

        console.log("ECB Request rates")

        if((+new Date()) - this.lastUpdate < 1000*60*30){
            console.log("No need to check ecb rates",(+new Date()) - this.lastUpdate,1000*60*30)
            this.loading =false;
            return true;
        }

        const df = Helper.dateFormatter.format(new Date(),"%y-%m-%d")
        if(df === this.lastUpdateDate){
            console.log("Got rates for today: "+df+" = "+this.lastUpdateDate)
            this.loading =false;
            return true;
        }

        const cres = await GD.S_REQUEST_CURRENCY_NAMES.request();
        let currencyNames:Map<string,CurrencyVO>|null = null;
        if(cres && !cres.error && cres.data)
            currencyNames = cres.data

        const resp  = await axios.get<string>(this.urlDaily);

        if(resp.status<200 || resp.status>399){
            console.error("ecb request error")
            this.loading =false;
            return false;
        }

        const queries:MySQLInsertQueryVO[] = [];

        try{

            const data  = await xml2js.parseStringPromise(resp.data)
            const entries = data[`gesmes:Envelope`][`Cube`][`0`]['Cube'][`0`];
            const time = entries[`$`][`time`];
            const items = entries[`Cube`]

            // check time
            if(time && typeof time === "string" && time.length>5 && time === this.lastUpdateDate){
                this.loading =false;
                console.error("Wrong date format in xml ",time)
                return true;
            }
            this.lastUpdateDate = time;

            for(let i in items){
                const obj = items[i][`$`]
                const currency = obj[`currency`]
                const rate = obj['rate']
                const currencyID = (currencyNames && currencyNames.get(currency.toLowerCase()))?.id ?? -1;
                queries.push({
                    table:"currencies_ecb_rates",
                    fields:[
                        {name:"rate",value:rate},
                        {name:"currency_code",value:currency},
                        {name:"currency_id",value:currencyID},
                        {name:"ctime",value:time}
                    ],
                    onUpdate:[
                        {name:"rate",value:rate}
                    ]
                })
            }
        }catch(e){
            console.error("Pobably XML format from ECB was changed!")
            this.loading =false;
            return false;
        }

        const sql = await GD.S_REQ_MYSQL_INSERT_QUERY.request(queries)
        if(sql.err){
            console.error(sql.err)
            this.loading =false;
            return false;
        }

        this.lastUpdate=+new Date();
        this.loading =false;
        return true;

    }
}

export default RatesECB;