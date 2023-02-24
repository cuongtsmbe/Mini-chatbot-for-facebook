const mongoose = require('mongoose');

//user sẽ chứa một ObjectId của một đối tượng User
const schema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  order: { type: String, required: true },
});

const Order = mongoose.model('Orders', schema);

module.exports = Order;