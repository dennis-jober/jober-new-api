'use strict';

const errors = require('../../../libs/errors');
const { transaction } = require('../../../db/sequelize');

const TokenService = require('../../../services/token');
const AccountService = require('../../../services/account');
const UserService = require('../../../services/user');
const CompanyService = require('../../../services/company');
const EmployeeService = require('../../../services/employee');

const { UniqueId } = require('../../../libs/util');
const {
  AccountType, EmployeeType, TextType, Text,
} = require('../../../libs/constants');

async function verify(type, id, socialIdToken, socialAccessToken) {
  switch (type) {
    case AccountType.UID:
    case AccountType.USERNAME:
      // 인증없음
      break;
    case AccountType.EMAIL:
      // TODO: Email 인증 메일 발송
      break;
    case AccountType.GOOGLE:
      await AccountService.verifyGoogleToken(id, socialIdToken, socialAccessToken);
      break;
    case AccountType.APPLE:
      await AccountService.verifyAppleToken(id, socialAccessToken);
      break;
    case AccountType.FACEBOOK:
      await AccountService.verifyFacebookToken(id, socialAccessToken);
      break;
    case AccountType.KAKAO:
      await AccountService.verifyKakaoToken(id, socialAccessToken);
      break;
    case AccountType.NAVER:
      // TODO: Naver 인증 R&D 후 구현 예정
      // await AccountService.verifyNaverToken(id, socialAccessToken);
      break;
    case AccountType.LINE:
      await AccountService.verifyLineToken(id, socialAccessToken);
      break;
    default:
      throw new errors.NotSupportedYetError('type not matched');
  }
}

exports.create = async (req, res) => {
  const { lang, body } = req;
  const {
    type, id, password, socialIdToken, socialAccessToken,
    companyName, identity,
  } = body;
  let { name } = body;
  const result = {};

  if ((type === AccountType.USERNAME /* || type === AccountType.EMAIL */) && !password) {
    throw new errors.InvalidInputError('no password');
  }

  await AccountService.checkDuplication(type, id);

  await verify(type, id, socialIdToken, socialAccessToken);

  const owner = UniqueId();
  req.owner = owner;
  if (!name) {
    if (!companyName) throw new errors.InvalidInputError('no name');
    name = Text(TextType.USER_NAME_FOR_COMPANY_CREATION);
  }

  await transaction(async (t) => {
    await Promise.all([
      AccountService.createObject({
        type, id, password, owner, identity,
      }, t),
      UserService.createObject({ owner }, t),
    ]);
  });

  await UserService.createInfoObject({ owner, name });

  const companies = [];
  if (companyName) {
    const { company, adminRoles } = await CompanyService.createObject({ companyName }, lang);
    const { id: companyId } = company;
    const { id: rolesId } = adminRoles;

    await EmployeeService.createObject({
      owner, companyId, employeeType: EmployeeType.FULLTIME, rolesId,
    });

    companies.push({
      id: companyId,
      name: companyName,
      admin: true,
    });
  }

  /* if (type !== AccountType.EMAIL) */ {
    const accessToken = await TokenService.createAccessToken({
      type, id, owner, name, companies,
    });
    const refreshToken = await TokenService.createRefreshToken(owner);

    TokenService.setTokenCookie(res, accessToken, refreshToken);
    result.access_token = accessToken;
    result.refresh_token = refreshToken;
  }

  res.send({
    code: 0,
    result,
  });
};

exports.login = async (req, res) => {
  const { type, id, password } = req.body;
  const result = {};

  const account = await AccountService.getObject(type, id);
  const { owner } = account;
  req.owner = owner;

  if (type === AccountType.USERNAME || type === AccountType.EMAIL) {
    await AccountService.checkPassword(account, password);
  }

  await UserService.getObject(owner);

  let accessToken = await TokenService.createAccessTokenFromRedis(owner, { id, type });
  if (!accessToken) {
    const { name } = UserService.getInfo(owner);

    const employeeList = await EmployeeService.getAllObjectListByOwner(owner);
    const companies = await CompanyService.getInfoForToken(employeeList);

    accessToken = await TokenService.createAccessToken({
      type, id, owner, name, companies,
    });
  }
  const refreshToken = await TokenService.createRefreshToken(owner);

  TokenService.setTokenCookie(res, accessToken, refreshToken);
  result.access_token = accessToken;
  result.refresh_token = refreshToken;

  res.send({
    code: 0,
    result,
  });
};

exports.delete = async (req, res) => {
  const { owner } = req;

  // user 정보 백업
  const [accounts, user, userInfo] = await Promise.all([
    AccountService.getAllObjectListByOwner(owner),
    UserService.getObject(owner),
    UserService.getInfo(owner),
  ]);
  user.accounts = JSON.stringify(accounts);
  user.info = JSON.stringify(userInfo);

  // 관련 정보 삭제 및 account.quit 및 user.quit 등록
  await transaction(async (t) => {
    await Promise.all([
      AccountService.removeAllObjectsByOwner(owner, accounts, t),
      UserService.removeObject(user, t),
    ]);
  });

  res.clearCookie('access_token');
  res.send({
    code: 0,
    result: {},
  });
};

exports.link = async (req, res) => {
  const { owner, body } = req;
  const {
    type, id, password, socialIdToken, socialAccessToken,
  } = body;

  if ((type === AccountType.USERNAME || type === AccountType.EMAIL) && !password) {
    throw new errors.InvalidInputError('no password');
  }

  await AccountService.checkDuplication(type, id);
  // await AccountService.checkDuplicationByOwner(type, owner); 하나의 타입으로 여러 계정으로 링크 가능하도록
  // TODO: 다른 User 존재시 처리 및 탈퇴한 계정 처리

  await verify(type, id, socialIdToken, socialAccessToken);
  await AccountService.createObject({
    type, id, password, owner,
  });

  res.send({
    code: 0,
    result: {},
  });
};
