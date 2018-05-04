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

describe('GET /api/tags', () => {
  // -----------------------------------------------------------------
  it('GET Tag by Id', () => {
    let data;

    return Tag.findOne()
      .then(_data => {
        data = _data;

        return chai.request(app)
          .get(`/api/tags/${data.id}`);
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;

        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

        expect(res.body.id).to.equal(data.id);
        expect(res.body.name).to.equal(data.name);
      });
  });

  // -----------------------------------------------------------------
  it('GET a 404 for an incorrect id search', () => {
    const invalidId = 'THISWONTWORKASANID';

    return chai.request(app)
      .get(`/api/tags/${invalidId}`)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('POST /api/tags', () => {
  // -----------------------------------------------------------------
  it('POST create and return a new tag when provided valid data', () => {
    const newTag = {
      'name': 'Deli meats'
    };

    let res;

    return chai.request(app)
      .post('/api/tags')
      .send(newTag)
      .then((_res) => {
        res = _res;

        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

        return Tag.findById(res.body.id);
      })
      .then(data => {
        expect(res.body.name).to.equal(data.name);
      });
  });

  // -----------------------------------------------------------------
  it('POST error if no name field', () => {
    const newTag = {};

    return chai.request(app)
      .post('/api/tags')
      .send(newTag)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Missing `name` in request body');
      });
  });
});

describe('PUT /api/tags', () => {
  // -----------------------------------------------------------------
  it('PUT update a tag when given valid data', () => {
    const updateTag = {
      'name': 'PeanutButter'
    };

    let data;

    return Tag.findOne()
      .then(_data => {
        data = _data;

        return chai.request(app)
          .put(`/api/tags/${data.id}`)
          .send(updateTag);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
      });
  });

  // -----------------------------------------------------------------
  it('PUT tag name already exists', () => {
    const preExistingTagName = {
      'name': 'foo'
    };

    let data;

    return Tag.findOne()
      .then(_data => {
        data = _data;

        return chai.request(app)
          .put(`/api/tags/${data.id}`)
          .send(preExistingTagName);
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('The tag name already exists');
      });
  });
});

describe('DELETE /api/tags', () => {
  // -----------------------------------------------------------------
  it('DELETE by id', () => {
    let data;

    return Tag.findOne()
      .then(_data => {
        data = _data;
        return chai.request(app)
          .delete(`/api/tags/${data.id}`);
      })
      .then(res => {
        expect(res).to.have.status(204);
      });
  });  
});