var socket = io();

var voteOptions = $('#voting-options button');
var voteTally = $('.vote-totals');
var pollOptions = $('#poll-options-select');
var submitPoll = $('.new-poll');

pollOptions.on('change', function () {
  var value = this.value;
  var optionForm = $('#' + value + '-options');
  optionForm.removeClass('hidden');
});


for (var i = 0; i < voteOptions.length; i++) {
  voteOptions[i].addEventListener('click', function () {
    socket.send('voterChoice', this.id);
  });
}
socket.on('voteCount', function (runningTotalVoteCount) {
  console.log(runningTotalVoteCount);
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
