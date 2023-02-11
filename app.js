const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cors=require('cors');
require('dotenv').config();
const Message = require("./mdw/handleMessage");

// parse application/x-www-form-urlencoded
 app.use(bodyParser.urlencoded({ extended: false }))
 // parse application/json
 app.use(bodyParser.json())
 app.use(cors({
   origin: ["https://www.facebook.com"],
   methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD','DELETE'],
   credentials: true
 }));



const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;







// Add support for GET requests to our webhook
app.get("/webhook", (req, res) => {
  
// Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }

  res.sendStatus(404);
});


app.post('/webhook', (req, res) => {  

    // Parse the request body from the POST
    let body = req.body;
  
    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
  
      // Iterate over each entry - there may be multiple if batched
      // handle in message - messenger or postback
      body.entry.forEach(function(entry) {

        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);
      
      
        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);
      
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
            Message.handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
            Message.handlePostback(sender_psid, webhook_event.postback);
        }
        
      });
  
      // Return a '200 OK' response to all events
      res.status(200).send('EVENT_RECEIVED');
  
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
});


app.listen(port, () => {
  console.log(` chatbot ( facebook )listening on port ${port}!`);
});
