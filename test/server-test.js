const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Server', () => {

  before(done => {
    this.port = 9999;
    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });
    this.request = request.defaults({
      baseUrl: 'http://localhost:9999/',
    });
  });
  after(() => {
    this.server.close();
  });

  describe('Responses', () => {
    describe('GET /', () => {
      it('should return a 200', (done) => {
        this.request.get('/', (error, response) => {
          assert.equal(response.statusCode, 200);
          done();
        });
      });
    });
    describe('GET /open-poll', () => {
      it('should return a 200', (done) => {
        this.request.get('/open-poll', (error, response) => {
          assert.equal(response.statusCode, 200);
          done();
        });
      });
    });
    describe('GET /admin-poll', () => {
      it('should return a 200', (done) => {
        this.request.get('/admin-poll', (error, response) => {
          assert.equal(response.statusCode, 200);
          done();
        });
      });
    });
    describe('open poll POST /polls', () => {
      it('should not return 404', (done) => {
        this.request = request.defaults({
          baseUrl: 'http://localhost:9999/',
          headers: { referer: 'open-poll'}
        });
        app.locals.polls = {};
        var data = fixtures.validPoll;
        this.request.post('/polls', { form: data }, (error, response) => {
          if (error) { return done(error); }
          assert.notEqual(response.statusCode, 404);
          done();
        });
      });
    });
    describe('admin poll POST /polls', () => {
      it('should not return 404', (done) => {
        this.request = request.defaults({
          baseUrl: 'http://localhost:9999/',
          headers: { referer: 'admin-poll'}
        });
        app.locals.adminPolls = {};
        var data = fixtures.validPoll;
        this.request.post('/polls', { form: data }, (error, response) => {
          if (error) { return done(error); }
          assert.notEqual(response.statusCode, 404);
          done();
        });
      });
    });
    describe('open poll GET /polls', () => {
      it('should not return 404', (done) => {
        app.locals.polls.testPoll = fixtures.validPoll;
        var poll = app.locals.polls.testPoll;
        this.request.get('/polls/testPoll', (error, response) => {
          if (error) { done(error); }
          assert(response.body.includes(poll.pollName),
          `"${response.body}" does not include "${poll.pollName}".`);
          done();
        });
      });
    });
    describe('admin poll GET /admin-polls', () => {
      it('should not return 404', (done) => {
        app.locals.adminPolls.testPoll = fixtures.validPoll;
        var poll = app.locals.adminPolls.testPoll;
        this.request.get('/admin-polls/testPoll', (error, response) => {
          if (error) { done(error); }
          assert(response.body.includes(poll.pollName),
          `"${response.body}" does not include "${poll.pollName}".`);
          done();
        });
      });
    });
    describe('admin poll GET /admin-voting', () => {
      it('should not return 404', (done) => {
        app.locals.adminPolls.testPoll = fixtures.validPoll;
        var poll = app.locals.adminPolls.testPoll;
        this.request.get('/admin-voting/testPoll', (error, response) => {
          if (error) { done(error); }
          assert(response.body.includes(poll.pollName),
          `"${response.body}" does not include "${poll.pollName}".`);
          done();
        });
      });
    });


  });
});
