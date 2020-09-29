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

exports.getAllObjectsByOwner = async (owner, left = 0) => {
  let itemList = await EmployeeDDB.queryAll(
    '#o = :o',
    { '#o': 'owner' },
    { ':o': owner },
  );
  if (left) {
    itemList = itemList.filter(i => !i.leftAt);
  }

  return itemList;
};
