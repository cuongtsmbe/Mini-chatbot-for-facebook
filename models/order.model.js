const mongoose = require('mongoose');

//user sẽ chứa một ObjectId của một đối tượng User
// status : 0 is chưa xác nhận , 1 thành công , 2 sai thông tin , 3 hủy đơn 
const schema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  order: { type: String, required: true },
  status: { type: Number, required: true,min: 0,max: 3 },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Orders', schema);

module.exports = Order;