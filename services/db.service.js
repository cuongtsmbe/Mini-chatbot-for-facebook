const mongoose = require('mongoose');
require('dotenv').config();
const UserModel =require('../models/user.model');
const ChatModel =require('../models/chat.model');

module.exports = {
  //connect to mongodb
  connect:  function() {
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI);
  },
  //add new id contact (fb)
  addUser:function(ID){
    var myData = new UserModel({
      fbid:ID
    });

    myData.save()
      .then(item => {
        console.log("--success--");
          console.log(item);
      })
      .catch(err => {
          console.log(err);
    });

  },

  addChat:function(data){
    var chat = new ChatModel({
      user:data._id,
      botMessage:data.botMessage,
      userMessage:data.userMessage
    });

    chat.save()
      .then(item => {
        console.log("--success--");
          console.log(item);
      })
      .catch(err => {
          console.log(err);
    });
  },
  getUserByFbID:async function(fbid){
    let user = await UserModel.findOne({
      fbid,
    });
    return user;
  },
  
  //chua dung 

  // getChatByUserId: async function(userID) {
  //   const chatRows = await ChatModel.find({ user: userID }).exec();
  //   console.log("--get all chat by one user--");
  //   console.log(chatRows);
  //   return chatRows;
  // },

  // deleteChatByUserId: async function(userID) {
  //   const deletedChat = await ChatModel.deleteMany({ user: userID }).exec();
  //   console.log("--delete--");
  //   console.log(deletedChat);
  //   return deletedChat;
  // }
  

};
