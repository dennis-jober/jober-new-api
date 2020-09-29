'use strict';

const config = require('../../config');

const RedisClient = require('./index');

const REFRESH_TOKEN_KEY = token => `token:refresh:${token}`;
const TOKEN_INFO_KEY = owner => `token:info:${owner}`;

exports.getRefreshToken = token => RedisClient.get(REFRESH_TOKEN_KEY(token));

exports.setRefreshToken = (owner, token) => RedisClient.setAndExpire(
  REFRESH_TOKEN_KEY(token),
  owner,
  config.refreshTokenExpiryTime,
);

exports.removeRefreshToken = token => RedisClient.expire(REFRESH_TOKEN_KEY(token), 0);

exports.getTokenInfo = owner => RedisClient.get(TOKEN_INFO_KEY(owner));

exports.setTokenInfo = (owner, params) => RedisClient.setAndExpire(
  TOKEN_INFO_KEY(owner),
  params,
  config.refreshTokenExpiryTime,
);

exports.removeTokenInfo = owner => RedisClient.expire(TOKEN_INFO_KEY(owner), 0);
