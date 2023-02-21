const SummaryChatModel =require('../models/chat_summary.model');

module.exports = {  

 //add new chat for user
  addSummaryChat:function(user,data){
    var Summary = new SummaryChatModel({
      userID:user._id,
      Content:data.content,
    });

    Summary.save()
      .then(chatItem => {
        console.log("--add summary chat DB success--");
        console.log(chatItem);
      })
      .catch(err => {
          console.log(err);
    });
  },

  //update summary for chat by fbid
  //return promise
  updateSummaryChatByUserID:function(user,data){
    SummaryChatModel.updateOne({ userID: user._id}, { content:data.content},function (err, result) {
      if (err){
          console.log(err)
      }
      else{
          console.log("Updated Summary Chat: ", result);
      }
  });
  
  },

  //get chats of user 
  //return promise
  getSummaryChatsByUserId:async function(user) {
    let summaryRow = await SummaryChatModel.find({userID:user._id})
    .exec();
    return summaryRow;
  },

  //del chats of user 
  //return promise
  deleteSummaryChatsByUserId: async function(user) {
    let deletedSummary = await SummaryChatModel.deleteMany({ userID: user._id }).exec();
    return deletedSummary;
  },

};
