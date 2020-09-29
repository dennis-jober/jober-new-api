'use strict';

const util = require('util');

const table = {
  /* Fatal Errors */
  FatalError: 100,

  // Invalid data errors(1XX)
  InvalidInputError: 101, // 클라이언트로부터 전송받은 parameter 오류
  // InvalidAccessTokenError: 102, // Access 토큰 인증 오류(만료 포함)
  // InvalidRefreshTokenError: 103, // Refresh 토큰 인증 오류(만료 포함)

  // Cannot find data errors(2XX)
  NoUserError: 201, // 사용자 없음

  // Extern API errors(3XX)

  // Database errors(4XX)
  DbError: 401, // Database 오류
  RedisError: 402, // Redis 오류

  // Etc errors(9XX)
  InternalError: 901, // 내부 오류 에러
  NotSupportedYetError: 999, // 지원하지 않는 기능

  /* Common Errors */
  CommonError: 10000,

  // Invalid data errors for V1(100XX)
  ProhibitionExistError: 10001, // 금칙어가 포함되어 있음
  InvalidAccessTokenError: 10002, // Access 토큰 인증 오류(만료 포함)
  InvalidRefreshTokenError: 10003, // Refresh 토큰 인증 오류(만료 포함)

  // Account errors for V1(101XX)
  AlreadyExistAccountError: 10101, // 중복된 계정
  InvalidPasswordError: 10102, // 비번 오류
  ChangedAccessTokenError: 10103, // 다른기기에서 로그인했음
  AlreadyExistEmailError: 10104, // 중복된 email
  DeletedAccountError: 10105, // 탈퇴한 계정으로 가입시도함
  NoAccountError: 10106, // 계정없음
  VerificationSocialAccountError: 10107, // Social 계정 인증 오류
  NotAuthorizedError: 10108, // 인증되지 않은 계정

  // User errors for V1(102XX)
  AlreadyExistNicknameError: 10201, // 중복된 nickname

  // Status & Banned for V1(103XX)
  BannedUserError: 10301, // 어뷰저로 등록된 유저
  SuspendedUserError: 10302, // 정지된 유저

  // Retry
  RetryError: 99999, // 자동 재시도 필요함
};

exports.getCodeName = (err) => {
  const ret = {
    code: table.InternalError,
    name: 'InternalError',
  };

  const { name } = err;
  const code = table[name];

  if (name && code) {
    ret.code = code;
    ret.name = name;
  }

  return ret;
};

exports.checkCommon = code => code >= table.CommonError;

function AbstractError(msg, origin, constr) {
  Error.captureStackTrace(this, constr || this);

  this.message = msg || 'Error';
  if (origin) this.origin = origin;
}

util.inherits(AbstractError, Error);

AbstractError.prototype.name = 'Abstract Error';

Object.keys(table).forEach((errorName) => {
  const errorFn = function errorConstructor(msg, origin) {
    // eslint-disable-next-line no-underscore-dangle
    errorFn.super_.call(this, msg, origin, this.constructor);
  };
  exports[errorName] = errorFn;
  util.inherits(errorFn, AbstractError);
  errorFn.prototype.name = errorName;
});
