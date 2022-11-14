
interface IAPIHandler{
    init:()=>Promise<void>; // async
    execute:(packet:ExecutionParamsVO)=>Promise<TransferPacketVO>
}
export default IAPIHandler;