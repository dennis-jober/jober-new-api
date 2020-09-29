'use strict';

const Mongoose = require('mongoose');
const { Schema } = Mongoose;

const schema = new Schema({
  template: { type: String, required: true },
  test: { type: String, required: true },
}, {
  collection: 'template',
  versionKey: false,
});

module.exports = mongoose => mongoose.model('template', schema);
