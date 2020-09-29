'use strict';

const { ddb } = require('../../libs/aws');
const { EMPLOYEE } = require('../../libs/constants').DDBTableName;

const params = {
  TableName: EMPLOYEE,
  KeySchema: [
    { AttributeName: 'companyId', KeyType: 'HASH' },
    { AttributeName: 'id', KeyType: 'RANGE' },
  ],
  AttributeDefinitions: [
    { AttributeName: 'companyId', AttributeType: 'S' },
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'owner', AttributeType: 'S' },
    { AttributeName: 'leftAt', AttributeType: 'S' },
    { AttributeName: 'type_leftAt', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
  LocalSecondaryIndexes: [
    {
      IndexName: 'companyId-type_leftAt-index',
      KeySchema: [
        { AttributeName: 'companyId', KeyType: 'HASH' },
        { AttributeName: 'type_leftAt', KeyType: 'RANGE' },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'owner-leftAt-index',
      KeySchema: [
        { AttributeName: 'owner', KeyType: 'HASH' },
        { AttributeName: 'leftAt', KeyType: 'RANGE' },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
      Projection: {
        ProjectionType: 'ALL',
      },
    },
  ],
};

ddb.createTable(params, (err, data) => {
  if (err && (!/^Table already/.test(err.message) && err.code !== 'ResourceInUseException')) {
    console.error(`${params.TableName} Unable to create table. Error JSON: ${JSON.stringify(err, null, 2)}`);
  } else if (!err) {
    console.log(`Created table. Table description JSON:  ${JSON.stringify(data, null, 2)}`);
  }
});
