const {Configuration, OpenAIApi} = require("openai");
require('dotenv').config();

class ChatGPTService {
    salesperson = 'Tôi muốn bạn hành động như một nhân viên bán hàng. Cố gắng tiếp thị "dịch vụ viết code ứng dụng chatbot vào facebook" với tôi, nhưng hãy làm cho thứ mà bạn đang cố gắng tiếp thị trông có giá trị hơn thực tế và thuyết phục tôi mua nó. Bây giờ tôi sẽ giả vờ như bạn đang nhắn tin cho tôi và hỏi bạn nhắn để làm gì. Xin chào, bạn nhắn để làm gì?';


    async generateCompletion(prompt) {
        // Load key từ file environment
        const configuration = new Configuration({
        apiKey: process.env.OPENAI_KEY,
        });
        const openai = new OpenAIApi(configuration);


        let PromptSale = this.salesperson + '\n\n';

        PromptSale += `user: ${prompt}\n`;
        PromptSale += `salesperson: `;


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
        // Đoạn regex ở cuối dùng để loại bỏ dấu cách và xuống dòng dư thừa
        return completion.data.choices[0].text.replace(/^\s+|\s+$/g, "");
    }
}

module.exports = new ChatGPTService();