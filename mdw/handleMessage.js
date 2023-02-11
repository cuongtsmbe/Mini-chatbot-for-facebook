const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

module.exports={
//handle Messenger text or file
    handleMessage: function(sender_psid, received_message) {
        let response;
        
        // Checks if the message contains text
        if (received_message.text) {    
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
        }
        } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                "title": "Is this the right picture?",
                "subtitle": "Tap a button to answer.",
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
        response = { "text": "Oops, try sending another image." }
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
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
        }); 
    }



}