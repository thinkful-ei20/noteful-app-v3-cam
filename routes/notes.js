'use strict';

const express = require('express'); // express
const router = express.Router(); // router
const mongoose = require('mongoose'); // mongoose
const { Note } = require('../models/note'); // schema/model

/* ========== GET/READ ALL NOTES ========== */
router.get('/', (req, res, next) => {
  console.log('Get All Notes');
  const { searchTerm, folderId } = req.query;
  const filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': { $regex: re } }, { 'content': { $regex: re } }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  Note.find(filter)
    .sort({ 'updatedAt': 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE NOTE ========== */
router.get('/:id', (req, res, next) => {
  console.log('Get a Note by ID');
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 404;
    return next(err);
  }

  Note.findById(id)
    .then(results => {
      if (results) {
        res.status(200);
        res.json(results);  
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN NOTE ========== */
router.post('/', (req, res, next) => {
  console.log('Create a Note');
  const { title, content, folderId } = req.body;

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { title, content };

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    newItem.folderId = folderId;
  }

  Note.create(newItem)
    .then(results => {
      res.location(`http://${req.headers.host}/notes/${results.id}`).status(201).json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE NOTE ========== */
router.put('/:id', (req, res, next) => {
  console.log('Update a Note');
  const { id } = req.params;
  const { title, content, folderId } = req.body;
  // console.log(id);

  if (!title) {
    const err = new Error('Missing `title` in request body')
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  

  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (mongoose.Types.ObjectId.isValid(folderId)) {
    updateObj.folderId = folderId;
  }

  // find by id and update, and return updated version, not the original
  Note.findByIdAndUpdate(id, {$set: { ...updateObj, updatedAt: Date.now() } }, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE NOTE ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Note');
  const { id } = req.params;

  Note.findByIdAndRemove(id)
  .then(results => {
    res.status(204).end();
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;