'use strict';

const errors = require('../libs/errors');

const CompanyDDB = require('../db/dynamodb/company');
const CompanyRolesDDB = require('../db/dynamodb/company.roles');
const CompanyDocumentDDB = require('../db/dynamodb/company.document');
const CompanyCertificationDDB = require('../db/dynamodb/company.certification');

const { UniqueId } = require('../libs/util');
const { CompanyChiefAdminRoles, TextType, Text } = require('../libs/constants');

exports.getObject = async (id) => {
  const item = await CompanyDDB.get({ id });

  return item;
};

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

exports.checkRoles = async (companyId, rolesId, roleType) => {
  // TODO: 캐싱작업 필요함.
  const item = await CompanyRolesDDB.get({ companyId, id: rolesId });

  if (item.roles.indexOf(roleType) < 0) {
    let found = false;
    for (const r of item.roles) {
      if (r.startsWith(roleType)) {
        found = true;
        break;
      }
    }

    if (!found) throw new errors.InvalidRoleError();
  }
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

exports.getInfo = async (id) => {
  const item = await CompanyDDB.getForClient(id);

  return item;
};

exports.getDetailInfo = async (id) => {
  const [base, documents, certifications] = await Promise.all([
    CompanyDDB.getForClient(id),
    CompanyDocumentDDB.queryAll(
      '#id = :id',
      { '#id': 'id' },
      { ':id': id },
    ),
    CompanyCertificationDDB.queryAll(
      '#id = :id',
      { '#id': 'id' },
      { ':id': id },
    ),
  ]);

  return { base, documents, certifications };
};

exports.changeObject = async (id, params) => {
  const {
    name, president, addressBase, addressExt, phone, fax, email,
  } = params;
  const value = {};

  if (name) value.name = name;
  if (president) value.president = president;
  if (addressBase) value.addressBase = addressBase;
  if (addressExt) value.addressExt = addressExt;
  if (phone) value.phone = phone;
  if (fax) value.fax = fax;
  if (email) value.email = email;

  await CompanyDDB.set({ id }, value);
};
