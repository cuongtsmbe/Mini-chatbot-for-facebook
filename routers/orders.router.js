
const config = require("../config/default.json");
const LINK = require("../util/links.json");
const DB_ORDERS= require("../services/db_orders.service");
const DB_USERS= require("../services/db_users.service");
module.exports = {
    orderRouters:function(app){
        app.get(    LINK.CLIENT.GET_ORDERS_NEW                  ,this.getListOrders);
        app.get(    LINK.CLIENT.GET_ORDERS_BY_PHONE             ,this.getOrdersByPhone);
        app.post(   LINK.CLIENT.ADD_ORDER_NEW                   ,this.add);
        app.put(    LINK.CLIENT.UPDATE_ORDER_BY_ID              ,this.update);
        app.delete( LINK.CLIENT.DELETE_ORDER_BY_ID              ,this.delete);
    },

    //lay danh sach don hang (moi) by status
    getListOrders:async function(req,res,next){
        let query = {
            page : !isNaN(req.query.page) ? parseInt(req.query.page) : 1,
            statusOrder : !isNaN(req.query.statusOrder) ? parseInt(req.query.statusOrder) : -1
        }
     
        if(query.page<=0) query.page=1;

        let condition={
            limit       :config.limitOrders, //number
            offset      :(query.page-1)*config.limitOrders, //number
            status      :query.statusOrder //number
        };

        if(isNaN(condition.limit) || isNaN(condition.offset)|| isNaN(condition.status)){
            return res.json({status:400,message:"Bad request . Status,limit,offset is number"});
        }

        try{
            var [orders,countOrders]=await Promise.all([
                await DB_ORDERS.getListOrder(condition.limit,condition.offset,condition.status),
                await DB_ORDERS.countListOrder(condition.status)
            ]);
        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message:"Error server DB."
            });
        }
        return res.json({
            status:200,
            data:orders,
            countNoLimit:countOrders,
            PageCurrent:query.page,
            TotalPage:Math.ceil(1.0*countOrders/condition.limit)
        })
    },

    //lay danh sach don theo sdt and status
    getOrdersByPhone:async function(req,res,next){
        let query = {
            page : !isNaN(req.query.page) ? parseInt(req.query.page) : 1,
            statusOrder : !isNaN(req.query.statusOrder) ? parseInt(req.query.statusOrder) : -1,
            phone : req.query.phone
        }
        if(typeof query.phone !== 'string'){
            return res.json({status:400,message:"Bad request - phone is string"});
        }
        let condition={
            limit       :config.limitOrders, //number
            offset      :(query.page-1)*config.limitOrders, //number
            phone       :query.phone,   //string
            status      :query.statusOrder //number
        };
       
        //check condition variable
        if(isNaN(condition.limit) || isNaN(condition.offset) || isNaN(condition.status)){
            return res.json({status:400,message:"Bad request - status,limit,offset is number"});
        }
  
        try{
            //get order have limit,offset and count order had found with that condition 
            var [orders,countOrders]=await Promise.all([
                await DB_ORDERS.getOrdersByPhone(condition.phone,condition.limit,condition.offset,condition.status),
                await DB_ORDERS.countOrdersByPhone(condition.phone,condition.status)
            ]);
            
        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message:"Error server DB."
            });
        }
        
        return res.json({
            status:200,
            data:orders,
            countNoLimit:countOrders,
            PageCurrent:query.page,
            TotalPage:Math.ceil(1.0*countOrders/condition.limit)
        })
    },

    // them hoa don moi
    add:async function(req,res,next){

        let customer={ 
            fbid :    req.body.fbid,    //string
            order : req.body.order,     //string
            statusOrder : isNaN(req.body.statusOrder) ? 0 : req.body.statusOrder   //number
        }

        // block=1 is stop query DB
        let block=0;
        //check customer fbid
        if(customer.fbid === undefined || customer.fbid === null || customer.fbid.length === 0){
            block=1;
        }
        //check content order
        if(customer.order === undefined || customer.order === null || customer.order.length === 0){
            block=1;
        }
  
        //check status status include [0,3]
        if(customer.statusOrder < 0 || customer.statusOrder > 3){
            return res.json({
                status:400,
                message:"Trạng thái đơn không hợp lệ."
            });
        }
        //block request add new order
        if(block === 1){
            return res.json({
                status:400,
                message:"Thêm thất bại. Hãy điền đầy đủ thông tin (ID customer,nội dung order)"
            });
        }

        try{
            //just get user by fbid then set false for second parameter
            var user = await DB_USERS.getUserByFbID(customer.fbid,false);
        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message:"Error server DB."
            });
        }
        //can't find user have fbid in DB
        if(user === null){
            return res.json({
                status:404,
                message:"Không tìm thấy User. Trong cơ sở dữ liệu"
            });
        }
        try{
            //create order        
            await DB_ORDERS.addOrder(user,{content:customer.order},customer.statusOrder);

        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message:"Error server DB."
            });
        }
        return res.json({
            status:200,
            message:`Thêm hóa đơn cho user ID ${customer.fbid} thành công.`
        });

    },

    //update content || status order by order ID
    update:async function(req,res,next){
        //ID is _id of order
        let order={
            id : req.body.ID,                   //string
            order : req.body.order,             //string
            statusOrder : req.body.statusOrder  //number
        }
       
        //check id
        if(order.id === null || order.id === undefined){
            return res.json({
                status:400,
                message: "Error order ID empty"
            });
        }

        //check objectid in mongodb
        //regular expression for ObjectId(mongodb) values, since they are represented as hexadecimal strings.
        if (!(order.id && (order.id.length === 12 || (order.id.length === 24 && /^[0-9a-fA-F]+$/.test(order.id))))) {
            return res.json({
                status : 400,
                message : "id is Not a valid ObjectId string"
            })
        }
      
        //cover order from undefined to null
        if(order.order === undefined){
            order.order = null;
        }
        //cover order status from undefined to null
        if(order.statusOrder === undefined){
            order.statusOrder = null;
        }
        //check status and order content 
        if(order.order === null && order.statusOrder === null){
            return res.json({
                status:400,
                message: "Error order status and content empty."
            });
        }

        //if status is not null then status is number include [0;3]
        if(order.statusOrder !== null){
            if(isNaN(order.statusOrder)){
                return res.json({
                    status:400,
                    message: "Error order status is not number."
                });
            }else if(order.statusOrder < 0 || order.statusOrder > 3){
                return res.json({
                    status:400,
                    message: "Error order status not include [0;3] "
                });
            }
        }

        try{
           
            var result = await DB_ORDERS.updateOrderByID(order.id,{content:order.order,status:order.statusOrder});
          
        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message: "server/DB error.update failed."
            });
        }

        if(result.modifiedCount == 0){
            if(result.matchedCount == 0){
                return res.json({
                    status:500,
                    message: "data update matched count is 0 ."
                });
            }

            return res.json({
                status:500,
                message: "update failed."
            });

        }else{
            return res.json({
                status:200,
                message: "update success."
            });
        }
       
    },

    //delete order by ID
    delete:async function(req,res,next){
        let order={
            id : req.body.ID,
        }

        //check id
        if(order.id === null || order.id === undefined){
            return res.json({
                status:400,
                message: "Error order ID empty"
            });
        }

        //check objectid in mongodb
        //regular expression for ObjectId(mongodb) values, since they are represented as hexadecimal strings.
        if (!(order.id && (order.id.length === 12 || (order.id.length === 24 && /^[0-9a-fA-F]+$/.test(order.id))))) {
            return res.json({
                status : 400,
                message : "id is Not a valid ObjectId string"
            })
        }

        try{
            var result = await DB_ORDERS.deleteOrderById(order.id);
        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message: "server/DB error.delete failed."
            });
        }


        if(result.deletedCount == 0){
            return res.json({
                status:500,
                message: "delete failed."
            });
        }else{
            return res.json({
                status:200,
                message: "delete successed."
            });
        }

    }
   
   
   

}