'use strict';

const { user } = require('../sequelize_model');
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/sequelize')(user) };

module.exports = handler;
