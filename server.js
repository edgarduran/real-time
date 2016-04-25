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
adminVotes = {};
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
    voteCount[votes[vote]]++;
  }
  return voteCount;
}

app.get('/', (request, response) => {
  response.render('pages/index');
});

app.get('/open-poll', (request, response) => {
  response.render('pages/open-poll');
});

app.get('/admin-poll', (request, response) => {
  response.render('pages/admin-poll');
});

app.get('/polls-setup/:id', (request, response) => {
  var currentPoll = app.locals.polls[request.params.id];
  response.render('pages/poll-setup', { poll: currentPoll});
});

app.get('/polls/:id', (request, response) => {
  var currentPoll = app.locals.polls[request.params.id];
  response.render('pages/poll', { poll: currentPoll});
});

app.get('/admin-voting/:id', (request, response) => {
  var currentPoll = app.locals.adminPolls[request.params.id];
  response.render('pages/admin-voting', { poll: currentPoll});
});

app.get('/admin-polls/:id', (request, response) => {
  var currentPoll = app.locals.adminPolls[request.params.id];
  response.render('pages/admin-results', { poll: currentPoll});
});

app.post('/polls', (request, response) => {
  console.log(request.headers);
  var referer = request.headers.referer;
  var id = generateId();
  if (referer.search('open-poll') > -1) {
    console.log('open-poll');
    app.locals.polls[id] = request.body;
    response.redirect('/polls-setup/' + id);
  } else if (referer.search('admin-poll') > -1) {
    console.log('admin-poll');
    app.locals.adminPolls[id] = request.body;
    response.redirect('/admin-polls/' + id);
  }
});

if (!module.parent){
  server.listen(port, function () {
    console.log('Listening on port ' + port + '.');
  });
}

io.on('connection', function (socket) {
  console.log('A user has connected.');

  socket.on('message', function (channel, message) {
    if (channel === 'voterChoice') {
      votes[socket.id] = message;
      console.log(votes);
      io.sockets.emit('voteCount', countVotes(votes));
    } else if (channel === 'adminPollVoterChoice') {
      adminVotes[socket.id] = message;
      io.sockets.emit('adminVoteCount', countVotes(adminVotes));
    }
  });

  socket.on('message', function (channel, pollId) {
    if (channel === 'closeThePoll') {
      closePoll(pollId);
    }
  });

  socket.on('message', function (channel, pollId) {
    if (channel === 'pollEndTime') {
      var minutes = app.locals.adminPolls[pollId].timeout;
      var timeout = minutes * 60 * 1000;
      console.log(timeout);
      setTimeout(function () {
        closePoll(pollId);
      },timeout);
    } else if (channel === 'openPollEndTime') {
      var minutes = app.locals.polls[pollId].timeout;
      var timeout = minutes * 60 * 1000;
      console.log(timeout);
      setTimeout(function () {
        closeOpenPoll(pollId);
      },timeout);    }
  });

  socket.on('disconnect', function () {
    delete votes[socket.id];
  });
});

function closePoll(pollId) {
  app.locals.adminPolls[pollId].open = 'false';
  io.sockets.emit('hideVotingTab');
  io.sockets.emit('adminVoteCount', countVotes(adminVotes));
}
function closeOpenPoll(pollId) {
  app.locals.polls[pollId].open = 'false';
  io.sockets.emit('hideOpenVotingTab');
  io.sockets.emit('voteCount', countVotes(votes));
}

module.exports = app;
