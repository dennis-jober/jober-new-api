'use strict';

const { COMPANY_ROLE } = require('../../libs/constants').DDBTableName;
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/dynamo')(COMPANY_ROLE) };

module.exports = handler;
