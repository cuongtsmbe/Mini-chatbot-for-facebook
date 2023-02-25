
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
        let condition={
            limit       :config.limitOrders, //number
            offset      :(req.query.page-1)*config.limitOrders, //number
            status      :req.query.statusOrder //number
        };

        if(typeof condition.limit !== "number" || typeof condition.offset !== "number" || typeof condition.status !== "number"){
            return res.json({status:404,message:"status,limit,offset is number"});
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
            PageCurrent:req.query.page,
            TotalPage:Math.ceil(1.0*countResult[0].count/condition.limit)
        })
    },

    //lay danh sach don theo sdt and status
    getOrdersByPhone:async function(req,res,next){
        let condition={
            limit       :config.limitOrders, //number
            offset      :(req.query.page-1)*config.limitOrders, //number
            phone       :req.query.phone,   //string
            status      :req.query.statusOrder //number
        };

        //check condition variable
        if(typeof condition.limit !== "number" || typeof condition.offset !== "number" || typeof condition.status !== "number"){
            return res.json({status:404,message:"status,limit,offset is number"});
        }
        try{
            //get order have limit,offset and count order had found with that condition 
            var [orders,countOrders]=await Promise.all([
                await DB_ORDERS.getOrdersByPhone(condition.phone,condition.limit,condition.offset,condition.status),
                await DB_ORDERS.countOrdersByPhone(condition.status)
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
            PageCurrent:req.query.page,
            TotalPage:Math.ceil(1.0*countResult[0].count/condition.limit)
        })
    },

    // them hoa don moi
    add:async function(req,res,next){

        let customer={ 
            fbid :    req.body.fbid,    //string
            order : req.body.order,     //string
            statusOrder : req.body.statusOrder  //number
        }

        // block=1 is stop query DB
        let block=0;
        //check customer fbid
        if(customer.fbid.length === 0||customer.fbid === undefined || customer.fbid === null){
            block=1;
        }
        //check content order
        if(customer.order.length === 0|| customer.order === undefined || customer.order === null ){
            block=1;
        }
        //check status
        if(customer.statusOrder === undefined || customer.statusOrder === null || typeof customer.statusOrder !== "number"){
            //check value status include [0,3]
            if(customer.statusOrder < 0 || customer.statusOrder > 3){
                return res.json({
                    status:400,
                    message:"Trạng thái đơn không hợp lệ."
                });
            }
            customer.statusOrder = 0;
        }

        if(block === 1){
            return res.json({
                status:400,
                message:"Thêm thất bại. Hãy điền đầy đủ thông tin (ID customer,nội dung order)"
            });
        }

        try{
            //get user by fbid
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
            message:`Thêm hóa đơn cho ID ${customer.fbid} thành công.`
        });

    },

    //update content || status order by order ID
    update:async function(req,res,next){

        let order={
            id : req.body.ID,
            order : req.body.order,
            statusOrder : req.body.statusOrder
        }

        //check id
        if(order.id === null || order.id === undefined){
            return res.json({
                status:400,
                message: "Error order ID empty"
            });
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
                message: "Error order status or content empty"
            });
        }
        try{
        //result is { n: 0, nModified: 0, ok: 1 } 
        var result = await DB_ORDERS.updateOrderByID(order.id,order.order,order.statusOrder);

        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message: "server/DB error.update failed."
            });
        }

        if(result.ok == 0){
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

        try{
            var result = await DB_ORDERS.deleteOrderById(order.id);
        }catch(err){
            console.log(err);
            return res.json({
                status:500,
                message: "server/DB error.delete failed."
            });
        }


        if(result.ok == 0){
            return res.json({
                status:500,
                message: "delete query failed."
            });
        }else{
            return res.json({
                status:200,
                message: "delete query success."
            });
        }

    }
   
   
   

}