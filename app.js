'use strict';

const DIALOGFLOW_WEBHOOK = process.env.DIALOGFLOW_WEBHOOK;
const FACEBOOK_GRAPH_API_URL = process.env.FACEBOOK_GRAPH_API_URL;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  axios = require('axios'),
  server = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
server.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook 
server.post('/webhook', (req, res) => {  
 
    let body = req.body;
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        if (webhook_event.request_thread_control || webhook_event.pass_thread_control || webhook_event.take_thread_control) {

            // Change the thing
            let fbReqBody = {
                recipient: webhook_event.sender,
                metadata: "Changing control thread" 
            }
            console.log(webhook_event);
            if(webhook_event.request_thread_control) {
                fbReqBody.target_app_id = webhook_event.request_thread_control.requested_owner_app_id;
                axios.post(
                    `${FACEBOOK_GRAPH_API_URL}/pass_thread_control?access_token=${FACEBOOK_ACCESS_TOKEN}`,
                    fbReqBody
                ).then(function(response) {})
                .catch(function (error) {
                    console.log('Fb error', error);
                });
            } else if(webhook_event.pass_thread_control) {
              axios.post(
                  `${FACEBOOK_GRAPH_API_URL}/take_thread_control?access_token=${FACEBOOK_ACCESS_TOKEN}`,
                  fbReqBody
              ).then(function(response) {})
              .catch(function (error) {
                  console.log('Fb error', error);
              });
            }

        } else {
            // Forward to dialog flow
            axios.post(`${DIALOGFLOW_WEBHOOK}`, body)
            .then(function(response) {})
            .catch(function (error) {
                console.log('Dialogflow error', error.response);
            });
        }
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
  });


// Adds support for GET requests to our webhook
server.get('/webhook', (req, res) => {
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });

