const express = require('express');
const http = require('http');
const app = express();

var port = process.env.PORT || 3000;
var server = http.createServer(app);

const socketIo = require('socket.io');
const io = socketIo(server);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
});

server.listen(port, function () {
  console.log('Listening on port ' + port + '.');
});

io.on('connection', function (socket) {
  console.log('A user has connected.');
});

module.exports = server;
