'use strict';

const CompanyDDB = require('../db/dynamodb/company');
const CompanyRolesDDB = require('../db/dynamodb/company.roles');

const { UniqueId } = require('../libs/util');
const { CompanyChiefAdminRoles, TextType, Text } = require('../libs/constants');

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
    title: Text(TextType.COMPANY_ROLES_CHIEF_ADMIN_TITLE, lang),
    desc: Text(TextType.COMPANY_ROLES_CHIEF_ADMIN_DESC, lang),
    roles: CompanyChiefAdminRoles,
    admin: 1,
  };
  const employeeRoles = {
    companyId: id,
    id: UniqueId(),
    title: Text(TextType.COMPANY_ROLES_EMPLOYEE_TITLE, lang),
    desc: Text(TextType.COMPANY_ROLES_EMPLOYEE_DESC, lang),
    roles: [],
  };
  await Promise.all([
    CompanyDDB.put(company),
    CompanyRolesDDB.put(adminRoles, employeeRoles),
  ]);

  return { company, adminRoles, employeeRoles };
};

exports.getInfoForToken = async (employeeList) => {
  const [rolesList, companyList] = await Promise.all([
    CompanyRolesDDB.get(employeeList.map(e => ({ companyId: e.companyId, id: e.rolesId }))),
    CompanyDDB.get(employeeList.map(e => ({ id: e.companyId }))),
  ]);

  const companies = [];
  companyList.forEach((c) => {
    for (const r of rolesList) {
      if (c.id === r.companyId) {
        companies.push({
          // eslint-disable-next-line no-unneeded-ternary
          id: c.id, name: c.name, admin: r.admin ? true : false,
        });
        break;
      }
    }
  });

  return companies;
};
