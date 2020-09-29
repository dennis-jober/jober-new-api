'use strict';

const fs = require('fs');
const jwt = require('jsonwebtoken');

/*
key 생성방법
ssh-keygen -t rsa -b 4096 -m PEM -f jwtrs256.key
openssl rsa -in jwtrs256.key -pubout -outform PEM -out jwtrs256.key.pub
 */
const privateKey = fs.readFileSync(`${__dirname}/../.keys/jwtrs256.key`);

exports.generate = params => jwt.sign(params, privateKey, { algorithm: 'RS256' });
