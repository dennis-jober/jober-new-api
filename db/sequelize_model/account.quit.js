'use strict';

const { AccountType } = require('../../libs/constants');

module.exports = (sequelize, DataTypes) => sequelize.define(
  'account_quit',
  {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM(
        AccountType.UID, AccountType.USERNAME, AccountType.EMAIL, AccountType.GOOGLE,
        AccountType.APPLE, AccountType.FACEBOOK, AccountType.KAKAO, AccountType.NAVER,
        AccountType.LINE,
      ),
      allowNull: false,
    },
    accountId: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    item: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'account_quit',
    timestamps: true,
    indexes: [
      {
        name: 'idx_accountId_type',
        unique: true,
        fields: [
          { attribute: 'accountId', order: 'ASC' },
          { attribute: 'type', order: 'ASC' },
        ],
      },
    ],
  },
);
