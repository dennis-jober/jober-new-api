'use strict';

const errors = require('../../../libs/errors');

const Common = require('./index');
const TokenService = require('../../../services/token');
const EmployeeService = require('../../../services/employee');
const CompanyService = require('../../../services/company');

const { CompanyRoleType, EmployeeType } = require('../../../libs/constants');

exports.get = async (req, res) => {
  const { params } = req;
  const { id } = params;

  const company = await CompanyService.getInfo(id);

  res.send({
    code: 0,
    result: { company },
  });
};

exports.getDetail = async (req, res) => {
  const { owner, params } = req;
  const { id } = params;

  const employee = await EmployeeService.getObjectByOwner(id, owner);
  await CompanyService.checkRoles(id, employee.rolesId, CompanyRoleType.COMPANY_DETAIL_READ);

  const company = await CompanyService.getDetailInfo(id);

  res.send({
    code: 0,
    result: { company },
  });
};

exports.create = async (req, res) => {
  const {
    owner, name: userName, lang, account, body,
  } = req;
  const { name } = body;

  const { company, adminRoles } = await CompanyService.createObject({ companyName: name }, lang);
  const { id: companyId } = company;
  const { id: rolesId } = adminRoles;

  await EmployeeService.createObject({
    owner, companyId, employeeType: EmployeeType.FULLTIME, rolesId,
  });

  const accessToken = await Common.createToken(owner, userName, account);
  TokenService.setTokenCookie(res, accessToken);

  res.send({
    code: 0,
    result: { company, access_token: accessToken },
  });
};

exports.change = async (req, res) => {
  const { owner, body, params } = req;
  const {
    name, president, addressBase, addressExt, phone, fax, email,
  } = body;
  const { id } = params;

  const employee = await EmployeeService.getObjectByOwner(id, owner);
  await CompanyService.checkRoles(id, employee.rolesId, CompanyRoleType.COMPANY_DETAIL_READ_WRITE);

  await CompanyService.changeObject(id, {
    name, president, addressBase, addressExt, phone, fax, email,
  });

  res.send({
    code: 0,
    result: {},
  });
};

exports.changeDocument = async (req, res) => {
  const { owner, body, params } = req;
  const { type } = body;
  const { id } = params;

  const employee = await EmployeeService.getObjectByOwner(id, owner);
  await CompanyService.checkRoles(id, employee.rolesId, CompanyRoleType.COMPANY_DETAIL_READ_WRITE);

  await CompanyService.changeDocumentObject(id, type, body);

  res.send({
    code: 0,
    result: {},
  });
};

exports.changeCertification = async (req, res) => {
  const { owner, body, params } = req;
  const { type } = body;
  const { id } = params;

  const employee = await EmployeeService.getObjectByOwner(id, owner);
  await CompanyService.checkRoles(id, employee.rolesId, CompanyRoleType.COMPANY_DETAIL_READ_WRITE);

  await CompanyService.changeCertificationObject(id, type, body);

  res.send({
    code: 0,
    result: {},
  });
};
