'use strict';

const jwt = require('jsonwebtoken');
const { ExtractJwt } = require('passport-jwt');

const errors = require('../../../libs/errors');

const UserService = require('../../../services/user');
const EmployeeService = require('../../../services/employee');
const CompanyService = require('../../../services/company');
const TokenService = require('../../../services/token');

exports.refresh = async (req, res) => {
  let { access_token, refresh_token } = req.cookies;
  if (!access_token) {
    access_token = ExtractJwt.fromBodyField('access_token')(req)
      || ExtractJwt.fromUrlQueryParameter('access_token')(req)
      || ExtractJwt.fromHeader('access_token')(req)
      || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  }
  if (!access_token) throw new errors.InvalidAccessTokenError();
  const { owner, type, id } = jwt.decode(access_token);
  if (!owner) throw new errors.InvalidInputError('no owner');

  if (!refresh_token) {
    refresh_token = ExtractJwt.fromBodyField('refresh_token')(req)
      || ExtractJwt.fromUrlQueryParameter('refresh_token')(req)
      || ExtractJwt.fromHeader('refresh_token')(req);
  }
  if (!refresh_token) throw new errors.InvalidRefreshTokenError();

  const result = {};

  await TokenService.checkRefreshTokenValid(owner, refresh_token);
  let accessToken = await TokenService.createAccessTokenFromRedis(owner);
  if (!accessToken) {
    const { name } = UserService.getInfo(owner);

    const employeeList = await EmployeeService.getAllObjectListByOwner(owner);
    const companies = await CompanyService.getInfoForToken(employeeList);

    accessToken = await TokenService.createAccessToken({
      owner, name, companies, type, id,
    });
  }

  TokenService.setTokenCookie(res, accessToken);
  result.access_token = accessToken;

  res.send({
    code: 0,
    result,
  });
};
