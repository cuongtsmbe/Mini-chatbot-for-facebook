const express = require("express");
const app = express();
require('dotenv').config();
const port = process.env.PORT || 80;
const bodyParser = require('body-parser');
const cors=require('cors');
const messengerMdw = require("./mdw/messenger.mdw");
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
  // DB.addUser("FB-55");

  // //add chat content for user
  // var chatOfUser=DB.getUserByFbID("FB-99");
  // chatOfUser.then(user => {
  //   DB.addChat(user,{
  //       botMessage:"chao ban toi la bot",
  //       userMessage:"toi muon hoi ban facebook 99-4"
  //   });
  //   DB.addChat(user,{
  //     botMessage:"chao ban toi la bot",
  //     userMessage:"toi muon hoi ban facebook 99-5"
  //   });
  //   DB.addChat(user,{
  //       botMessage:"chao ban toi la bot",
  //       userMessage:"toi muon hoi ban facebook 99-6"
  //   });
  // }).catch(e => 
  //   console.log(e)
  // )
  
  // //get all chat of one userID 
  // var userFindChat=DB.getUserByFbID("FB-99");
  // userFindChat.then(item => {
  //   return DB.getChatByUserId(item);
  // }).then(data => {
  //   console.log("data chats");
  //   console.log(data);
  // }).catch(e => 
  //   console.log(e)
  // )

  // //delete All chat by UserID
  //var userDel=DB.getUserByFbID("FB-88");
  // userDel.then(item => {
  //   return DB.deleteChatByUserId(item);
  // }).then(data => {
  //   console.log(data);
  // }).catch(e => 
  //   console.log(e)
  // )
 
 
  // DB.deleteUserByFbID("FB-99").then(data => {
  //   console.log("--delete User--")
  //   console.log(data);
  // }).catch(e => 
  //   console.log(e)
  // )

app.get("/",function(req,res){
  res.send("let go to fb and chat now.");
})
app.get("/status",function(req,res){
  res.send("status run");
})

//Add support for GET requests to our webhook
app.get("/webhook",messengerMdw.getWebHook);
app.post('/webhook', messengerMdw.postWebHook);


app.listen(port, () => {
  console.log(` listening on port ${port}!`);
});
