import { arrayBuffer } from "stream/consumers";
import { GD } from "../../GD";
import Helper from "../../Helper";
import Errors from "../../structures/Error";
import ConcurencyLoader from "../../utils/ConcurencyLoader";
import Signal from "../../utils/Signal";
import BaseHandler from "./BaseHandler";

class Solutions extends BaseHandler{

    solutionTypes:ConcurencyLoader<{name:string,id:number}[]> = new ConcurencyLoader()
    solutions:ConcurencyLoader<SolutionVO[]>=new ConcurencyLoader();


    constructor(){
        super("Solutions")

        this.solutions.setLoadingProcedure=async ()=>{

             // Request clients
            const sql = await GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `solutions` LIMIT 1000",
                fields:{}
            })

            if(sql.err || !sql.data || sql.data.length===0){
                return {
                    error:Errors.SOLUTIONS_CANT_LOAD,
                    data:null
                }
            }

            return {
                error:null,
                data:sql.data
            }
        }

        GD.S_SOLUTIONS_REQUEST.listener=(data,cb)=>{
           this.solutions.load(cb);
        }

        // get solution types 
        this.solutionTypes.setLoadingProcedure=async ()=>{
            const sql = await GD.S_REQ_MYSQL_SELECT.request({
                query: "SELECT * FROM `solution_types` @NOLIMIT",
                fields:{}
            })
            let result = null;
            let err = null;
            if(sql && sql.data && Array.isArray(sql.data)){
                result = sql.data;
            }else{
                err=Errors.SOLUTIONS_CANT_LOAD_TYPES
                console.error(sql.err)
            }

            return {error:err,data:result}
        }

        GD.S_SOLUTION_TYPES_REQUEST.listener=(data,cb)=>{
            this.solutionTypes.load(cb);
         }
    }

    execute(packet: ExecutionParamsVO): Promise<TransferPacketVO<any>> {
        switch(packet.method){
            case "get":
            return this.get(packet)
            case "update":
            return this.update(packet)
            case "getTypes":
            return this.getTypes(packet)
        }
        return super.execute(packet);
    }

    async getTypes(packet:ExecutionParamsVO):Promise<TransferPacketVO<any>>{
        const types = await GD.S_SOLUTION_TYPES_REQUEST.request();
        return types;
    }

    async update(packet: ExecutionParamsVO): Promise<TransferPacketVO<any>> {
        const sol:SolutionVO = this.createSolutionVO(packet)
        if(!sol){
            return {
                error:Errors.SOLUTIONS_WRONG_SOLUTION_OBJECT,
                data:null
            }
        }

        let action = "add";
        if(sol.id>0){
            action = "update"
            //edit
            return {
                error:Errors.NO_METHOD_IMPLEMENTATION,
                data:"NO METHOD FOR UPDATE"
            }
        }

        // add solution
        const hash = Helper.passhash(sol.common.name.toLowerCase()+"_"+sol.common.type);

        let sql = await GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table:"solutions",
            fields:[
                {name:"name",value:sol.common.name},
                {name:"type_id",value:sol.common.type},
                {name:"hash",value:hash}
            ]
        })

        if(sql.err){
            if(`${sql.err}`.indexOf("Duplicate entry")!==1){
                return {
                    error:Errors.SOLUTION_CANT_SAVE_DUPLICATE,
                    data:null
                }
            }
        }
        
        sol.id = sql.data.insertId;

        // ADD OR UPDATE CONTACT INFO
        sql = await GD.S_REQ_MYSQL_INSERT_QUERY.request({
            table:"contacts",
            fields:[
                {name:"target_id",value:sol.id},
                {name:"country",value:sol.contacts.country},
                {name:"city",value:sol.contacts.city},
                {name:"street",value:sol.contacts.street},
                {name:"zip",value:sol.contacts.zip},
                {name:"email",value:sol.contacts.email},
                {name:"phone",value:sol.contacts.phone},
                {name:"type",value:"solution"},
            ],
            onUpdate:[
                {name:"country",value:sol.contacts.country},
                {name:"city",value:sol.contacts.city},
                {name:"street",value:sol.contacts.street},
                {name:"zip",value:sol.contacts.zip},
                {name:"email",value:sol.contacts.email},
                {name:"phone",value:sol.contacts.phone},
            ]
        })

        let contactsError:ErrorVO|null = null;
        if(sql.err){
            contactsError = Errors.SOLUTIONS_CANT_SAVE_CONTACT_INFO
        }else{
            sol.contacts.id = sql.data.insertId
        }

        let serviceErrors:{id:number,error:Errors}[] = []
        if(Array.isArray(sol.services)){
            for(let i of sol.services){
                let alias:string|null= i.alias;
                if(!alias || alias.length ===0)
                    alias = null;

                if(alias){
                    // check alias for duplicate
                    let sql = await GD.S_REQ_MYSQL_QUERY.request({
                        query:"SELECT `alias` FROM pay_services where alias=@alias LIMIT 1",
                        fields:{alias:alias}
                    })

                    // can't check
                    if(sql.err){
                        serviceErrors.push({
                            id:i.id,
                            error:Errors.SOLUTIONS_CANT_CHECK_PAYSERVICE_ALIAS
                        })
                        continue;
                    }

                    // alias exists
                    if(sql.data.length>0){
                        serviceErrors.push({
                            id:i.id,
                            error:Errors.SOLUTIONS_PAYSERVICE_ALIAS_ALREADY_EXISTS
                        })
                        continue;
                    }
                }

                const fields = [
                    {name:"solution_id",value:sol.id},
                    {name:"service_id",value:i.service_id},
                    {name:"currency_id",value:i.currency_id},
                    {name:"alias",value:alias},
                    {name:"fee_proc",value:i.fee_proc},
                    {name:"fix_success",value:i.fix_success},
                    {name:"fix_decline",value:i.fix_decline},
                    {name:"fx_fee",value:i.fx_fee},
                    {name:"chargeback",value:i.chargeback},
                    {name:"refund",value:i.refund},
                    {name:"settlement_fee_proc",value:i.settlement_fee_proc},
                    {name:"settlement_fee",value:i.settlement_fee},
                    {name:"rolling_proc",value:i.rolling_proc},
                    {name:"rolling_period",value:i.rolling_period},
                    {name:"rolling_deposit",value:i.rolling_deposit}
                ]

                const hash = Helper.passhash(sol.id+"_"+i.service_id+"_"+i.currency_id)
                let sql = await GD.S_REQ_MYSQL_INSERT_QUERY.request({
                    table:"pay_services",
                    fields:[...fields,{name:"hash",value:hash}],
                    onUpdate:fields
                })

                // can't save service
                if(sql.err){
                    serviceErrors.push({
                        id:i.id,
                        error:Errors.SOLUTIONS_PAYSERVICE_SAVE_ERROR
                    })
                    continue;
                }

                // update alias
                i.id = sql.data.insertId;
                if(alias === null){
                    alias=Helper.passhash(sol.common.name+"_"+sol.common.type+"_"+hash);
                    const updatesql = await GD.S_REQ_MYSQL_QUERY.request({
                        query:"UPDATE pay_services SET alias = \"@alias\" WHERE id=\"@id\"",
                        fields:{alias:alias,id:i.id}
                    })
                    if(!updatesql.err)
                        i.alias = alias;
                    else{
                        serviceErrors.push({
                            id:i.id,
                            error:Errors.SOLUTIONS_PAYSERVICE_CANT_UPDATE_ALIAS
                        })
                    }
                }
            }
        }

        if(!contactsError && !serviceErrors){
            //TODO: UPDATE SOLUTION IN COLLECTION
        }


        return {
            error:null,
            data:{
                contactsError:contactsError,
                serviceErrors:serviceErrors,
                solution:sol
            }
        }
    }

    async get(packet: ExecutionParamsVO): Promise<TransferPacketVO<any>> {

        return await GD.S_SOLUTIONS_REQUEST.request();

    }

    createSolutionVO(packet:ExecutionParamsVO):SolutionVO{
       const sol = packet.data as SolutionVO;
       return sol;
    }
}

export default Solutions;