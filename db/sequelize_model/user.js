'use strict';

module.exports = (sequelize, DataTypes) => sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    /**
     * 어뷰저 및 사용중지
     */
    abuser: {
      type: DataTypes.BOOLEAN,
    },
    resumeAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'user',
    timestamps: true,
  },
);
