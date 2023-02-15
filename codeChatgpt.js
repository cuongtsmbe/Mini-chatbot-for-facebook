/*Để tích hợp chatgpt và mongoose, bạn có thể sử dụng thư viện @google-cloud/language để gọi API của Google Cloud Natural Language để phân tích nội dung của câu hỏi, sau đó sử dụng model chatgpt để trả lời câu hỏi và lưu lại thông tin vào cơ sở dữ liệu MongoDB thông qua Mongoose.*/

const express = require('express');
const bodyParser = require('body-parser');
const { LanguageServiceClient } = require('@google-cloud/language');
const mongoose = require('mongoose');
const ChatGPT = require('chatgpt'); // thay bằng tên thư viện chatgpt thực tế

const app = express();
const port = 3000;

// Kết nối cơ sở dữ liệu MongoDB với Mongoose
mongoose.connect('mongodb://localhost/chatbot');

// Khởi tạo client cho Google Cloud Natural Language API
const languageClient = new LanguageServiceClient();

// Khởi tạo model ChatGPT
const chatGPT = new ChatGPT();

// Khai báo schema cho câu hỏi và câu trả lời
const qaSchema = new mongoose.Schema({
  question: String,
  answer: String
});

// Khai báo model cho collection lưu câu hỏi và câu trả lời
const QA = mongoose.model('QA', qaSchema);

// Sử dụng body-parser để lấy dữ liệu từ request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Định nghĩa endpoint xử lý câu hỏi
app.post('/ask', async (req, res) => {
  const question = req.body.question;

  // Phân tích nội dung câu hỏi bằng Google Cloud Natural Language API
  const [result] = await languageClient.analyzeSentiment({ document: { content: question, type: 'PLAIN_TEXT' } });
  const score = result.documentSentiment.score;
  
  let answer = '';

  // Trả lời câu hỏi bằng ChatGPT nếu câu hỏi có nội dung
  if (question.trim() !== '') {
    answer = await chatGPT.generateAnswer(question);
  }

  // Lưu thông tin câu hỏi và câu trả lời vào cơ sở dữ liệu
  const qa = new QA({ question, answer });
  qa.save();

  res.json({ answer });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});