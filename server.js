const express = require('express');
const http = require('http');
const app = express();
const generateId = require('./public/generate-id');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || 3000;
var server = http.createServer(app);

const socketIo = require('socket.io');
const io = socketIo(server);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.polls = {};

votes = {};
function countVotes (votes) {
  var voteCount = {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };
  for (var vote in votes) {
    voteCount[votes[vote]]++
  }
  return voteCount;
}

app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/polls/:id', (request, response) => {
  var currentPoll = app.locals.polls[request.params.id];
  response.render('pages/poll', { poll: currentPoll});
});

app.post('/polls', (request, response) => {
  var id = generateId();
  app.locals.polls[id] = request.body;
  response.redirect('/polls/' + id);
});

server.listen(port, function () {
  console.log('Listening on port ' + port + '.');
});

io.on('connection', function (socket) {
  console.log('A user has connected.');

  socket.on('message', function (channel, message) {
    if (channel === 'voterChoice') {
      votes[socket.id] = message;
      io.sockets.emit('voteCount', countVotes(votes));
    }
  });

  socket.on('disconnect', function () {
    delete votes[socket.id];
  });
});

module.exports = server;
