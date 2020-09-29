'use strict';

const { sequelize } = require('../sequelize_model');

exports.transaction = callback => sequelize.transaction(transaction => callback(transaction));
