const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors=require('cors');
require('dotenv').config();
const messengerMdw = require("./mdw/messenger.mdw");
const ChatGPTService = require('./services/chatgpt.service');
const DB=require('./services/db.service');


// parse application/x-www-form-urlencoded
 app.use(bodyParser.urlencoded({ extended: false }))
 // parse application/json
 app.use(bodyParser.json())
 app.use(cors({
   origin: ["https://www.facebook.com"],
   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD','DELETE'],
   credentials: true
 }));


  //connect DB
  DB.connect();
  //add user
  // DB.addUser("FB-66");

  //add chat content
  // DB.addChat({
  //   user:DB.getUserByFbID("FB-66"),
  //   botMessage:"chao ban toi la bot",
  //   userMessage:"toi muon hoi ban facebook 66-1"
  // });

  //get all chat of one userID 
  //DB.getChatByUserId(DB.getUserByFbID("FB-66")._id);


  //delete All chat by UserID
  //DB.deleteChatByUserId(DB.getUserByFbID("FB-66")._id);
  

//Add support for GET requests to our webhook
app.get("/webhook",messengerMdw.getWebHook);
app.post('/webhook', messengerMdw.postWebHook);


app.listen(port, () => {
  console.log(` listening on port ${port}!`);
});
