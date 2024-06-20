// routes/chatRoutes.js
const { Chat,Product } = require('../../models/allModels');

async function chatRoutes(fastify, options) {
  fastify.post('/chats', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    console.log(request.body);
    let retailer, customer,product;
    const id = request.body.id;
    const userId = request.user.userId;
    if (userId.rId) {
      retailer = userId._id;
      customer = id;
      product = request.body.product;
    } else {
      retailer = id;
      customer = userId._id;
      product = request.body.product;
    }
    console.log(retailer);
    console.log(customer);
    console.log(product);

    try {
    
      const chats = await Chat.find({ $and: [{ "retailer": retailer }, { "customer": customer }, { "product": product }] }).sort({ "messages.timestamp": 1 }).populate('product').populate('customer').populate('retailer');
        for (let i = 0; i < chats.length; i++) {
          const chat = chats[0];
          for (let j = 0; j < chat.messages.length; j++) {
            const message = chat.messages[j];
            if (message.receiver._id == userId._id) {
              message.isRead = true;
              await chat.save(); // Assuming you want to save the chat, not the message
            }
          }
        }
        if(chats.length>0){
          reply.send(chats);
        }else{
          reply.status(501).send(err);
        }
        
      } 
    catch (err) {
      reply.status(500).send(err);
    }
  });

  fastify.post('/addchat', async (request, reply) => {
    try {
      const chat = new Chat(request.body);
      await chat.save();
      // const populatedChat = await chat.populate('sender').populate('receiver').execPopulate();
      reply.send(chat);
    } catch (err) {
      reply.status(500).send(err);
    }
  });
}

module.exports = chatRoutes;
