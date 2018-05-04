'use strict';

const express = require('express'); // express
const router = express.Router(); // router
const mongoose = require('mongoose'); // mongoose
const { Tag } = require('../models/tag'); // schema/model


/* ========== GET/READ ALL FOLDERS ========== */
router.get('/', (req, res, next) => {
  console.log('GET All tags');
  const { searchTerm } = req.query;
  const filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.name = { $regex: re };
  }

  Tag.find(filter)
    .sort({ 'updatedAt': 'desc' })
    .then(tag => {
      res.json(tag);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE FOLDER ========== */
router.get('/:id', (req, res, next) => {
  console.log('GET Tag by Id');
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next();
  }

  Tag.findById(id)
    .then(tag => {
      res.status(200);
      res.json(tag);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN FOLDER ========== */
router.post('/', (req, res, next) => {
  console.log('POST A TAG');
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Tag.create({
    name: name
  })
    .then(tag => {
      res.location(`http://${req.headers.host}/notes/${tag.id}`)
        .status(201)
        .json(tag);
    })
    .catch(err => {
      console.log(err);
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE NOTE ========== */
router.put('/:id', (req, res, next) => {
  console.log('Update a Tag');
  const { id } = req.params;

  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }

    // As long as the ID string matches the format for mongo, this won't fail
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next();
    }

    Tag.findById(id)
      .then(tag => {
        if (tag && tag.name === updateObj.name) {
          return res.status(400).json({ message: 'The tag name already exists' });
        }
        if(!tag) {
          return res.status(400).json({ message: 'The tag does not exist' });
        }
        tag.name = updateObj.name;
        return tag.save();
      })
      .then(tag => {
        res.json(tag);
      })
      .catch(err => {
        if (err.code === 11000) {
          err = new Error('The tag name already exists');
          err.status = 400;
        }
        next(err);
      });
  });
});

/* ========== DELETE/REMOVE A SINGLE NOTE ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Tag');
  const { id } = req.params;

  Tag.findByIdAndRemove(id)
    .then(result => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;