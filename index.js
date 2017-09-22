require('dotenv').config({ path: 'variables.env' });

const http = require('http');
const repositories = require('./repositories');
const connectionController = require('./controllers/connectionController');
const server = http.createServer();
const io = require('socket.io')(server);

io.on('connection', connectionController.connect);

server.listen(process.env.PORT || 8080, () => {
  console.log(`App running → PORT ${server.address().port}`);
});
