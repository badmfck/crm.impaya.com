import BaseHandler from "./BaseHandler";
import Errors from "../../structures/Error";
import { GD } from "../../GD";
import Helper from "../../Helper";


class Auth extends BaseHandler{

    users:Map<string,UserVO>=new Map();
    keys:Map<string,{time:number,user:UserVO}>=new Map();

    constructor(){
        super("Auth")
    }


    async init(){}
    async execute(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{

        if(packet.httpMethod!=="post"){
            return {
                error:Errors.WRONG_HTTP_METHOD,
                data:null
            }
        }

        switch(packet.method){
            case "login":
            return this.login(packet);
            case "addUser":
            return this.addUser(packet);
            case "getIP":
            return this.getIP(packet);
            case "check":
            return this.check(packet);
        }
    

        return super.execute(packet)
       
    }

    async check(packet:ExecutionParamsVO):Promise<TransferPacketVO<any>>{
        if(!packet.user){
            return {
                error:Errors.UNAUTHORIZED_ACCESS,
                data:null
            }
        }
        return {
            error: null,
            data:true
        }
    }

    async getIP(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{

        return {
            error:null,
            data:{
                ip:packet.ip,
                method:packet.httpMethod,
                headers:packet.headers
            }
        }
    }

    async addUser(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{

        if(!packet.user || !packet.user.role_admin){
            return {
                error:Errors.UNAUTHORIZED_ACCESS,
                data:null
            }
        }
        const request:AuthAddUserPacketVO=packet.data as any;

        const validationError = this.validateLoginAndPass(request);
        if(validationError!=null)
            return validationError;

        const displayName=request.displayName ?? request.login as string;
        const userUID = Helper.generateUID();
        const queries:MySQLInsertQueryVO[]=[]
        queries.push({
            table:"users",
            fields:[
                {name:"uid",value:userUID},
                {name:"login",value:request.login as string},
                {name:"passwd",value:Helper.passhash(request.password as string)},
                {name:"display_name",value:displayName},
                {name:"phone",value:request.phone ?? "??"},
                {name:"mail",value:request.mail ?? "??"}
            ]
        })

       



        const resp = await GD.S_REQ_MYSQL_INSERT_QUERY.request(queries)
        return {
            error:resp.err?Errors.AUTH_USER_NOT_ADDED:null,
            data:resp.err?`${resp.err}`:null
        }

    }

    async login(packet: ExecutionParamsVO):Promise<TransferPacketVO<any>>{

        const request:AuthAddUserPacketVO=packet.data as any;
        const validationError = this.validateLoginAndPass(request);
        if(validationError!=null)
            return validationError;

        const res=await GD.S_REQ_MYSQL_SELECT.request({
            query: 'SELECT * FROM users WHERE login="@login" AND passwd="@password" LIMIT 1',
            fields:{login:request.login,password:Helper.passhash(request.password as string)}
        })

        if(!res.data || !Array.isArray(res.data) || res.data.length!==1){

            if(res.err){
                return {
                    error:Errors.DB_ERR,
                    data:res.err
                }
            }

            return {
                error:Errors.AUTH_WRONG_LOGIN_OR_PASSWD,
                data:res.err ? res.err:null
            }
        }

        if(parseInt(res.data[0].atime) <1)
            res.data[0].atime=+new Date()
        const user = this.createUserVO(res.data[0]);
        if(user.locked){
            return {
                error:Errors.AUTH_USER_LOCKED,
                data:null
            }
        }

        if(!user.uid){
            return {
                error:Errors.AUTH_DAMAGED_USER,
                data:null
            }
        }


        // remove old keys
        const keyscount = await GD.S_REQ_MYSQL_QUERY.request({
            query:"SELECT COUNT(`id`) as `count` from `auth` WHERE `user_uid` = \"@userUID\" ORDER BY `id` DESC",
            fields:{userUID:user.uid}
        });

        if(!keyscount.err && keyscount.data && Array.isArray(keyscount.data) && keyscount.data.length === 1){
            const cnt = parseInt(keyscount.data[0].count)
            if(cnt>2){
                GD.S_REQ_MYSQL_QUERY.request({
                    query:"DELETE FROM `auth` WHERE `user_uid` =\"@userUID\" ORDER BY `id` DESC LIMIT @limit",
                    fields:{userUID:user.uid,limit:cnt-2}
                })
                // remove all keys for user (to lazy to check witch one must be removed )
                for(let i of this.keys){
                    if(i[1].user.uid === user.uid){
                        this.keys.delete(i[0])
                    }
                }
            }
        }

        //create key
        let key = Helper.passhash(Helper.pack("internal_key",packet.ip+'_'+user.uid+"_"+(+new Date())+"_"+Math.random()*1000000));
        if(key.length>64)
            key = key.substring(0,64);
        
       
        const resp =await GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table:"auth",
            fields:[
                {name:"key",value:key},
                {name:"user_uid",value:user.uid},
                {name:"ip",value:packet.ip}
            ]
        })

        

        GD.S_REQ_MYSQL_QUERY.request({
            query:"UPDATE `users` SET `atime`=NOW(),`logins`=`logins`+1 WHERE uid=\"@userUID\" LIMIT 1",
            fields:{
                userUID:user.uid
            }
        })
    

        if(!resp.err){
            this.users.set(user.uid,user)
            this.keys.set(key,{time:+new Date(),user:user})

            // add events
            GD.S_EVENT_ADD.invoke({
                action:"login",
                user_uid:user.uid,
                data:packet.ip,
                source:"Auth.login",
                etime:Math.round((+new Date())/1000)
            })
        }

        return {
            error:resp.err?Errors.AUTH_USER_NOT_AUTHENTICATED:null,
            data:resp.err?`${resp.err}`: {key:key,user:user}
        }
    }

    async checkAuthKey(key:string):Promise<UserVO|null>{

        // local auth
        const authInfo = this.keys.get(key);
        if(authInfo){
            if(+new Date() - authInfo?.time<1000*60*60*24*14){
                // update time
                this.keys.set(key,{time:+new Date(),user:authInfo.user})
                /*
                const result = await GD.S_REQ_MYSQL_QUERY.request([
                {
                    query:"update `auth` set `atime` = NOW() WHERE `user_uid`=\"@userUID\"",
                    fields:{"userUID":authInfo.user.uid}
                },
                {
                    query:"update `users` set `atime` = NOW() WHERE uid=\"@userUID\"",
                    fields:{"userUID":authInfo.user.uid}
                },])
                if(result.err)
                    console.error(result.err)*/
                return authInfo.user;
            }
            this.keys.delete(key) // key expired
        }


        const resp = await GD.S_REQ_MYSQL_SELECT.request({
            query:"SELECT * FROM `auth` WHERE `key`=\"@key\" LIMIT 1",
            fields:{key:key}
        })

        if(resp.err){
            console.error("Wrong auth key: "+key,resp.err)
            return null;
        }

        if(!resp.data || !Array.isArray(resp.data) || resp.data.length!==1){
            // wrong response
            return null;
        }

        const userUID = resp.data[0].user_uid;

        const result = await GD.S_REQ_MYSQL_QUERY.request([{
            query:"select * from users WHERE uid=\"@userUID\" LIMIT 1",
            fields:{"userUID":userUID}
        },
        {
            query:"update `users` set `atime` = NOW() WHERE uid=\"@userUID\"",
            fields:{"userUID":userUID}
        },
        {
            query:"update `auth` set `atime` = NOW() WHERE `key`=\"@key\"",
            fields:{"key":key}
        }])

        //TODO: COMPROMISED KEY
        //TODO: CLEAR KEY IF ITS EXPIRED

        if(!result.data)
            return null;
        
        if(Array.isArray(result.data) && result.data.length>0){
            const user = this.createUserVO(result.data[0][0])
            if(user.uid && user.uid === userUID){
                this.keys.set(key,{time:+new Date(),user:user})
                this.users.set(user.uid,user)
                return user;
            }
        }


        return null;
    }

    createUserVO(data:any):UserVO{
        return {
            uid:data.uid,
            login:data.login,
           
            atime:+new Date(data.atime),
            ctime:+new Date(data.ctime),

            display_name:data.display_name,
            locked:data.locked === 1?true:false,
            phone:data.phone,
            mail:data.mail,
            role_accounter:data.role_accounter && data.role_accounter === 1,
            role_admin:data.role_admin && data.role_admin === 1,
            role_sales:data.role_sales && data.role_sales === 1
        }
    }

    // HELPERS
    validateLoginAndPass(request:any):TransferPacketVO<any>|null{

        if(!request.login || !request.password){
            return {
                error:Errors.NO_FIELDS,
                data:null
            }
        }

        if(typeof request.login!=="string" || typeof request.password!=="string" || request.login.length<3 || request.password.length<8 || request.password.length>20){
            return {
                error:Errors.AUTH_CHECK_LOGIN_OR_PASSWD,
                data:null
            }
        }

        request.login = request.login.replaceAll(/[^a-zA-Z0-9_.@]/gi,"");
        if(request.login.length<3){
            return {
                error:Errors.AUTH_WRONG_SYMBOLS_IN_LOGIN,
                data:null
            }
        }

        return null;
    }

}

export default Auth;