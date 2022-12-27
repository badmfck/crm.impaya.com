
//import e from "express"
declare interface SimpleObjectVO{
    [key:string]:string|number|boolean|SimpleObjectVO|Array<SimpleObjectVO>|Array<string>|Array<number>|null|undefined
}


declare interface ConfigVO{
    VERSION:string
    HTTP_SERVICE_PORT:number
    HTTP_PUBLIC_DIR:string
    HTTP_TIMEOUT:number

    SQL_HOST:string
    SQL_PORT?:number
    SQL_USER:string
    SQL_PASSWD:string
    SQL_MAX_CONNECTIONS:number

    IMPAYA_SERVER_USER_UID:string

    MAJOR_DB_DATE_FIELD:"ut_created"|"ut_updated";
}

declare interface TransferPacketVO{
    error:ErrorVO|null,
    data:any
    responseTime?:number
    encrypted?:boolean
    version?:string
}

declare interface ExecutionParamsVO{
    encrypted:boolean,
    method:string,
    httpMethod:string,
    headers:SimpleObjectVO,
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
    fields:{name:string,value:string|null|boolean|number,system?:boolean}[],
    onUpdate?:{name:string,value:string|null|boolean|number,system?:boolean}[]
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
declare interface TransactionVO{
    transaction_id: number
    ref_transaction_id: number, 
    status_id:number,
    ut_created:number, 
    ut_updated:number,
    merchant_id:number, 
    amount:number,
    currency:string,
    rate:string,
    description:string,
    hash:string
    psys_alias

    merchant?:MerchantVO;
    solution?:SolutionVO
}

declare interface TRXAddPacketVO{
    branch?:string,
    timestamp?:number,
    transaction:TransactionVO
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

declare interface ClientVO{
    id:number,
    name:string,
    merchants?:MerchantVO[]
}
declare interface MerchantVO{
    id:number,
    client_id:number,
    name:string,
    client?:ClientVO
}

declare interface SolutionVO{
    id:number
	alias:string			
	title:string	
	description:string
	ctime:number
}

declare interface CurrencyVO{
    id:number
    name:string
    code:string
}