const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Server', () => {

  before(done => {
    this.port = 3000;
    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });
    this.request = request.defaults({
      baseUrl: 'http://localhost:3000/',
      headers: { referer: 'open-poll'}
    });
  });
  after(() => {
    this.server.close();
  });

  describe('GET /', () => {
    it('should return a 200', (done) => {
      this.request.get('/', (error, response) => {
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });

  describe('POST /polls', () => {
    beforeEach(() => {
      app.locals.polls = {};
    });

    it('should not return 404', (done) => {
      var data = fixtures.validPoll;
      this.request.post('/polls', { form: data }, (error, response) => {
        if (error) { return done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should receive and store data', (done) => {
      var data = fixtures.validPoll;
      this.request.post('/polls', { form: data }, (error, response) => {
        if (error) { done(error); }
        var pollCount = Object.keys(app.locals.polls).length;
        assert.equal(pollCount, 1, `Expected 1 poll, found ${pollCount}`);
        done();
      });
    });

    it('should redirect the user new poll', (done) => {
      var data = fixtures.validPoll;
      this.request.post('/polls', { form: data }, (error, response) => {
        if (error) { done(error); }
        var newPollId = Object.keys(app.locals.polls)[0];
        assert.equal(response.headers.location, '/polls/' + newPollId);
        done();
      });
    });
  });

  describe('POST /polls', () => {
    beforeEach(() => {
      app.locals.polls.testPoll = fixtures.validPoll;
    });

    it('should not return 404', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/testPoll', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.pollName),
               `"${response.body}" does not include "${poll.pollName}".`);
        done();
      });
    });

    it('display poll options', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/testPoll', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.nameOne),
               `"${response.body}" does not include "${poll.nameOne}".`);
        assert(response.body.includes(poll.nameOne));
        done();
      });
    });
  });
});
