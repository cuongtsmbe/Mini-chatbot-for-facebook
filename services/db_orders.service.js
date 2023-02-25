const orderModel =require('../models/order.model');
const config =require('../config/default.json');

module.exports = {  
    //get orders
    getListOrder:async function(limit,offset,status=-1){
        let orders;
        if(status==-1){
            orders = await orderModel.find({}).limit(limit).skip(offset).sort({ createdAt: -1 }).exec();
        }else{
            orders = await orderModel.find({status}).limit(limit).skip(offset).sort({ createdAt: -1 }).exec();
        }
        return orders;
    },

    //get count document of query by status order . 
    countListOrder:async function(status=-1){
        let count;
        //status ==-1 is get all status
        if(status==-1){
            count = await orderModel.countDocuments({}).exec();    
        }else{
            count = await orderModel.countDocuments({status}).exec();
        }
        return count;
    },

    //add new order for user
    addOrder:async function(user,data,status=config.statusOrderDefault){
        var order = new orderModel({
            userID:user._id,
            order:data.content,
            status
        });
        return await order.save();
    },

    //update order content and status by ID order
    updateOrderByID:async function(id,data,status){
        let objUpdate={};
        
        if(status === null && data.content !== null){
            //status is null and content != null
            objUpdate = { order:data.content };

        }else if(status !== null && data.content === null){
            //status is !=null and content === null
            objUpdate = { status }

        }else if(status === null && data.content === null ){
            //status is ==null and content === null
            return ;

        }else{
            objUpdate = { order:data.content,status };
        }

        return await orderModel.updateOne({ _id: id}, objUpdate);
    },

    //get orders by user
    getOrdersByUserId:async function(user,limit,offset,status=-1) {
        let orders;
        if(status == -1){
            orders = await orderModel.find({userID:user._id}).skip(offset).limit(limit).sort({ createdAt: -1 }).exec();
        }else{
            orders = await orderModel.find({userID:user._id,status}).skip(offset).limit(limit).sort({ createdAt: -1 }).exec();
        }
        return orders;
    },

    //get orders by user
    countOrdersByUserId:async function(user,status=-1) {
        let orders;
        if(status == -1){
            orders = await orderModel.countDocuments({userID:user._id}).exec();
        }else{
            orders = await orderModel.countDocuments({userID:user._id,status}).exec();
        }
        return orders;
    },

    //get orders by phone descreasing created time 
    getOrdersByPhone:async function(phone,limit,offset,status=-1) {
        let orders;
        if(status==-1){
            orders=await orderModel.find({ $text: { $search: phone, $path: 'order' } })
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
        }else{
            orders=await orderModel.find({ $text: { $search: phone, $path: 'order' },status })
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
        }

        return orders;
    },

    //count orders by phone descreasing created time 
    countOrdersByPhone:async function(phone,status=-1) {
        let orders;
        if(status==-1){
            orders=await orderModel.countDocuments({ $text: { $search: phone, $path: 'order' } })
            .exec();
        }else{
            orders=await orderModel.countDocuments({ $text: { $search: phone, $path: 'order' },status })
            .exec();
        }
        
        return orders;
    },

    //del order by _id 
    //return promise
    deleteOrderById: async function(id) {
        let deletedOrder = await orderModel.deleteMany({ _id: id }).exec();
        return deletedOrder;
    },

};
