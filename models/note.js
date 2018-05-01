'use strict';

// Models are where to define 'Schema'
// Models are constructors which create documents which can be saved and retrieved from a database connection

const mongoose = require('mongoose');

// Note Schema and Model
const noteSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  createdAt: Date,
  updatedAt: Date
});

// Create a model
// 'Note' parameter is used to create a collection, it will be lowercase and pluralized after the collection is created => 'notes'
const Note = mongoose.model('Note', noteSchema);

// Export the model
module.exports = { Note };