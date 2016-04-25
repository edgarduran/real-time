const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Admin Poll', () => {

  before(done => {
    this.port = 9999;
    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });
    this.request = request.defaults({
      baseUrl: 'http://localhost:9999/',
      headers: { referer: 'admin-poll'}
    });
  });
  after(() => {
    this.server.close();
  });

  describe('POST /polls', () => {
    beforeEach(() => {
      app.locals.adminPolls = {};
    });

    it('should receive and store data', (done) => {
      var data = fixtures.validPoll;
      this.request.post('/polls', { form: data }, (error, response) => {
        if (error) { done(error); }
        var pollCount = Object.keys(app.locals.adminPolls).length;
        assert.equal(pollCount, 1, `Expected 1 poll, found ${pollCount}`);
        done();
      });
    });

    it('should redirect the admin poll page', (done) => {
      var data = fixtures.validPoll;
      this.request.post('/polls', { form: data }, (error, response) => {
        if (error) { done(error); }
        var newPollId = Object.keys(app.locals.adminPolls)[0];
        assert.equal(response.headers.location, '/admin-polls/' + newPollId);
        done();
      });
    });

    it('has a valid link for voting', (done) => {
      app.locals.adminPolls.testPoll = fixtures.validPoll;
      var poll = app.locals.adminPolls.testPoll;
      var newPollId = Object.keys(app.locals.adminPolls)[0];
      this.request.get(`/admin-voting/${newPollId}`, (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.nameOne),
               `"${response.body}" does not include "${poll.nameOne}".`);
        assert(response.body.includes(poll.nameOne));
        done();
      });
    });

    it('should not allow voting when poll is closed', (done) => {
      app.locals.adminPolls.testPoll = fixtures.closedPoll;
      var poll = app.locals.adminPolls.testPoll;
      var newPollId = Object.keys(app.locals.adminPolls)[0];
      this.request.get(`/admin-voting/${newPollId}`, (error, response) => {
        if (error) { done(error); }
        assert.equal(false, response.body.includes(poll.nameOne));
        assert(response.body.includes('Poll has been closed'));
        done();
      });
    });
  });
});
