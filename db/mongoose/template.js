'use strict';

const { template } = require('../mongoose_model');
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/mongoose')(template) };

module.exports = handler;
