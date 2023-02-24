const orderModel =require('../models/order.model');

module.exports = {  

 //add new order for user
  addOrder:function(user,data){
    var order = new orderModel({
      userID:user._id,
      order:data.content,
    });

    order.save()
      .then(chatItem => {
        console.log("--add order success--");
        console.log(chatItem,"\n\n");
      })
      .catch(err => {
          console.log(err);
    });
  },

  //update orders by ID order
  updateOrderByID:function(id,data){
    orderModel.updateOne({ _id: id}, { order:data.content},function (err, result) {
      if (err){
          console.log(err)
      }
      else{
          console.log("---Updated order success in DB-------->\n\n");
      }
    });
  },

  //get orders by user
  //return promise
  getOrdersByUserId:async function(user) {
    let orders = await orderModel.find({userID:user._id})
    .exec();
    return orders;
  },

  //del order by _id 
  //return promise
  deleteOrderById: async function(id) {
    let deletedOrder = await orderModel.deleteMany({ _id: id }).exec();
    return deletedOrder;
  },

};
