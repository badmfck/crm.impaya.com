//import e from "express"
declare interface SimpleObjectVO{
    [key:string]:string|number|boolean|SimpleObjectVO|Array<SimpleObjectVO>|Array<string>|Array<number>|null|undefined
}
declare interface TransferPacketVO{
    error:ErrorVO|null,
    data:any
    responseTime?:number
    encrypted?:boolean
}

declare interface ExecutionParamsVO{
    encrypted:boolean,
    method:string,
    httpMethod:string,
    ip:stirng,
    user:UserVO|null,
    data:string|boolean|number|Array<string>|Array<number>|Array<boolean>|Array<SimpleObjectVO>|SimpleObjectVO|null|undefined
}

declare interface MySQLSelectQueryVO{
    query:string,
    fields:SimpleObjectVO;
}

declare interface MySQLQueryVO{
    query:string,
    fields:SimpleObjectVO;
}
declare interface MySQLInsertQueryVO{
    table:string,
    fields:{name:string,value:string|null}[],
}

declare interface MySQLResult{
    err: MysqlError | null,
    data?: any,
    fields?: FieldInfo[]|null
}
declare interface ErrorVO{
    message:string,
    code:number
}

declare interface EventPacketVO{
    action:string,
    user_uid:string,
    data:string|null,
    source:string
    etime:number
}

// DB STRUCTURES
declare interface UserVO{
    uid:string
    login:string
    ctime:number
    atime:number
    display_name:string
    locked:boolean
    phone:string
    mail:string
    role_admin:boolean,
    role_accounter:boolean,
    role_sales:boolean
}


//API REQ
declare interface TRXAddPacketVO{
    branch?:string,
    timestamp?:number,
    transaction:string|boolean|number|Array<string>|Array<number>|Array<boolean>|Array<SimpleObjectVO>|SimpleObjectVO|null|undefined;
}
declare interface AuthAddUserPacketVO{
    login?:string,
    displayName?:string,
    password?:string,
    phone?:string
    mail?:string
    roles?:string[]
}

declare interface AuthLoginPacketVO{
    login?:string,
    password?:string
}