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

app.get("/",function(req,res){
  res.send("17/2/2023 . let go to fb and chat with AI.");
});

//Add support for GET requests to facebook webhook
app.get("/webhook",messengerMdw.getWebHook);
app.post('/webhook', messengerMdw.postWebHook);


require("./routers/orders.router").orderRouters(app);

app.get("/about",function(req,res){
  res.send("17/2/2023 .AUTHOR : PHAN HUU CUONG , PHONE:0349612646");
});

app.listen(port, () => {
  console.log(` listening on port ${port}!`);
});
