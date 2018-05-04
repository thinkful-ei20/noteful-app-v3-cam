'use strict';

const express = require('express'); // express
const router = express.Router(); // router
const mongoose = require('mongoose'); // mongoose
const { Folder } = require('../models/folder'); // schema/model


/* ========== GET/READ ALL FOLDERS ========== */
router.get('/', (req, res, next) => {
  console.log('Get All Folders');
  const { searchTerm } = req.query;
  const filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.title = { $regex: re }; 
  }
 
  Folder.find(filter)
    .sort('created')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE FOLDER ========== */
router.get('/:id', (req, res, next) => {
  console.log('GET a Folder by ID');
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)) {
    return next();
  }

  Folder.findById(id)
    .then(folder => {
      res.status(200);
      res.json(folder);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN FOLDER ========== */
router.post('/', (req, res, next) => {
  console.log('POST a Folder');
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Folder.create({
    name: name
  })
    .then(folder => {
      res.location(`http://${req.headers.host}/notes/${folder.id}`)
        .status(201)
        .json(folder);
    })
    .catch(err => {
      console.log(err);
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE NOTE ========== */
router.put('/:id', (req, res, next) => {
  console.log('Update a Folder');
  const { id } = req.params;

  const updateObj = {};
  const updateableFields = ['name'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  // As long as the ID string matches the format for mongo, this won't fail
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next();
  }

  Folder.findById(id)
    .then(folder => {
      // If the names are the same throw an error
      if (folder && folder.name === updateObj.name) {
        return res.status(400).json({message:'The folder name already exists'});
      } 
      if (!folder) {
        return res.status(400).json({message:'The folder does not exist'});
      } 
      folder.name = updateObj.name;
      return folder.save();
    })
    .then(folder => {
      res.json(folder);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE NOTE ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Folder');
  const { id } = req.params;

  Folder.findByIdAndRemove(id)
    .then(result => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;