const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  
  console.log('New client connected');

  ws.send('Welcome to the WebSocket server!');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    ws.send(`You sent: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(4000, () => {
  console.log('Server is listening on port 4000');
});
