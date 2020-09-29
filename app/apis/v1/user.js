'use strict';

const AccountService = require('../../../services/account');
const UserService = require('../../../services/user');

const { AccountType } = require('../../../libs/constants');

exports.getDetail = async (req, res) => {
  const { owner } = req;

  const user = await UserService.getDetailInfo(owner);

  res.send({
    code: 0,
    result: { user },
  });
};

exports.change = async (req, res) => {
  const { owner, body } = req;
  const {
    password,
  } = body;

  await UserService.getObject(owner);

  if (password) {
    let accountList = await AccountService.getAllObjectsByOwner(owner);
    accountList = accountList
      .filter(a => a.type === AccountType.USERNAME || a.type === AccountType.EMAIL);

    Promise.all(accountList
      .filter(a => a.type === AccountType.USERNAME || a.type === AccountType.EMAIL)
      .map(a => AccountService.changeObject(a, { password })));
  }

  // await UserService.changeObject(user, {});

  res.send({
    code: 0,
    result: {},
  });
};
