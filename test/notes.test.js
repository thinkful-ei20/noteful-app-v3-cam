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
  it('Get all notes', () => {
    // 1. Call the Database AND the API
    // 2. Wait for both promises to resolve using Promise.all
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

  // -----------------------------------------------------------------
  it('GET via searchTerm', () => {
    // Search term to test with
    const searchTerm = 'cats';
    // Regular Expression, made case insensitive
    const re = new RegExp(searchTerm, 'i'); 

    // 1. Call the Database AND the API
    // 2. Wait for both promises to resolve using Promise.all
    return Promise.all([
      // Find within the model, if the title matches the regex
      Note.find({ title: { $regex: re }}),
      chai.request(app).get(`/api/notes/?searchTerm=${searchTerm}`)
    ])
    // Compare the data from the database, and the response
      .then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body[0]).to.be.an('object');
        expect(res.body[0].id).to.equal(data[0].id);
      });
  });
  
  // -----------------------------------------------------------------
  it('GET return an empty array for an incorrect query', () => {
    // Create a search term that won't exist in the notes
    const searchTerm = 'DOESNOTEXIST123xyz';
    // Make a RegExp out of it
    const re = new RegExp(searchTerm, 'i');

    // Call the database and API and then test, after promise.all resolves
    return Promise.all([
      Note.find({ title: { $regex: re }}),
      chai.request(app).get(`/api/notes/?searchTerm=${searchTerm}`)
    ])
    // Compare the data from the database, and the response
      .then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.length(data.length);
      });
  });

});

describe('GET /api/notes/:id', () => {
  // -----------------------------------------------------------------
  it('GET specific notes by id', () => {
    let data;
    // 1. Call the database
    return Note.findOne()
      .then(_data => {
        // _data is in reference to data for internal use, usually private fields or methods are prefaced with an underscore. It is a convention of javascript.
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
  
  // -----------------------------------------------------------------
  it('GET a 404 for an incorrect id search', () => {
    const invalidId = 'thisIsNotAValidId';

    // Call to the server
    return chai.request(app)
      .get(`/api/notes/${invalidId}`)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('POST /api/notes', () => {
  // -----------------------------------------------------------------
  it('POST create and return a new item when provided valid data', () => {
    const newItem = {
      'title': 'The best article about cats ever!',
      'content': 'Lorem ipsum dolor sit amet, consectetur adipicisng elit, sed do eiusmod tempor...'
    };

    let res;
    // 1. Call the API
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then((_res) => {
        res = _res;
        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
        // 2. call the database
        return Note.findById(res.body.id);
      })
      .then(data => {
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
      });
  });
});

describe('PUT /api/notes/:id', () => {
  // -----------------------------------------------------------------
  it('PUT update a specific note when given valid data', () => {
    const updateItem = {
      'title': 'Something about Lizards',
      'content': 'They have scales...'
    };

    let data;

    // 1. Call the database
    return Note.findOne()
      .then(_data => {
        data = _data;
        return chai.request(app)
          .put(`/api/notes/${data.id}`)
          .send(updateItem);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(updateItem.title);
        expect(res.body.content).to.equal(updateItem.content);
      });
  });
});

describe('DELETE /api/notes/:id', () => {
  // -----------------------------------------------------------------
  it('DELETE by id', () => {
    let data;

    // Call the database
    return Note.findOne()
      .then(_data => {
        // Configure the data to match
        data = _data;
        // Return the API call
        return chai.request(app).delete(`/api/notes/${data.id}`);
      })
      // then check for no content
      .then(res => {
        expect(res).to.have.status(204);
      });
  });
});