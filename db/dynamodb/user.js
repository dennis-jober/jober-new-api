'use strict';

const { USER } = require('../../libs/constants').DDBTableName;
// eslint-disable-next-line global-require
const handler = { ...require('../../libs/db_handler/dynamo')(USER) };

handler.getDetailForClient = owner => handler.get({
  ProjectionExpression: '#name',
  ExpressionAttributeNames: { '#name': 'name' },
}, { id: owner });

module.exports = handler;
