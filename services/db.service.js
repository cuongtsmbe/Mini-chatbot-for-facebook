const mongoose = require('mongoose');
require('dotenv').config();

class DbService {

  async connect() {
    var conn = mongoose.createConnection(process.env.MONGODB_URI);
    console.log("-connected DB");
    return conn;
  }

  async getUserByFbId(FbId) {
    let user = await User.findOne({
      FbId,
    });
    if (!user) {
        console.log("create");
      user = await User.create({
        FbId,
      });
    }
    return user;
  }

  async getUserMessages(userId) {
    return Message.find({
      user: userId
    });
  }

  async createNewMessage(user, userMessage, botMessage) {
    // Lưu tin nhắn vào Database
    return Message.create({
      user: user._id,
      userMessage,
      botMessage,
    })
  }

  async clearUserMessages(userId) {
    // Xoá các tin nhắn của người dùng trong Database
    return Message.deleteMany({
      user: userId
    });
  }

}

module.exports = new DbService();
