
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
   static WRONG_BRANCH:ErrorVO={code:10,message:"wrong branch"}
   static WRONG_TOKEN:ErrorVO={code:11,message:"wrong token"}
   static NO_TOKEN:ErrorVO={code:12,message:"no token"}
   static NO_FIELDS:ErrorVO={code:13,message:"no fields"}
   static NO_IP:ErrorVO={code:14,message:"no ip"}
   static UNAUTHORIZED_ACCESS:ErrorVO={code:15,message:"unauthorized access"}
   static DB_ERR:ErrorVO={code:16,message:"Data exchange error"}

   // AUTH 50
   static AUTH_CHECK_LOGIN_OR_PASSWD:ErrorVO={code:50,message:"check login or password fields"}
   static AUTH_WRONG_SYMBOLS_IN_LOGIN:ErrorVO={code:51,message:"wrong symbols in login"}
   static AUTH_USER_NOT_ADDED:ErrorVO={code:52,message:"user not added"}
   static AUTH_WRONG_LOGIN_OR_PASSWD:ErrorVO={code:53,message:"wrong login or password"}
   static AUTH_USER_LOCKED:ErrorVO={code:54,message:"wrong login or password"}
   static AUTH_DAMAGED_USER:ErrorVO={code:55,message:"damaged user"}
   static AUTH_USER_NOT_AUTHENTICATED:ErrorVO={code:56,message:"user not authenticated"}

   // TRX
   static TRX_WRONG_BRANCH:ErrorVO={code:100,message:"wrong branch"}
   static TRX_NO_TRANSACTION_ID:ErrorVO={code:101,message:"no transaction_id"}
   static TRX_NO_TRANSACTION_STATUS:ErrorVO={code:102,message:"no status_id"}
   static WRONG_SERVER_USER:ErrorVO={code:103,message:"wrong server user"}


   // CLIENTS
   static CLIENTS_CANT_GET_CLIENTS:ErrorVO={code:201,message:"can't get clients"}
   static CLIENTS_CANT_GET_MERCHANTS:ErrorVO={code:202,message:"can't get merchants"}

   // BALANCE
   static BALANCE_NO_RATES:ErrorVO = {code:300,message:"No rates"}

   //SOLUTIONS
   static SOLUTIONS_CANT_LOAD:ErrorVO = {code:400,message:"Solutions not loaded"}
}
export default Errors;