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
app.locals.adminPolls = {};

votes = {};
function countVotes (votes) {
  var voteCount = {
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    e: 0,
    f: 0
  };
  for (var vote in votes) {
    voteCount[votes[vote]]++
  }
  return voteCount;
}

app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/admin-poll', (request, response) => {
  response.render('pages/admin-poll')
});

app.get('/open-poll', (request, response) => {
  response.render('pages/open-poll')
});

app.get('/polls/:id', (request, response) => {
  var currentPoll = app.locals.polls[request.params.id];
  response.render('pages/poll', { poll: currentPoll});
});

app.get('/admin-polls/:id', (request, response) => {
  var currentPoll = app.locals.adminPolls[request.params.id];
  response.render('pages/admin-results', { poll: currentPoll});
});

app.post('/polls', (request, response) => {
  var referer = request.headers.referer
  var id = generateId();
  if (referer.search('open-poll') > -1) {
    console.log('open-poll');
    app.locals.polls[id] = request.body;
    response.redirect('/polls/' + id);
  } else if (referer.search('admin-poll') > -1) {
    console.log('admin-poll');
    app.locals.adminPolls[id] = request.body;
    response.redirect('/admin-polls/' + id);
  }
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
