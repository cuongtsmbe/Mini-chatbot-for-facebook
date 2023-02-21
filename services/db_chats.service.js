const ChatModel =require('../models/chat.model');

module.exports = {  

 //add new chat for user
  addChat:function(user,data){
    var chat = new ChatModel({
      userID:user._id,
      botMessage:data.botMessage,
      userMessage:data.userMessage
    });

    chat.save()
      .then(chatItem => {
        console.log("--add chat DB success--");
        console.log(chatItem);
      })
      .catch(err => {
          console.log(err);
    });
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

};
