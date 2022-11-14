interface IService{
    onServiceReady:(()=>void)|null
    onApplicationReady:(()=>void) | null
}
export default IService