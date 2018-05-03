'use strict';

// Models are where to define 'Schema'
// Models are constructors which create documents which can be saved and retrieved from a database connection

const mongoose = require('mongoose');

// Note Schema and Model
const noteSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder '} // Informs mongoose of the relationship between Notes and Folders
});

// Mongo/Mongoose has properties on documents that we don't necessarily want to send out with our API (or want to rename). We're adding a method to rename `_id` to `id` and remove the `__v` property which is not a property/feature we care about
noteSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id; // _mongo
    delete ret.__v; // __mongoose 
  }
});

// Create a model
// 'Note' parameter is used to create a collection, it will be lowercase and pluralized after the collection is created => 'notes'
const Note = mongoose.model('Note', noteSchema);

// Export the model
module.exports = { Note };