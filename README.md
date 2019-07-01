# Dialogflow handover integration for Facebook messenger (webhook).

Integration for handover protocol of Facebook messenger and dialogflow (https://developers.facebook.com/docs/messenger-platform/handover-protocol).
This might be useful when having a Dialogflow chatbox integrated with Messenger and you want to have "manual override" during the user's conversation with the bot. 

# Description

This simple apps serves as a "proxy" between Facebook and dialogwflow webhook. When a "message_handover" event happens, the app does not forward it to Dialogflow, instead it processess it in the Facebook api (changes the app that controls the conversation thread). When a message happens, it gets forwarded to Dialogflow.


# How to use

To make this work (assuming you already have a working chatbot with Dialogflow):

1. Go to the dashboard of the Facebook app that you are using for Dialogflow
2. Run this node app in a webserver (SSL required to have it work with facebook) with the correct environment variables. 
3. Add the node server as a webhook in the app configuration (first you need to delete the Dialogflow subscription)
4. Subscribe the correct events (messaging and messaging handover)


## Environment variables
- DIALOGFLOW_WEBHOOK -> dialogflow webhook, you can get it from dialogflwo console
- FACEBOOK_GRAPH_API_URL -> facebook graph api
- FACEBOOK_ACCESS_TOKEN -> Facebook access token generated from your app
- VERIFY_TOKEN -> random string that facebook will verify when adding your webhook.