'use strict';

const request = require('request');

const errors = require('../../libs/errors');

const VERIFICATION_URL = 'https://oauth2.googleapis.com/tokeninfo';

exports.verifyIdToken = id_token => new Promise((resolve, reject) => {
  request({
    method: 'GET',
    qs: { id_token },
    url: VERIFICATION_URL,
  }, (e, r, b) => {
    if (e || !b) {
      return reject([new errors.InvalidInputError(), e]);
    }
    try {
      b = JSON.parse(b);
    } catch (err) {
      return reject([new errors.ParsingError(), err]);
    }
    if (b.email_verified && b.sub) {
      return resolve(b.sub);
    } else if (b.error) {
      return reject([new errors.InvalidInputError(), b.error]);
    }

    return reject(new errors.InvalidInputError());
  });
});

exports.verifyAccessToken = access_token => new Promise((resolve, reject) => {
  request({
    method: 'GET',
    qs: { access_token },
    url: VERIFICATION_URL,
  }, (e, r, b) => {
    if (e || !b) {
      return reject([new errors.InvalidInputError(), e]);
    }
    try {
      b = JSON.parse(b);
    } catch (err) {
      return reject([new errors.ParsingError(), err]);
    }
    if (b.email_verified && b.sub) {
      return resolve(b.sub);
    } else if (b.error) {
      return reject([new errors.InvalidInputError(), b.error]);
    }

    return reject(new errors.InvalidInputError());
  });
});
