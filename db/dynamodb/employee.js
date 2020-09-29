'use strict';

const { EMPLOYEE } = require('../../libs/constants').DDBTableName;
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/dynamo')(EMPLOYEE) };

module.exports = handler;
