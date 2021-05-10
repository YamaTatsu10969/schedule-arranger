'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');

describe('/login', () => {
  // before start test
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ username: 'testuser' });
  });

  // after finished test
  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('include link for login', () => {
    return request(app)
      .get('/login')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(/<a href="\/auth\/github"/)
      .expect(200);
  });

  test('show user name during logging', () => {
    return request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200);
  });

  test('redirect / when user access logout page', () => {
    return request(app).get('/logout').expect('Location', '/').expect(302);
  });
});
