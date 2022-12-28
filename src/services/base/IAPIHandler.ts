
interface IAPIHandler{
    init:()=>Promise<void>; // async
    execute:(packet:ExecutionParamsVO)=>Promise<TransferPacketVO<any>>
}
export default IAPIHandler;