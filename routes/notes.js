'use strict';

const express = require('express'); // express
const router = express.Router(); // router
const mongoose = require('mongoose'); // mongoose
const { Note } = require('../models/note'); // schema/model

/* ========== GET/READ ALL NOTES ========== */
router.get('/', (req, res, next) => {
  console.log('Get All Notes');
  const { searchTerm } = req.query;
  const filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re };
  }

  Note.find(filter)
    .sort('created')
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
    return next();
  }

  Note.findById(id)
    .then(results => {
      res.status(200);
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN NOTE ========== */
router.post('/', (req, res, next) => {
  console.log('Create a Note');
  const { title, content } = req.body;

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  Note.create({
    title: title,
    content: content
  })
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
  // console.log(id);

  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next();
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