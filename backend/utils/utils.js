const Message = require('../model/message');

async function getMessages() {
    // Load messages from MongoDB
    const messagesFromDB = await Message.find({});
    return messagesFromDB;
}

async function addMessage(message) {
    // Save the message to MongoDB
    const newMessage = new Message({name:message.name, content:message.content, timestamp: message.timestamp});
    await newMessage.save();

    return newMessage;
}


module.exports = { getMessages, addMessage }
