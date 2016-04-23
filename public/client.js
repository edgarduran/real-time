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


// for (var i = 0; i < voteOptions.length; i++) {
//   voteOptions[i].addEventListener('click', function () {
//     socket.send('voterChoice', this.innerText);
//   });
// }
// socket.on('voteCount', function (runningTotalVoteCount) {
//   console.log(runningTotalVoteCount);
//   voteTally.empty();
//   voteTally.append("<ul>"
//                     +"<li>" + runningTotalVoteCount.A + "</li>"
//                     +"<li>" + runningTotalVoteCount.B + "</li>"
//                     +"<li>" + runningTotalVoteCount.C + "</li>"
//                     +"<li>" + runningTotalVoteCount.D + "</li>"
//                   +"</ul>"
//                 );
// });
