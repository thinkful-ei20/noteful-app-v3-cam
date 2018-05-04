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

module.exports = router;