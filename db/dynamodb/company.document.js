'use strict';

const { COMPANY_DOCUMENT } = require('../../libs/constants').DDBTableName;
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/dynamo')(COMPANY_DOCUMENT) };

module.exports = handler;
