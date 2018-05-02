'use strict';

// REQUIRES ================================================================
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const { Note } = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);


// Mocha hooks ================================================================
before(() => {
  return mongoose.connect(TEST_MONGODB_URI);
});

beforeEach(() => {
  return Note.insertMany(seedNotes)
    .then(() => Note.createIndexes());
});

afterEach(() => {
  return mongoose.connection.db.dropDatabase();
});

after(() => {
  return mongoose.disconnect();
});


// TESTS ====================================================================
describe('GET /api/notes', () => {
  // 1. Call the Database AND the API
  // 2. Wait for both promises to resolve using Promise.all
  it('Get all notes', () => {
    return Promise.all([
      Note.find(),
      chai.request(app).get('/api/notes')
    ])
    // 3. then compare database results to API response
      .then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
      });
  }); 
});

describe('GET /api/notes/:id', () => {
  it('GET specific notes by id', () => {
    let data;
    // 1. Call the database
    return Note.findOne()
      .then(_data => {
        data = _data;
        // 2. then call the API with ID
        return chai.request(app)
          .get(`/api/notes/${data.id}`);
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

        // 3. then compare the database results to API response
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
      });
  });

});
