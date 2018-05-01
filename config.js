'use strict';

exports.PORT = process.env.PORT || 8080;

// Uniform Resource Identifier
// This is used instead of DATABASE_URL because it syncs up with Heroku's mLab Add-On.
// Can change to DATABASE_URL but you need to change the Config Vars in Heroku.
exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/noteful';
