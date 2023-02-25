const request = require('request');
require('dotenv').config();
const DB_USERS=require('./db_users.service');
const openaiService = require('./gpt.service');
const DB_ORDERS=require('./db_orders.service');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

module.exports={
//handle Messenger text or file
    handleMessage:async function(sender_psid, received_message) {
        let response;
        //chặn hook có sender là fanpage và received là khách
        //nếu cho qua sẽ tại ra đoạn chatgpt không cần thiết  
        if(sender_psid==process.env.PSID_FANPAGE){ 
            console.log(`------fanpage id:${sender_psid}---------`);
            return true;
        }
        // Checks if the message contains text
        if (received_message.text) {  
            // Create the payload for a AI response text message, which
            // will be added to the body of our request to the Send API

            // get user by fbid
            let userCurrent =await DB_USERS.getUserByFbID(sender_psid);
            
            //add mongodb order user send to fanpage
            //thêm "donhang" vào để phòng trg hợp khách hàng ghi sai/không ghi : "LENDON" || lendon
            if(received_message.text.includes("LENDON")||received_message.text.includes("lendon")||received_message.text.includes("donhang")){
                DB_ORDERS.addOrder(userCurrent,{content:received_message.text});
            }

            //return if user active == 0 (turn off AI)
            if(userCurrent.active==0){return ;}

            let AIreponse=await openaiService.GetAIReplyForCustomer(userCurrent,received_message.text);
            
            console.log(`------user id:${sender_psid}---------`);
            console.log("\n\n");
            console.log("--------Chat----------");
            console.log(`user: ${received_message.text}`);
            console.log(`AI: ${AIreponse}`);
            console.log("--------###-------\n\n");
            console.log("\n");

            response = {
                "text": AIreponse
            }
        } else if (received_message.attachments) {
            // Get the URL of the message attachment
            // reponse for image or ..
            let attachment_url = received_message.attachments[0].payload.url;
            response = {
                "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                    "title": "Is this the right picture?",
                    "subtitle": "Tôi không hiểu ảnh này của bạn.Làm ơn hãy gửi text cho tôi.",
                    "image_url": attachment_url,
                    "buttons": [
                        {
                        "type": "postback",
                        "title": "Yes!",
                        "payload": "yes",
                        },
                        {
                        "type": "postback",
                        "title": "No!",
                        "payload": "no",
                        }
                    ],
                    }]
                }
                }
            }
        } 
        
        // Send the response message
        this.callSendAPI(sender_psid, response);    
    },

    
    // Handles messaging_postbacks events
    handlePostback: function(sender_psid, received_postback) {
        let response;
        
        // Get the payload for the postback
        let payload = received_postback.payload;
    
        // Set the response based on the postback payload
        if (payload === 'yes') {
        response = { "text": "Thanks!" }
        } else if (payload === 'no') {
        response = { "text": "Oops, try sending text." }
        }
        // Send the message to acknowledge the postback
        this.callSendAPI(sender_psid, response);
    },

    // Sends response messages via the Send API
    // response from page to sender_id
    callSendAPI: function(sender_psid, response) {
        // Construct the message body
        let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
        }
    
        // Send the HTTP request to the Messenger Platform
        request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
        }, (err, res, body) => {
        if (!err) {
            console.log('message sent!',request_body);
            
        } else {
            console.error("Unable to send message:" + err);
        }
        }); 
    }



}