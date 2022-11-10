import BaseService from "./BaseService";
import express from "express";
import { GD } from "../GD";
import { ConfigVO } from "./Config";

class HTTPServer extends BaseService{
    private cfg:ConfigVO|null = null;

    constructor(){
        super("HTTPServer")
        this.onServiceReady();
    }
    async onApplicationReady(){
        this.cfg = await GD.S_CONFIG_REQUEST.request();
        const app = express();
        
        //attach public dir
        app.use(express.static(this.cfg.HTTP_PUBLIC_DIR))

        // listen all on /
        app.all("/api",(req,resp)=>{
            resp.send("api")
        });


        // final handler
        app.use(function(req, res, next){
            res.send("bad")
          
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
        app.listen(this.cfg.HTTP_SERVICE_PORT,()=>{
            console.log("HTTP Service started on: "+this.cfg?.HTTP_SERVICE_PORT)
        })
    }
}

export default HTTPServer;