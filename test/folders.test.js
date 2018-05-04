'use strict';


// REQUIRES ================================================================
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const { Folder } = require('../models/folder');
const seedFolders = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);


// Mocha hooks ================================================================
before(() => {
  return mongoose.connect(TEST_MONGODB_URI);
});

beforeEach(() => {
  return Folder.insertMany(seedFolders)
    .then(() => Folder.createIndexes());
});

afterEach(() => {
  return mongoose.connection.db.dropDatabase();
});

after(() => {
  return mongoose.disconnect();
});

// TESTS ====================================================================
describe('GET /api/folders', () => { 
  // -----------------------------------------------------------------
  it('GET all folders', () => {
    return Promise.all([
      Folder.find(),
      chai.request(app).get('/api/folders')
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

describe('GET /api/folders/:id', () => {
  // -----------------------------------------------------------------
  it('GET folder by Id', () => {
    let data;

    return Folder.findOne()
      .then(_data => {
        data = _data;
  
        return chai.request(app)
          .get(`/api/folders/${data.id}`);
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
  
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
  
        // 3. then compare the database results to API response
        expect(res.body.id).to.equal(data.id);
        expect(res.body.folderId).to.equal(data.folderId);
      });
  });
  // -----------------------------------------------------------------
  it('GET a 404 for an incorrect id search', () => {
    const invalidId = 'thisIDwillNotWork';

    return chai.request(app)
      .get(`/api/folders/${invalidId}`)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('POST /api/folders', () => {
  // -----------------------------------------------------------------
  it('POST create and return a new folder when provided valid data', () => {
    const newFolder = {
      'name': 'Bologna Sandwich' 
    };

    let res;

    return chai.request(app)
      .post('/api/folders')
      .send(newFolder)
      .then((_res) => {
        res = _res;

        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');

        return Folder.findById(res.body.id);
      })
      .then(data => {
        expect(res.body.name).to.equal(data.name);
      });
  });

  // -----------------------------------------------------------------
  it('POST error if no name field', () => {
    const newFolder = {};

    return chai.request(app)
      .post('/api/folders')
      .send(newFolder)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('Missing `name` in request body');
      });
  });
});

describe('PUT /api/folders', () => {
  // -----------------------------------------------------------------
  it('PUT update a folder when given valid data', () => {
    const updateFolder = {
      'name': 'Turkey sandwich'
    };

    let data;

    return Folder.findOne()
      .then(_data => {
        data = _data;

        return chai.request(app)
          .put(`/api/folders/${data.id}`)
          .send(updateFolder);
      })
      .then(res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
      });
  });

  // -----------------------------------------------------------------
  it('PUT folder name already exists', () => {
    const preExistingFolderName = {
      'name': 'Archive'
    };

    let data;

    return Folder.findOne()
      .then(_data => {
        data = _data;

        return chai.request(app)
          .put(`/api/folders/${data.id}`)
          .send(preExistingFolderName);
      })
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body.message).to.equal('The folder name already exists');
      });
  });
});

describe('DELETE /api/folders/:id', () => {
  // -----------------------------------------------------------------
  it('DELETE by id', () => {
    let data;

    return Folder.findOne()
      .then(_data => {
        data = _data;
        return chai.request(app)
          .delete(`/api/folders/${data.id}`);
      })
      .then(res => {
        expect(res).to.have.status(204);
      });
  });
});









