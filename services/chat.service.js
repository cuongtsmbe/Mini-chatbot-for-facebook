const {Configuration, OpenAIApi} = require("openai");
require('dotenv').config();
const DB=require('./db.service');

class ChatGPTService {
    salesperson = 'Tôi muốn bạn hành động như một nhân viên bán hàng. Cố gắng tiếp thị "dịch vụ viết code ứng dụng chatbot vào facebook" với tôi, nhưng hãy làm cho thứ mà bạn đang cố gắng tiếp thị trông có giá trị hơn thực tế và thuyết phục tôi mua nó. Bây giờ tôi sẽ giả vờ như bạn đang nhắn tin cho tôi và hỏi bạn nhắn để làm gì. Xin chào, bạn nhắn để làm gì?';

    //user: is obj
    //prompt: text of user
    async generateCompletion(user,prompt) {
        // Load key từ file environment
        const configuration = new Configuration({
        apiKey: process.env.OPENAI_KEY,
        });
        const openai = new OpenAIApi(configuration);

        // get current chats of user
       
        let currentChats= await DB.getChatsByUserId(user);

        let PromptSale = this.salesperson + '\n\n';

        if (currentChats && currentChats.length > 0) {
            // nếu có tin nhắn cũ thì thêm đoạn tin nhắn cũ đấy vào nội dung chat
            for (let message of currentChats) {
                PromptSale += `user: ${message.userMessage}\n`;
                PromptSale += `AI: ${message.botMessage}\n\n`;
            }
          }

        PromptSale += `user: ${prompt}\n`;
        PromptSale += `AI: `;

        console.log("-------------PromptSale-----------------");
        console.log(PromptSale);
        
        // Gửi request về OpenAI Platform để tạo text completion
        const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt:PromptSale,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        });

        //loại bỏ dấu cách và xuống dòng dư thừa
        let reponseAIText = completion.data.choices[0].text.replace(/^\s+|\s+$/g, "");

        //add chat content for user
        
        await DB.addChat(user,{
            botMessage:reponseAIText,
            userMessage:prompt
        });

        return reponseAIText;

    }
}

module.exports = new ChatGPTService();