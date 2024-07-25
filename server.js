const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server });

const channels = {}; 

wss.on('connection', (ws) => {
  console.log("connected")
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log(data)
        if (data.type === 'create_channel') {
            const channelId = data.channelId;
            channels[channelId] = channels[channelId] || [];
            channels[channelId].push(ws);

            ws.send(JSON.stringify({ type: 'channel_created', channelId: channelId }));
        }

        if (data.type === 'join_channel') {
            const channelId = data.channelId;
            if (channels[channelId]) {
                channels[channelId].push(ws);
                ws.send(JSON.stringify({ type: 'joined_channel', channelId: channelId }));
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
