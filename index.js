'use strict';

const functions = require('firebase-functions');

const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
//yoyo-pizza-hbfk.firebaseio.com --> database url ! we can use "https" for accessing our DB but here we use "ws"
admin.initializeApp({
credential: admin.credential.applicationDefault(),
databaseURL: 'ws://yoyo-bxik-default-rtdb.firebaseio.com/'
});
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function defaultFallback(agent) {
    agent.add(`Sorry , I didn't understand ðŸ¤·ðŸ�¼â€�â™‚ï¸�`);
    agent.add(`Something wrong with your query , can you please try again? ðŸ¤·ðŸ�¼â€�â™‚ï¸�`);
  }
  function checkoutorder(agent){
    const yoyotype = agent.parameters.yoyotype;
    const yoyosize = agent.parameters.yoyosize;
    const yoyotoppings = agent.parameters.yoyotoppings;
    const yoyopizzaname = agent.parameters.yoyopizzaname;
  //generating a random 4 digit number that is used as order id
   const orderid = Math.floor((Math.random() * 9999) + 1000);
   const yoyocustomername = agent.parameters.name;
   const yoyocustomerphone = agent.parameters.phoneno;
   const yoyocustomeraddress = agent.parameters.address;
   agent.add(`${yoyocustomername} Here's Your order id ${orderid}. Inorder to check your order ðŸšš please enter "Order Status"`);
//updating data into database
    return admin.database().ref('data').set({
 //the left fields must match database fields !
yoyo_type: yoyotype,
yoyo_size: yoyosize,
yoyo_toppings: yoyotoppings,
yoyo_pizzaname:yoyopizzaname,
orderid: orderid,
name: yoyocustomername,
mobilenumber : yoyocustomerphone,
address: yoyocustomeraddress
});
}
  
 //using order id we will track the order details from DB in this method !
  function trackorderbyid(agent){
 //getting order id from chatbot input i.e., input from user
  const orderid = agent.parameters.orderid;
  return admin.database().ref('data').once('value').then((snapshot)=>{
  //getting required or necessary details from database
  const dbOrderid = snapshot.child('orderid').val();
  const pizza_name = snapshot.child('yoyo_pizzaname').val();
  const pizza_type = snapshot.child('yoyo_type').val();
  const customer_name = snapshot.child('name').val();
  //checking if the order id obtained from user exists in the database , if yes we will print the details else we will print a msg to try again
  if(dbOrderid==orderid){
  agent.add(`Here's your Order Details , Your ${pizza_type} ${pizza_name} Pizza is almost ready!! Thank you ${customer_name} for ordering with yoyo pizza! ðŸš›ðŸ�•`);
 }
 else
 agent.add(`please check your order id and try again :) !`);
 });
 }
  
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('details', checkoutorder);
  intentMap.set('order', trackorderbyid);
  agent.handleRequest(intent);
});
