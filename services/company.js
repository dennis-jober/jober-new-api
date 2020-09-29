'use strict';

const CompanyDDB = require('../db/dynamodb/company');
const CompanyRolesDDB = require('../db/dynamodb/company.roles');

const { UniqueId } = require('../libs/util');
const { CompanyAdminRoles, TextType, Text } = require('../libs/constants');

exports.createObject = async (params, lang) => {
  const { companyName: name } = params;

  const id = UniqueId();
  const company = {
    id,
    name,
  };

  const adminRoles = {
    companyId: id,
    id: UniqueId(),
    title: Text(TextType.COMPANY_ROLES_ADMIN_TITLE, lang),
    desc: Text(TextType.COMPANY_ROLES_ADMIN_DESC, lang),
    roles: CompanyAdminRoles,
  };
  const employeeRoles = {
    companyId: id,
    id: UniqueId(),
    title: Text(TextType.COMPANY_ROLES_EMPLOYEE_TITLE, lang),
    desc: Text(TextType.COMPANY_ROLES_EMPLOYEE_DESC, lang),
  };
  await Promise.all([
    CompanyDDB.put(company),
    CompanyRolesDDB.put(adminRoles, employeeRoles),
  ]);

  return { company, adminRoles, employeeRoles };
};

exports.getObjectList = idList => CompanyDDB.get({}, idList.map(id => ({ id })));
