'use strict';

const { ddb } = require('../../libs/aws');
const { COMPANY_ROLE } = require('../../libs/constants').DDBTableName;

const params = {
  TableName: COMPANY_ROLE,
  KeySchema: [
    { AttributeName: 'companyId', KeyType: 'HASH' },
    { AttributeName: 'id', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'companyId', AttributeType: 'S' },
    { AttributeName: 'id', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
};

ddb.createTable(params, (err, data) => {
  if (err && (!/^Table already/.test(err.message) && err.code !== 'ResourceInUseException')) {
    console.error(`${params.TableName} Unable to create table. Error JSON: ${JSON.stringify(err, null, 2)}`);
  } else if (!err) {
    console.log(`Created table. Table description JSON:  ${JSON.stringify(data, null, 2)}`);
  }
});
