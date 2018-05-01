'use strict';

// This file exists for when we run tests. This file is executed before every test to ensure there is no funny-business with the data
// Essentially, a clean set of data per test

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const { Note } = require('../models/note');

const seedNotes = require('../db/seed/notes');

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Note.insertMany(seedNotes))
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });