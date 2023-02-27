const {Configuration, OpenAIApi} = require("openai");
require('dotenv').config();
const DB_SUMMARY=require('./db_summaries.service');
const DB_CHATS=require('./db_chats.service');
const DB_GPT = require('./db_gpt.service');

//send prompt to openAI and return reply
class openAIService {

    //prompt example
    //BasePrompt = `Giả sử bạn là CườngGPT một nhân viên bán hàng. Hãy giới thiệu và bán :"iphone 8" cho khách hàng. khi khách muốn đặt mua hay cập nhật lại đơn thì bạn sẽ gửi chữ dòng chữ "'vui lòng gửi theo cú pháp: [LENDON] kh:[điền tên];sdt:[SĐT Khach Hang];diachi:[địa chỉ giao hàng];donhang:[những sản phẩm muốn mua]. Để hệ thống có thể  tạo đơn/cập nhật lại đơn'" cho họ. Nếu khách hàng đã gửi [LENDON] đó rồi thì bạn sẽ chỉ trả lời cho họ dòng chữ sau "Cảm ơn bạn,Đơn hàng của bạn sẽ được gửi đến vào thời gian sơm nhất"`;
    BasePrompt = `Giả sử bạn là CườngGPT một nhân viên tư vấn bất động sản. Hãy giới thiệu và bán :"cho tôi ngôi nhà giá 8 tỷ tại quận 8,hcm" cho khách hàng. khi khách muốn đặt mua hay cập nhật lại đơn thì bạn sẽ gửi chữ dòng chữ `;
    //BasePrompt;
   // Load key từ file environment
    configuration = new Configuration({apiKey: process.env.OPENAI_KEY});
    openai = new OpenAIApi(this.configuration);

    //send prompt to openAI and return text(String) result
    async generateCompletion(prompt,temperature=0.7) {

        // Gửi request về OpenAI Platform để tạo text completion
        const completion = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt:prompt,
            temperature: temperature,
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

        // //get prompt from DB
        // let promptObj = await DB_GPT.getOnePrompt();

        // // assign value from DB for BasePrompt variable
        // if(promptObj === null){
        //     this.BasePrompt = " ";
        // }else{
        //     this.BasePrompt = promptObj.prompt; 
        // }

        console.log("------------------BasePrompt--------------");
        console.log(this.BasePrompt);

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

        console.log("\n\n-------------PromptSale-----------------");
        console.log(PromptSale);
        console.log("\n\n---------------------------------------");
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
        
        //send to openAI with temperature=0
        let AIReplySummary =await this.generateCompletion(promptSummary,1);
        console.log("\n\n\n---------------sau tóm tắt -----------");
        console.log(AIReplySummary);
        console.log("--------------------------------------\n\n\n\n");
        //update summary history chat in DB
        DB_SUMMARY.updateSummaryChatByUserID(user,{content:AIReplySummary});

    }
}

module.exports = new openAIService();