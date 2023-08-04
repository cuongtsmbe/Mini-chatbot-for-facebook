const mongoose = require('mongoose');

//user sẽ chứa một ObjectId của một đối tượng User
const schema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  },
  Content: { type: String, required: true },
});

const Message = mongoose.model('Summarys', schema);

module.exports = Message;