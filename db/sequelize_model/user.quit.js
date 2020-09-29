'use strict';

module.exports = (sequelize, DataTypes) => sequelize.define(
  'user_quit',
  {
    id: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    item: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'user_quit',
    timestamps: true,
  },
);
