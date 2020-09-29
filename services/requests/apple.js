'use strict';

const jwt = require('jsonwebtoken');
const jwtClient = require('jwks-rsa');

const errors = require('../../libs/errors');

const apple = jwtClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
});

const APPLEID_URL = 'https://appleid.apple.com';

function getApplePublicKey(header) {
  return new Promise((resolve, reject) => {
    apple.getSigningKey(header.kid, (err, key) => {
      if (err || !key) return reject([new errors.InvalidInputError(), err]);
      return resolve(key.publicKey || key.rsaPublicKey);
    });
  });
}

exports.retrieveUser = token => new Promise((resolve, reject) => {
  jwt.verify(token, getApplePublicKey, null, (err, decoded) => {
    if (err || !decoded) return reject([new errors.InvalidInputError(), err]);
    if (decoded.iss !== APPLEID_URL) return reject(new errors.InvalidInputError('iss not matched'));
    return resolve(decoded);
  });
});
