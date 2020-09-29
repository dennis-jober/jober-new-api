'use strict';

const moment = require('moment');
require('moment-timezone');
const mongoose = require('mongoose');

exports.UniqueId = () => `${new mongoose.Types.ObjectId()}`;

exports.isEmpty = (value) => {
  if (!value) {
    return true;
  }
  if (value.length && (Array.isArray(value) || typeof value === 'string')) {
    return false;
  }
  if (typeof value === 'object' && Object.keys(value).length) {
    return false;
  }
  return true;
};

exports.getDateString = (format, timezone, offset, date) => {
  const m = moment(date); // timestamp or date string or date object
  m.add(offset, 'hours').tz(timezone);

  if (!format) format = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

  return m.format(format);
};

exports.snakeCaseToCamelCase = (word) => {
  word = word.toLocaleLowerCase();
  const find = /_\w/g;
  const convert = matches => matches[1].toUpperCase();
  return word.replace(find, convert);
};

exports.dotCaseToCamelCase = (word) => {
  word = word.toLocaleLowerCase();
  const find = /\.\w/g;
  const convert = matches => matches[1].toUpperCase();
  return word.replace(find, convert);
};
