
class Errors{
   static ERROR_TIMEOUT:ErrorVO={code:1,message:"Connection timed out"}
   static ERROR_NO_CDATA:ErrorVO={code:2,message:"No cdata"}
   static ERROR_BAD_REQUEST:ErrorVO={code:3,message:"Bad request"}
   static EMPTY_REQUEST:ErrorVO={code:4,message:"Empty request"}
   static NO_METHOD:ErrorVO={code:5,message:"No method"}
   static WRONG_METHOD:ErrorVO={code:6,message:"wrong method"}
   static NO_METHOD_IMPLEMENTATION:ErrorVO={code:7,message:"no method implementation"}
   static WRONG_IMPLEMENTATION:ErrorVO={code:8,message:"wrong method implementation"}
   static RUNTIME_ERROR:ErrorVO={code:9,message:"runtime error"}
   static EMPTY_RESPONSE:ErrorVO={code:9,message:"empty response"}
   static WRONG_HTTP_METHOD:ErrorVO={code:9,message:"wrong http method"}
}
export default Errors;