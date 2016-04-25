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
      headers: { referer: 'open-poll'}
    });
  });
  after(() => {
    this.server.close();
  });

  describe('POST /polls', () => {
    beforeEach(() => {
      app.locals.polls = {};
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
});
