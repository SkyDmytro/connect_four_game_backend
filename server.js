const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const {v4 : uuidv4} =require('uuid')

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server });

const channels = {}; 

wss.on('connection', (ws) => {
    const clientId1 = uuidv4();
    const clientId2 = uuidv4()
    const currentTurn = "blue";

    console.log("connected");
    
  console.log("connected")
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(data)
        if (data.type === 'create_channel') {
            const channelId = data.channelId;
            channels[channelId] = channels[channelId] || [];
            channels[channelId].push(ws);
            console.log("create channel")
            
            const newUser = { type: 'channel_created', channelId: channelId, userId:clientId1, color:"blue",currentTurn:currentTurn }
            ws.send(JSON.stringify(newUser))
        }

        if (data.type === 'join_channel') {
            const channelId = data.channelId;
            if (channels[channelId]) {
                channels[channelId].push(ws);
                ws.send(JSON.stringify({ type: 'joined_channel', channelId: channelId,userId:clientId2,color:"red",currentTurn:currentTurn }));
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Channel does not exist' }));
            }
        }

        if (data.type === 'message') {
            const channelId = data.channelId;
            if (channels[channelId]) {
                channels[channelId].forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ from: data.userId, text: data.text }));
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        console.log("closed")
        for (const channelId in channels) {
            channels[channelId] = channels[channelId].filter(client => client !== ws);
            if (channels[channelId].length === 0) {
                delete channels[channelId];
            }
        }
    });
});
app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(4000, () => {
  console.log('Server is listening on port 4000');
});
