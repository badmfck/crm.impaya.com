//import e from "express"
declare interface SimpleObjectVO{
    [key:string]:string|number|boolean|SimpleObjectVO|Array<SimpleObjectVO>|Array<string>|Array<number>|null|undefined
}
declare interface TransferPacketVO{
    error:ErrorVO|null,
    data:string|boolean|number|Array<string>|Array<number>|Array<boolean>|Array<SimpleObjectVO>|SimpleObjectVO|null|undefined,
    responseTime?:number
    encrypted?:boolean
}

declare interface ExecutionParamsVO{
    encrypted:boolean,
    method:string,
    httpMethod:string,
    data:string|boolean|number|Array<string>|Array<number>|Array<boolean>|Array<SimpleObjectVO>|SimpleObjectVO|null|undefined
}

declare interface ErrorVO{
    message:string,
    code:number
}