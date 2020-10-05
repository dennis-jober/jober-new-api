'use strict';

const md5 = require('md5-hex');

const config = require('../config');
const errors = require('../libs/errors');
const { isEmpty } = require('../libs/util');

const GoogleRequest = require('./requests/google');
const AppleRequest = require('./requests/apple');
const FacebookRequest = require('./requests/facebook');
const KakaoRequest = require('./requests/kakao');
const NaverRequest = require('./requests/naver');
const LineRequest = require('./requests/line');

const AccountSDB = require('../db/sequelize/account');
const AccountQuitSDB = require('../db/sequelize/account.quit');

const { AccountType } = require('../libs/constants');

exports.verifyGoogleToken = async (id, idToken, accessToken) => {
  try {
    const ids = await Promise.all([
      GoogleRequest.verifyIdToken(idToken),
      GoogleRequest.verifyAccessToken(accessToken),
    ]);

    if ((ids[0] !== ids[1]) || (ids[0] !== id)) {
      throw new Error('id not matched');
    }
  } catch (err) {
    return Promise.reject([new errors.VerificationSocialAccountError(), err]);
  }
};

exports.verifyAppleToken = async (id, accessToken) => {
  try {
    const userInfo = await AppleRequest.retrieveUser(accessToken);

    if (userInfo.aud !== config.appleAppKey || userInfo.sub !== id) {
      throw new Error('aud or sub not matched');
    }
  } catch (err) {
    return Promise.reject([new errors.VerificationSocialAccountError(), err]);
  }
};

exports.verifyFacebookToken = async (id, accessToken) => {
  try {
    const idFrom = await FacebookRequest.verifyToken(accessToken);

    if (id !== idFrom) throw new Error('id not matched');
  } catch (err) {
    return Promise.reject([new errors.VerificationSocialAccountError(), err]);
  }
};

exports.verifyKakaoToken = async (id, accessToken) => {
  try {
    const idFrom = await KakaoRequest.verifyToken(accessToken);

    if (id !== idFrom) throw new Error('id not matched');
  } catch (err) {
    return Promise.reject([new errors.VerificationSocialAccountError(), err]);
  }
};

exports.verifyNaverToken = async (id, accessToken) => {
  try {
    const idFrom = await NaverRequest.verifyToken(accessToken);

    if (id !== idFrom) throw new Error('id not matched');
  } catch (err) {
    return Promise.reject([new errors.VerificationSocialAccountError(), err]);
  }
};

exports.verifyLineToken = async (id, accessToken) => {
  try {
    const idFrom = await LineRequest.verifyToken(accessToken);

    if (id !== idFrom) throw new Error('id not matched');
  } catch (err) {
    return Promise.reject([new errors.VerificationSocialAccountError(), err]);
  }
};

exports.checkDuplication = async (type, id) => {
  const item = await AccountSDB.get({ type, id }, { attributes: ['id', 'type'] });

  if (item) throw new errors.AlreadyExistAccountError();
};

exports.checkDuplicationByOwner = async (type, owner) => {
  const itemList = await AccountSDB.query({ owner, type }, { attributes: ['id', 'type'] });

  if (itemList.length) throw new errors.AlreadyExistAccountError();
};

exports.getObject = async (type, id, checkAuth = true) => {
  const item = await AccountSDB.get({ type, id });

  if (!item) throw new errors.NoAccountError();
  if (checkAuth && !item.auth) throw new errors.NotAuthorizedError();

  return item;
};

exports.getAllObjectsByOwner = async (owner) => {
  const itemList = await AccountSDB.query({ owner });

  return itemList;
};

exports.createObject = async (params, transaction) => {
  const {
    type, id, password, owner, identity,
  } = params;

  const account = {
    type, id, owner, identity,
  };
  // 이메일 인증없이 가입가능하도록 수정됨.
  // if (type === AccountType.EMAIL) account.auth = false;
  if (password && (type === AccountType.USERNAME || type === AccountType.EMAIL)) {
    account.password = md5(password);
  }

  await AccountSDB.put(transaction, account);

  return account;
};

exports.checkPassword = async (account, password) => {
  if (md5(password) !== account.password) throw new errors.InvalidPasswordError();
};

exports.changeObject = async (account, params) => {
  const { password, auth } = params;

  if (password && account.type !== AccountType.USERNAME && account.type !== AccountType.EMAIL) {
    throw new errors.InvalidInputError('no password type');
  }

  const value = {};
  if (auth && account.auth !== auth) {
    account.auth = auth;
    value.auth = auth;
  }
  if (password) {
    const newPassword = md5(password);
    if (account.password !== newPassword) {
      account.password = newPassword;
      value.password = newPassword;
    }
  }

  if (!isEmpty(value)) {
    const where = { type: account.type, id: account.id };
    await AccountSDB.update(where, value);
  }

  return account;
};

exports.removeAllObjectsByOwner = async (owner, accountQuits, transaction) => {
  accountQuits = accountQuits.map(a => ({
    type: a.type,
    accountId: a.id,
    item: JSON.stringify(a),
  }));

  await Promise.all([
    AccountSDB.delete({ owner }, { transaction }),
    AccountQuitSDB.put(transaction, accountQuits),
  ]);
};
