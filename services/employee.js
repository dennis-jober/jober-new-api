'use strict';

const { UniqueId } = require('../libs/util');

const EmployeeDDB = require('../db/dynamodb/employee');

exports.createObject = async (params) => {
  const {
    owner, companyId, employeeType, rolesId,
  } = params;
  const employee = {
    companyId,
    id: UniqueId(),
    owner,
    employeeType,
    rolesId,
  };

  await EmployeeDDB.put(employee);

  return employee;
};

exports.getObjectByOwner = async (companyId, owner) => {
  const items = await EmployeeDDB.queryAll(
    '#cid = :cid and #o = :o',
    { '#cid': 'companyId', '#o': 'owner', '#d': 'deletedAt' },
    { ':cid': companyId, ':o': owner },
    {
      IndexName: 'companyId-owner-index',
      FilterExpression: 'attribute_not_exists(#d)',
    },
  );

  if (items.length) return items[0];
};

exports.getAllObjectListByOwner = (owner, left = 0) => {
  const EAN = { '#o': 'owner' };
  const params = { IndexName: 'owner-id-index' };
  if (!left) {
    params.FilterExpression = 'attribute_not_exists(#d)';
    EAN['#d'] = 'deletedAt';
  }

  return EmployeeDDB.queryAll(
    '#o = :o',
    EAN,
    { ':o': owner },
    params,
  );
};
