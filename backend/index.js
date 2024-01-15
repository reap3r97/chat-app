
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Message = require('./model/message');
const config = require("./config/db");
const util = require('./utils/utils');

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose.connect(config.database, {
    maxPoolSize: 50,
    wtimeoutMS: 2500,
});

wss.on('connection', (ws) => {
    console.log('A user connected');

    // Retrieve old messages from MongoDB
    util.getMessages()
        .then((messages) => {
            ws.send(JSON.stringify(messages));
        })
        .catch((err) => {
            console.error('Error retrieving messages:', err);
        });

    ws.on('message', (message) => {
        // Save the new message to MongoDB
        if (!message) {
            return null;
        }

        const message1 = JSON.parse(message);

        if (!message1.name) {
            return null;
        }

        if (!message1.text) {
            return null;
        }

        if (!message1.timestamp) {
            return null;
        }

        message1.timestamp = new Date(message1.timestamp);
        const newMessage = new Message({ name: message1?.name, content: message1?.text, timestamp: message1?.timestamp });

        util.addMessage(newMessage)
            .then(() => {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify([newMessage])); // Send the new message to other clients
                    }
                });
            })
            .catch((err) => {
                console.error('Error saving message:', err);
            });
    });

    ws.on('close', () => {
        console.log('User disconnected');
    });
});

app.post('/addMessage', (req, res) => {
    if (!req.body.name) {
        return res.send({ "success": false, "message": "invalid message" })
    }

    if (!req.body.text) {
        return res.send({ "success": false, "message": "invalid message" })
    }

    const message1 = req.body;
    message1.timestamp = new Date();
    const newMessage = new Message({ name: message1?.name, content: message1?.text, timestamp: message1?.timestamp });

    util.addMessage(newMessage)
        .then(() => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify([newMessage])); // Send the new message to other clients
                }
            });
        })
        .catch((err) => {
            console.error('Error saving message:', err);
        });
    res.status(200).send('Message added successfully');
});

app.get('/getMessages', async (req, res) => {
    util.getMessages()
        .then((messages) => {
            ws.send(JSON.stringify(messages));
        })
        .catch((err) => {
            console.error('Error retrieving messages:', err);
        });

    res.status(200).send(messagesData);
});

server.listen(3000, () => {
    console.log('Server listening on *:3000');
});