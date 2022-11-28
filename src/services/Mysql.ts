import { response } from "express";
import mysql, { Pool, raw } from "mysql"
import { GD } from "../GD";
import BaseService from "./base/BaseService";

class MySQL extends BaseService{

    reconnectionTimeout=1000*3;
    reconnecting=false;
    pool:Pool|null=null;

    constructor(){
        super("mysql");

        GD.S_REQ_MYSQL_SELECT.listener=(request,response)=>{
            this.executeSelectQuery(request,response);
        }

        GD.S_REQ_MYSQL_INSERT_QUERY.listener=(req,res)=>{
            this.executeInsertQuery(req,res);
        }
        
        GD.S_REQ_MYSQL_QUERY.listener=(req,res)=>{
            this.executeQuery(req,res);
        }
        
        this.onServiceReady();
    }

    

    executeSelectQuery(request:MySQLSelectQueryVO,response:(data:MySQLResult)=>void){
        let q= request.query;
        for(let i in request.fields){
            const val = `${request.fields[i]}`.replaceAll('"','\\"');
            q=q.replaceAll("@"+i,val)
        }
        
        if(q.toLowerCase().indexOf("limit")===-1)
            q+=" LIMIT 100"

        this.execute(q,response)
    }

    executeInsertQuery(query:MySQLInsertQueryVO|MySQLInsertQueryVO[],response:(data:MySQLResult)=>void){
        const rawQuery = this.prepareInsertQuery(query);
        this.execute(rawQuery,response);
    }

    executeQuery(query:MySQLQueryVO|MySQLQueryVO[],response:(data:MySQLResult)=>void){
        const rawQuery = this.prepareQuery(query);
        this.execute(rawQuery,response);
    }

    execute(query:string,response:(data:MySQLResult)=>void){
        if(!this.pool){
            console.error("NO POOL")
            response({
                err:"No connections pool",
                data:null,
                fields:null
            })
            return;
        }

        this.pool.getConnection((err,conn)=>{
            if(err){
                //TODO: fire error, no conn
                console.error(`${err}`)
                response({
                    err:err,
                    data:null,
                    fields:null
                })
                return;
            }

            console.log(query)
            conn.query(query,(err,res,fields)=>{
               
                conn.release();
                conn.removeAllListeners();

                if(err){
                    console.error(`${err}`)
                    response({
                        err:err,
                        data:null,
                        fields:null
                    })
                    return;
                }

                response({
                    err:err,
                    data:res,
                    fields:fields
                })
            })

            conn.on("error",err=>{
                console.error(`${err}`)
                conn.removeAllListeners();
                response({
                    err:err,
                    data:null,
                    fields:null
                })
            })
        })
    }

    prepareInsertQuery(q:MySQLInsertQueryVO|MySQLInsertQueryVO[]):string{

        if(!Array.isArray(q))
            q=[q]

        let rawQuery="";
        for(let query of q){

            const names=query.fields.map(val=>{
                let name =val.name;
                name=name.replaceAll(/[^a-zA-Z0-9_\-]/gi,'');
                return '`'+name+'`';
            }).join(",");
            
            const values = query.fields.map(field=>{
                let val = field;
                if(typeof val.value === "string" && val.value.indexOf("!@")!==0){
                    val.value = val.value?val.value.replaceAll('"','\\"'):null
                    val.value = '"'+val.value+'"'
                }
                if(typeof val.value === "string" && val.value.indexOf("!@")===0){
                    val.value=val.value.substring(2)
                }
                return val.value;
            }).join(",")

            // Add update query
            let updateQuery="";
            if(query.onUpdate && Array.isArray(query.onUpdate) && query.onUpdate.length>0){
                updateQuery="ON DUPLICATE KEY UPDATE "
                let j=0;
                for(let i of query.onUpdate){
                    if(j>0)
                        updateQuery+=","
                    updateQuery+=" `"+i.name+"` = \""+i.value+'" '
                    j++;
                }
            }

            if(rawQuery.length>0)
                rawQuery+=";\n";

            
            rawQuery +=  `INSERT INTO \`${query.table}\` (${names}) VALUES (${values}) ${updateQuery}`
        }
        return rawQuery;
    }

    prepareQuery(q:MySQLQueryVO|MySQLQueryVO[]):string{

        if(!Array.isArray(q))
            q=[q]

        let rawQuery="";
        for(let query of q){
            let tmp=query.query
            
            for(let i in query.fields){
                const val = `${query.fields[i]}`.replaceAll('"','\\"');
                tmp=tmp.replaceAll("@"+i,val)
            }

            if(tmp.toLowerCase().indexOf("select")===0 && tmp.toLowerCase().indexOf("limit")===-1)
                tmp+=" LIMIT 100"
            if(rawQuery.length>0)
                rawQuery+=";\n";
            rawQuery+=tmp;
        }
        return rawQuery;
    }

    async onApplicationReady() {
        this.createPool();
    }

    async createPool(){
        const cfg=await GD.S_CONFIG_REQUEST.request();
        console.log("Connecting to mysql")
        
        this.pool = mysql.createPool({
            connectionLimit:cfg.SQL_MAX_CONNECTIONS,
            host:cfg.SQL_HOST,
            user:cfg.SQL_USER,
            password:cfg.SQL_PASSWD,
            port:cfg.SQL_PORT,
            database:"crm",
            multipleStatements:true
        })
    }
}



export default MySQL;