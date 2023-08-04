const LINK = require("../util/links.json");
const DB_GPT= require("../services/db_gpt.service");
module.exports = {
    gptRouters:function(app){
        app.put(    LINK.CLIENT.EDIT_PROMPT                  ,this.editPrompt);
    },
    //edit/addnew for prompt

    editPrompt: async function(req,res){
        let prompt={
          content:req.body.prompt
        }

        //check value prompt content
        if(prompt.content === null || prompt.content === undefined || typeof prompt.content !== "string"){
            return res.json({
                status:400,
                message: "Error prompt is not string."
            });
        }
        //get count record in prompt DB
        let countPrompt=await DB_GPT.countPrompt();
      
        try{
          
          //if count is 0 (then) add new promt (else) update prompt
          if(countPrompt == 0){
            //add new prompt
            let result= await DB_GPT.addPrompt(prompt.content);
      
            return res.json({
              status:200,
              message: "add new prompt success.",
              data : result
            });
      
          }else{
      
            //update prompt 
            let getOne= await DB_GPT.getOnePrompt();

            let result= await DB_GPT.updatePromptByID(getOne._id,prompt.content);
     
            //if modified count is 0 then response fail
            if(result.modifiedCount==0){
              return res.json({
                status:200,
                message: "update prompt fail."
              });
            }
      
            //if modified count != 0 then response success
            return res.json({
              status:200,
              message: "update prompt success.",
              data : result
            });
      
          }
        }catch(err){
          console.log(err);
          return res.json({
              status:500,
              message: "server/DB error.delete failed."
          });
        }
      
      }
}