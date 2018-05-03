'use strict';

const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Mongo/Mongoose has properties on documents that we don't necessarily want to send out with our API (or want to rename). We're adding a method to rename `_id` to `id` and remove the `__v` property which is not a property/feature we care about
folderSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;    
  }
});

const Folder = mongoose.model('Folder', folderSchema);

module.export = { Folder };