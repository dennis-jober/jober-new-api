'use strict';

const { COMPANY } = require('../../libs/constants').DDBTableName;
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/dynamo')(COMPANY) };

module.exports = handler;
