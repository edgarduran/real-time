var socket = io();

var voteOptions = $('#voting-options button');
var voteTally = $('.vote-totals');
var pollOptions = $('#poll-options-select');
var submitPoll = $('.new-poll');
var adminPollOptions = $('#admin-poll-options button');
var adminVoteTally = $('.admin-vote-totals');
var closePoll = $('.close-poll');
var pollId = window.location.pathname.split('/')[2];
var startTimer = $('.start-timer');
var openPollTimer = $('.start-open-timer');
var showLink = $('.results-link');
var showOpenLink = $('.open-results-link');
var hosttname = window.location.hostname;
var port = window.location.port;

closePoll.on('click', function () {
  socket.send('closeThePoll', pollId);
});

pollOptions.on('change', function () {
  var value = this.value;
  var optionForm = $('#' + value + '-options');
  optionForm.removeClass('hidden');
});

startTimer.on('click', function () {
  var time = $('#minutes').val();
  socket.send('pollEndTime', pollId, time);
  startTimer.addClass('hidden');
});

openPollTimer.on('click', function () {
  var time = $('#minutes').val();
  socket.send('openPollEndTime', pollId, time);
  openPollTimer.addClass('hidden');
  $('.timer-starter').addClass('hidden');
});

showLink.on('click', function () {
  $('.voting-link').append("<h4>"
                          +hosttname
                          +port
                          +"/admin-voting/"
                          +pollId
                          +"</h4>");
});

showOpenLink.on('click', function () {
  $('.open-voting-link').append("<h4>"
                          +hosttname
                          +port
                          +"/polls/"
                          +pollId
                          +"</h4>");
});

for (var i = 0; i < adminPollOptions.length; i++) {
  adminPollOptions[i].addEventListener('click', function () {
    socket.send('adminPollVoterChoice', this.id);
    adminPollOptions.removeClass('selected');
    $(this).addClass('selected');
  });
}

for (var i = 0; i < voteOptions.length; i++) {
  voteOptions[i].addEventListener('click', function () {
    socket.send('voterChoice', this.id);
    voteOptions.removeClass('selected');
    $(this).addClass('selected');
  });
}

socket.on('hideVotingTab', function () {
  adminPollOptions.addClass('hidden');
  $('#admin-poll-options').append("<h2>Poll has been closed</h2>");
});

socket.on('hideOpenVotingTab', function () {
  voteOptions.addClass('hidden');
  $('#voting-options').append("<h2>Poll has been closed</h2>");
});

socket.on('voteCount', function (runningTotalVoteCount) {
  voteTally.empty();
  voteTally.append("<ul>"
                    +"<li>" + runningTotalVoteCount.a + "</li>"
                    +"<li>" + runningTotalVoteCount.b + "</li>"
                    +"<li>" + runningTotalVoteCount.c + "</li>"
                    +"<li>" + runningTotalVoteCount.d + "</li>"
                    +"<li>" + runningTotalVoteCount.e + "</li>"
                    +"<li>" + runningTotalVoteCount.f + "</li>"
                  +"</ul>"
                );
});

socket.on('adminVoteCount', function (adminTotalVoteCount) {
  adminVoteTally.empty();
  adminVoteTally.append("<ul>"
                    +"<li>" + adminTotalVoteCount.a + "</li>"
                    +"<li>" + adminTotalVoteCount.b + "</li>"
                    +"<li>" + adminTotalVoteCount.c + "</li>"
                    +"<li>" + adminTotalVoteCount.d + "</li>"
                    +"<li>" + adminTotalVoteCount.e + "</li>"
                    +"<li>" + adminTotalVoteCount.f + "</li>"
                  +"</ul>"
                );
});
