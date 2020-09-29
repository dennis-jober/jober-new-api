'use strict';

const { accountQuit } = require('../sequelize_model');
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/sequelize')(accountQuit) };

module.exports = handler;
