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

 //add new chat for user
  addChat:function(user,data){
    var chat = new ChatModel({
      userID:user._id,
      botMessage:data.botMessage,
      userMessage:data.userMessage
    });

    chat.save()
      .then(chatItem => {
        console.log("--success--");
        console.log(chatItem);
      })
      .catch(err => {
          console.log(err);
    });
  },

  //add new user
  addNewUser:function(fbid){
    let userNew = new UserModel({fbid});
    return userNew.save();
  },

  //get user by FBid . IF don't have fbid then create it
  //return promise
  getUserByFbID:async function(fbid){
    let user = await UserModel.findOne({
      fbid,
    }).exec();
    if (!user) {
      user = this.addNewUser(fbid);
    }
    return user;
  },
  
  //get chats of user 
  //return promise
  getChatsByUserId:async function(user) {
    const chatRows = await ChatModel.find({userID:user._id})
    .exec();
    return chatRows;
  },

  //del chats of user 
  //return promise
  deleteChatsByUserId: async function(user) {
    const deletedChat = await ChatModel.deleteMany({ userID: user._id }).exec();
    return deletedChat;
  },

  //delete user have fbid
  //return promise
  deleteUserByFbID: async function(fbid) {
    const delUser = await UserModel.deleteMany({ fbid }).exec();
    return delUser;
  }

};
