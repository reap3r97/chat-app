const mongoose = require('mongoose');

// Define the message schema
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: String, required: true }
});

// Create the message model
module.exports = Message = mongoose.model('Message', messageSchema);