const {Configuration, OpenAIApi} = require("openai");
require('dotenv').config();
const DB_SUMMARY=require('./db_summaries.service');
const DB_CHATS=require('./db_chats.service');
//send prompt to openAI and return reply
class ChatGPTService {
    BasePrompt = 'Giả sử bạn là CườngGPT một nhân viên bán hàng. Hãy giới thiệu và bán "áo sơ mi , size S, phù hợp người 45 kg đến 56 kg,quần jean ADI, size M,phù hợp người 40 kg đến 45 kg,quần jean ADI, size S,phù hợp người 45 kg đến 56 kg,áo thun ADI, size XL,phù hợp người từ 60 kg đến 80 kg,áo thun ADI, size XXL,phù hợp người trên 80 kg" cho khách hàng. khi khách chốt đơn thì bạn sẽ xác nhận thông tin khách hàng và kèm theo chữ "[THONGTINDON]" phía sau cùng. ';
   // Load key từ file environment
    configuration = new Configuration({apiKey: process.env.OPENAI_KEY});
    openai = new OpenAIApi(this.configuration);

    //send prompt to openAI and return text(String) result
    async generateCompletion(prompt) {

        // Gửi request về OpenAI Platform để tạo text completion
        const completion = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt:prompt,
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        //loại bỏ dấu cách và xuống dòng dư thừa
        let reponseAIText = completion.data.choices[0].text.replace(/^\s+|\s+$/g, "");

        return reponseAIText;

    }

    //get AI reply for question Customer (based on summarized chats history ) 
    async GetAIReplyForCustomer(user,userPrompt){
        // get summary chats of user
        let currentSummary= await DB_SUMMARY.getSummaryChatsByUserId(user);

        let PromptSale = this.BasePrompt + '\n\n';
        let saveSummary="";

        if (currentSummary && currentSummary.length > 0 ) {
            // nếu có tin nhắn cũ thì thêm đoạn tin nhắn cũ đấy vào nội dung chat
            for (let history of currentSummary) {
                PromptSale += `Biết đoạn sau đây là tóm tắt trò chuyện lúc trước của AI và user: ${history.Content}\n `;
                saveSummary=history.Content;
            }
        }else{
            //thêm trước để update không bị lỗi
            DB_SUMMARY.addSummaryChat(user,{content:" "});
        }

        PromptSale += `Bây giờ user nói: ${userPrompt}\n`;
        PromptSale += `AI: `;

        console.log("-------------PromptSale-----------------");
        console.log(PromptSale);
        console.log("---------------------------------------");
        //send prompt of user to openAI and receive AI reply  
        let AIReply =await this.generateCompletion(PromptSale);

        //add chat content for user
        DB_CHATS.addChat(user,{
            botMessage:AIReply,
            userMessage:userPrompt
        });

        //send prompt for AI and require summary history and current chat
        this.GetSummaryChats(user,saveSummary,{user:userPrompt,AI:AIReply});
        
        return AIReply;
    }


    //get summary chats of user from openAI
    async GetSummaryChats(user,historySummary,current) {

        let promptSummary=` lịch sử trò chuyện trước đó là "${historySummary}" \n hiện tại thì "user: ${current.user}\nAI:${current.AI}" \n . Hãy tóm tắt cuộc trò chuyện đó`;
        
        //send to openAI
        let AIReplySummary =await this.generateCompletion(promptSummary);
        console.log("---------------sau tóm tắt -----------");
        console.log(AIReplySummary);
        console.log("--------------------------------------\n");
        //update summary history chat in DB
        DB_SUMMARY.updateSummaryChatByUserID(user,{content:AIReplySummary});

    }
}

module.exports = new ChatGPTService();