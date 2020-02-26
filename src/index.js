const PORT = process.env.PORT || 8001;
const ENV = require('./environment');

const app = require('./application')(ENV, { updateAppointment });
const server = require('http').Server(app);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

let clientId = 0;

wss.on('connection', socket => {
  socket.send(
    JSON.stringify({
      id: clientId++,
      type: 'SET_ID'
    })
  );
  socket.onmessage = event => {
    console.log(`Message Received: ${event.data}`);

    if (event.data === 'ping') {
      socket.send(JSON.stringify('pong'));
    }
  };
});

function updateAppointment(id, interview) {
  wss.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'SET_INTERVIEW',
          id,
          interview,
          clientId
        })
      );
    }
  });
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT} in ${ENV} mode.`);
});
