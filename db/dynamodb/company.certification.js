'use strict';

const { COMPANY_CERTIFICATION } = require('../../libs/constants').DDBTableName;
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/dynamo')(COMPANY_CERTIFICATION) };

module.exports = handler;
