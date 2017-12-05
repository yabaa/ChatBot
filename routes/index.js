	var express = require('express');
	var requests = require('request');
	var body_parser = require('body-parser');
	var router = express.Router().use(body_parser.json());
	
	var token = process.env.TOKEN_VALUE;

	/* GET home page. */
	router.get('/', function(req, res, next) {
	  res.render('index', { title: 'Express' });
	});

	// Adds support for GET requests to our webhook
	router.get('/webhook/', (req, res) => {
	    if (req.query['hub.verify_token'] === "yBot_token_test") {
			res.send(req.query['hub.challenge']);      
	    } else {
	      res.sendStatus(403);      
	    }
	});

	router.post('/webhook/', (req, res) => {  
	    // Iterates over each entry - there may be multiple if batched
	    req.body.entry.forEach(function(entry) {
	      	// Gets the message. entry.messaging is an array, but 
	      	// will only ever contain one message, so we get index 0
	      	// Gets the body of the webhook event
      		for (i = 0; i < entry.messaging.length; i++) {
				webhook_event = entry.messaging[i];   
				sender_psid = webhook_event.sender.id;
				if (webhook_event.message && webhook_event.message.text) {
				  	text = webhook_event.message.text;
				  	console.log("Send message : "+text + " to sender id : "+sender_psid);
			  		sendTextMessange(sender_psid, text);
				}
      		}
	      	
	    });
	    res.sendStatus(200);

	});

	/*function sendTextMessange(sender, text) {
		messageData = {
			text:text
		}
		request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: {access_token: token},
			method: 'POST',
			json: {
				recipient: {id: sender},
				message: messageData
			}
		}, function(error, response, body) {
			if (error) {
				console.log('Error sending message: ', error);
			} else if (response.body.error) {
				console.log('Error: ', response.body.error);
			}
		});
	}*/

	function sendTextMessage(recipientId, messageText) {
		var messageData = {
		recipient: {
		  id: recipientId
		},
		message: {
		  text: messageText
		}
		};

		callSendAPI(messageData);
		}

	function callSendAPI(messageData) {
		request({
			uri: 'https://graph.facebook.com/v2.6/me/messages',
			qs: { access_token: token },
			method: 'POST',
			json: messageData
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
			  var recipientId = body.recipient_id;
			  var messageId = body.message_id;

			  console.log("Successfully sent generic message with id %s to recipient %s", 
			    messageId, recipientId);
			} else {
			  console.log(response.statusCode)
			  console.error("Unable to send message.");
			  console.error(response);
			  console.error(error);
			}
		});  
	}	

	module.exports = router;
