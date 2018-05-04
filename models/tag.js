'use strict';

const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tagSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = { Tag };