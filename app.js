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

  // //delete All chat by UserID
  //var userDel=DB.getUserByFbID("FB-88");
  // userDel.then(item => {
  //   return DB.deleteChatsByUserId(item);
  // }).then(data => {
  //   console.log(data);
  // }).catch(e => 
  //   console.log(e)
  // )
 
  //delete user by FbID (FbID is not _id)
  // DB.deleteUserByFbID("FB-99").then(data => {
  //   console.log("--delete User--")
  //   console.log(data);
  // }).catch(e => 
  //   console.log(e)
  // )

app.get("/",function(req,res){
  res.send("17/2/2023 . let go to fb and chat with AI.");
})

//Add support for GET requests to our webhook(facebook)
app.get("/webhook",messengerMdw.getWebHook);

app.post('/webhook', messengerMdw.postWebHook);


app.listen(port, () => {
  console.log(` listening on port ${port}!`);
});
