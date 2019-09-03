const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', function(done) {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏' 
      }, done);
  });
});

describe('post /api/v1/messages', () => {
  it('responds with a json message', function(done) {
    const rez = {
      name: 'pat',
      message: 'lololol',
      lat: -90,
      lon: 180
    }
    request(app)
      .post('/api/v1/messages')
      .send(rez)
      .set('Accept', 'application/json')
      .expect(200, rez, done);
      //.expect('Content-Type', /json/).then(res => {console.log(res); done();})
  });
});
