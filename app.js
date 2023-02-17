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

  // //delete All chat by UserID
  //var userDel=DB.getUserByFbID("FB-88");
  // userDel.then(item => {
  //   return DB.deleteChatsByUserId(item);
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
  res.send("17/2/2023 . let go to fb and chat with AI.");
})
app.get("/status",function(req,res){
  res.send("status run");
})

//Add support for GET requests to our webhook
app.get("/webhook",function(req,res,next){
  console.log("\nGET - webhook");
  next();
},messengerMdw.getWebHook);
app.post('/webhook',function(req,res,next){
  console.log("\nPOST - webhook");
  next();
}, messengerMdw.postWebHook);


app.listen(port, () => {
  console.log(` listening on port ${port}!`);
});
