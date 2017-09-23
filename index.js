require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const repositories = require('./repositories');
const connectionController = require('./controllers/connectionController');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: '*' }));

app.post('/webhook', (req, res) => {
  console.log(req.payload);
  res.json('hey');
});

app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

const io = require('socket.io')(server, {
  log: false,
  agent: false,
  origins: '*:*',
  transports: [
    'websocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling',
    'polling'
  ]
});
io.on('connection', connectionController.connect);
