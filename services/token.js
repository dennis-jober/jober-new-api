'use strict';

const md5 = require('md5-hex');

const config = require('../config');
const errors = require('../libs/errors');
const jwt = require('../libs/jwt');
const { UniqueId } = require('../libs/util');

const TokenRedis = require('../db/redis/token');

exports.checkRefreshTokenValid = async (owner, token) => {
  const tokenValue = await TokenRedis.getRefreshToken(token);

  if (tokenValue !== owner) throw new errors.InvalidRefreshTokenError();
};


const createAccessToken = async (params) => {
  const { owner } = params;
  await TokenRedis.setTokenInfo(owner, params);

  params.exp = Math.floor(Date.now() / 1000) + config.accessTokenExpiryTime;

  return jwt.generate(params);
};
exports.createAccessToken = createAccessToken;

exports.createAccessTokenFromRedis = async (owner, account) => {
  let params = await TokenRedis.getTokenInfo(owner);
  if (!params) return;

  if (account) {
    params = Object.assign(params, account);
  }

  return createAccessToken(params);
};

exports.exchangeAccessToken = async (params) => {
  const { owner } = params;
  let redisParams = await TokenRedis.getTokenInfo(owner);

  redisParams = Object.assign(redisParams, params);
  await TokenRedis.setTokenInfo(params);

  return jwt.generate(redisParams);
}

exports.createRefreshToken = async (owner) => {
  const token = md5(UniqueId());

  await TokenRedis.setRefreshToken(owner, token);

  return token;
};

exports.setTokenCookie = (res, token, refreshToken) => {
  const options = { path: '/' };

  res.cookie('access_token', token, options);
  if (refreshToken) res.cookie('refresh_token', refreshToken, options);
};
