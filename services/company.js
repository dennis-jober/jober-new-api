'use strict';

const errors = require('../libs/errors');

const CompanyDDB = require('../db/dynamodb/company');
const CompanyRolesDDB = require('../db/dynamodb/company.roles');
const CompanyDocumentDDB = require('../db/dynamodb/company.document');
const CompanyCertificationDDB = require('../db/dynamodb/company.certification');

const { UniqueId } = require('../libs/util');
const {
  CompanyChiefAdminRoles, CompanyDocumentType, CompanyCertificationType, TextType, Text,
} = require('../libs/constants');

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

exports.changeDocumentObject = async (id, type, params) => {
  const { id: objId } = params;
  const item = { type };

  switch (type) {
    case CompanyDocumentType.BUSINESS_LICENCE: // Type에 Unique한 item
      {
        if (!objId) {
          const check = await CompanyDocumentDDB.query(
            '#cid = :cid and #type = :type',
            { '#cid': 'companyId', '#type': 'type' },
            { ':cid': id, ':type': type },
            { IndexName: 'companyId-type-index' },
          );
          if (check.length) throw new errors.DuplicatedDataError('already exist for put');
        }

        const {
          licenceType, licenceNumber, openDate, registerNumber, condition, kind, email, licenceUrl,
        } = params;

        if (licenceType) item.licenceType = licenceType;
        if (licenceNumber) item.licenceNumber = licenceNumber;
        if (openDate) item.openDate = openDate;
        if (registerNumber) item.registerNumber = registerNumber;
        if (condition) item.condition = condition;
        if (kind) item.kind = kind;
        if (email) item.email = email;
        if (licenceUrl) item.licenceUrl = licenceUrl;
      }
      break;
    case CompanyDocumentType.BANK_ACCOUNT:
      {
        const {
          name, bank, account, bankbookUrl,
        } = params;

        if (name) item.name = name;
        if (bank) item.bank = bank;
        if (account) item.account = account;
        if (bankbookUrl) item.bankbookUrl = bankbookUrl;
      }
      break;
    default:
      throw new errors.InvalidInputError();
  }

  if (objId) {
    await CompanyDocumentDDB.set({ companyId: id, id: objId }, item);
  } else {
    item.companyId = id;
    item.id = UniqueId();
    await CompanyDocumentDDB.put(item);
  }
};

exports.changeCertificationObject = async (id, type, params) => {
  const { id: objId } = params;
  const item = { type };

  if (!objId) {
    const check = await CompanyDocumentDDB.query(
      '#cid = :cid and #type = :type',
      { '#cid': 'companyId', '#type': 'type' },
      { ':cid': id, ':type': type },
      { IndexName: 'companyId-type-index' },
    );
    if (check.length) throw new errors.DuplicatedDataError('already exist for put');
  }

  switch (type) {
    case CompanyCertificationType.VENTURE:
      {
        const {
          ventureType, institute, beginDate, endDate, certificateUrl,
        } = params;

        if (ventureType) item.ventureType = ventureType;
        if (institute) item.institute = institute;
        if (beginDate) item.beginDate = beginDate;
        if (endDate) item.endDate = endDate;
        if (certificateUrl) item.certificateUrl = certificateUrl;
      }
      break;
    case CompanyCertificationType.RESEARCH_INSTITUTE:
      {
        const {
          address, registerDate, beginDate, endDate, certificateUrl,
        } = params;

        if (address) item.address = address;
        if (registerDate) item.registerDate = registerDate;
        if (beginDate) item.beginDate = beginDate;
        if (endDate) item.endDate = endDate;
        if (certificateUrl) item.certificateUrl = certificateUrl;
      }
      break;
    case CompanyCertificationType.GUARANTEE_FUND:
      {
        const {
          institute, registerNumber, registerDate, certificateUrl,
        } = params;

        if (institute) item.institute = institute;
        if (registerNumber) item.registerNumber = registerNumber;
        if (registerDate) item.registerDate = registerDate;
        if (certificateUrl) item.certificateUrl = certificateUrl;
      }
      break;
    default:
      throw new errors.InvalidInputError();
  }

  if (objId) {
    await CompanyCertificationDDB.set({ companyId: id, id: objId }, item);
  } else {
    item.companyId = id;
    item.id = UniqueId();
    await CompanyCertificationDDB.put(item);
  }
};
