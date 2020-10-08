'use strict';

const TokenService = require('../../../services/token');
const EmployeeService = require('../../../services/employee');
const CompanyService = require('../../../services/company');

exports.createToken = async (owner, name, account) => {
  const { type, id } = account;

  const employeeList = await EmployeeService.getAllObjectListByOwner(owner);
  const companies = await CompanyService.getInfoForToken(employeeList);

  return TokenService.createAccessToken({
    owner, name, companies, account: { type, id },
  });
};
