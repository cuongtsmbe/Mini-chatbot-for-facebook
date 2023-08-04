const GPTModel =require('../models/gpt.model');

module.exports = {  
  //add prompt
  addPrompt:async function(prompt){
    let newgpt = new GPTModel({prompt});
    return await newgpt.save();
  },

  //update prompt
  updatePromptByID:async function(id,prompt){
    return await GPTModel.updateOne({ _id: id}, { prompt });
  },

  //count prompt
  countPrompt: async function(){
    return await GPTModel.countDocuments({}).exec();
  },
  // DB mongodb use have one record(row)
  getOnePrompt: async function(){
    return await GPTModel.findOne({}).exec();
  }

};
