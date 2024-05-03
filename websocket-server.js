const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');
  ws.send('Welcome New Client!');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.on('close', () => {
    console.log('A client disconnected');
  });
});

console.log('WebSocket server started on ws://localhost:8080');