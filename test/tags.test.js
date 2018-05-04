'use strict';


// REQUIRES ================================================================
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const { Tag } = require('../models/tag');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);


// Mocha hooks ================================================================
before(() => {
  return mongoose.connect(TEST_MONGODB_URI);
});

beforeEach(() => {
  return Tag.insertMany(seedTags)
    .then(() => Tag.createIndexes());
});

afterEach(() => {
  return mongoose.connection.db.dropDatabase();
});

after(() => {
  return mongoose.disconnect();
});

// TESTS ====================================================================
describe('GET /api/tags', () => {
  // -----------------------------------------------------------------
  it('GET all tags', () => {
    return Promise.all([
      Tag.find(),
      chai.request(app).get('/api/tags')
    ])
      .then( ([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
      });
  });
});