'use strict';

const { userQuit } = require('../sequelize_model');
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/sequelize')(userQuit) };

module.exports = handler;
