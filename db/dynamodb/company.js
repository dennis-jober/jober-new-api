'use strict';

const { COMPANY } = require('../../libs/constants').DDBTableName;
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/dynamo')(COMPANY) };

handler.getForClient = id => handler.get({
  ProjectionExpression: '#n, president, addressBase, addressExt, phone, fax, email',
  ExpressionAttributeNames: { '#n': 'name' },
}, { id });

module.exports = handler;
