const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors=require('cors');
require('dotenv').config();
const messengerMdw = require("./mdw/messenger.mdw");
const ChatGPTService = require('./services/chatgpt.service');
const DB = require('./services/db.service');

//connect DB 
DB.connect().then(async () => {
    await DB.getUserByFbId("daylama");
    
});

// parse application/x-www-form-urlencoded
 app.use(bodyParser.urlencoded({ extended: false }))
 // parse application/json
 app.use(bodyParser.json())
 app.use(cors({
   origin: ["https://www.facebook.com"],
   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD','DELETE'],
   credentials: true
 }));


//Add support for GET requests to our webhook
app.get("/webhook",messengerMdw.getWebHook);
app.post('/webhook', messengerMdw.postWebHook);


app.listen(port, () => {
  console.log(` chatbot (chatgpt-vs-facebook) listening on port ${port}!`);
});
