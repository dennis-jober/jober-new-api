'use strict';

function addPrefix(name) {
  if (process.env.NODE_ENV === 'production') return `jober.${name}`;
  return `test.jober.${name}`;
}

exports.AccountType = Object.freeze({
  UID: 'uid',
  USERNAME: 'username',
  EMAIL: 'email',
  GOOGLE: 'google',
  APPLE: 'apple',
  FACEBOOK: 'fb',
  KAKAO: 'kakao',
  NAVER: 'naver',
  LINE: 'line',
});

exports.EmployeeType = Object.freeze({
  FULLTIME: 'fulltime',
  CONTRACTOR: 'contractor',
  FREELANCER: 'freelancer',
  INTERN: 'intern',
  EXTERN: 'extern', // 외부직원(외부관리자, 사외이사, 외부감사 등)
});

const CompanyRoleType = Object.freeze({
  EMPLOYEE_READ: 'employeeRead', // 직원(읽기)
  EMPLOYEE_READ_WRITE: 'employeeReadWrite', // 직원(읽기, 쓰기-초대포함)
  EMPLOYEE_READ_WRITE_DELETE: 'employeeReadWriteDelete', // 직원관리(읽기, 쓰기-초대포함, 퇴사)

  EMPLOYMENT_CONTRACT_READ: 'employmentContractRead', // 근로계약서(읽기)
  EMPLOYMENT_CONTRACT_READ_WRITE: 'employmentContractReadWrite', // 근로계약서(읽기, 쓰기)

  FREELANCER_READ: 'freelancerRead', // 프리랜서(읽기)
  FREELANCER_READ_WRITE: 'freelancerReadWrite', // 프리랜서(읽기, 쓰기-초대포함)
  FREELANCER_READ_WRITE_DELETE: 'freelancerReadWriteDelete', // 프리랜서(읽기, 쓰기-초대포함, 퇴사)

  FREELANCE_CONTRACT_READ: 'freelanceContractRead', // 프리랜스 계약서(읽기)
  FREELANCE_CONTRACT_READ_WRITE: 'freelanceContractReadWrite', // 프리랜스 계약서(읽기, 쓰기-초대포함)

  INTERN_READ: 'internRead', // 인턴(읽기)
  INTERN_READ_WRITE: 'internReadWrite', // 인턴(읽기, 쓰기-초대포함)
  INTERN_READ_WRITE_DELETE: 'internReadWriteDelete', // 인턴(읽기, 쓰기-초대포함, 퇴사)

  INTERN_CONTRACT_READ: 'freelanceContractRead', // 프리랜스 계약서(읽기)
  INTERN_CONTRACT_READ_WRITE: 'freelanceContractReadWrite', // 프리랜스 계약서(읽기, 쓰기-초대포함)

  OGANIZATION_READ: 'oganizationRead', // 조직도(읽기)
  OGANIZATION_READ_WRITE: 'oganizationReadWrite', // 조직도(읽기, 쓰기)
  ORGNIZATION_READ_WRITE_DELETE: 'oganizationReadWriteDelete', // 조직도(읽기, 쓰기, 삭제)

  EMPLOYMENT_SUPPORT_FUND_READ: 'employmentSupportFundRead', // 고용지원금(읽기)
  EMPLOYMENT_SUPPORT_FUND_READ_WRITE: 'employmentSupportFundReadWrite', // 고용지원금(읽기, 쓰기)

  RECRUITMENT_READ: 'recruitmentRead', // 채용(읽기)
  RECRUITMENT_READ_WRITE: 'recruitmentReadWrite', // 채용(읽기, 쓰기)
  RECRUITMENT_READ_WRITE_DELETE: 'recruitmentReadWriteDelete', // 채용(읽기, 쓰기, 삭제)

  BOARD_READ: 'boardRead', // 게시판(읽기)
  BOARD_READ_WRITE: 'boardReadWrite', // 게시판(읽기, 쓰기)
  BOARD_READ_WRITE_DELETE: 'boardReadWriteDelete', // 게시판(읽기, 쓰기, 삭제)

  SETTING_READ: 'settingRead', // 설정(읽기)
  SETTING_READ_WRITE: 'settingReadWrite', // 설정(읽기, 쓰기)

  COMPANY_DETAIL_READ: 'companyDetailRead', // 기업정보(읽기)
  COMPANY_DETAIL_READ_WRITE: 'companyDetailReadWrite', // 기업정보(읽기, 쓰기)
});
exports.CompanyRoleType = CompanyRoleType;

exports.CompanyChiefAdminRoles = Object.freeze([
  CompanyRoleType.EMPLOYEE_READ_WRITE_DELETE,
  CompanyRoleType.EMPLOYMENT_CONTRACT_READ_WRITE,
  CompanyRoleType.FREELANCER_READ_WRITE_DELETE,
  CompanyRoleType.FREELANCE_CONTRACT_READ_WRITE,
  CompanyRoleType.INTERN_READ_WRITE_DELETE,
  CompanyRoleType.INTERN_CONTRACT_READ_WRITE,
  CompanyRoleType.ORGNIZATION_READ_WRITE_DELETE,
  CompanyRoleType.EMPLOYMENT_SUPPORT_FUND_READ_WRITE,
  CompanyRoleType.RECRUITMENT_READ_WRITE_DELETE,
  CompanyRoleType.BOARD_READ_WRITE_DELETE,
  CompanyRoleType.SETTING_READ_WRITE,
  CompanyRoleType.COMPANY_DETAIL_READ_WRITE,
]);

exports.CompanyDocumentType = Object.freeze({
  BUSINESS_LICENCE: 'businessLicence',
  BANK_ACCOUNT: 'bankAccount',
});

exports.CompanyCertificationType = Object.freeze({
  VENTURE: 'venture',
  RESEARCH_INSTITUTE: 'researchInstitute',
  GUARANTEE_FUND: 'guaranteeFund',
});

exports.DDBTableName = Object.freeze({
  USER: addPrefix('user'),
  COMPANY: addPrefix('company'),
  COMPANY_ROLE: addPrefix('company.role'),
  COMPANY_DOCUMENT: addPrefix('company.document'),
  COMPANY_CERTIFICATION: addPrefix('company.certification'),
  EMPLOYEE: addPrefix('employee'),
});

const TextType = Object.freeze({
  USER_NAME_FOR_COMPANY_CREATION: 'userNameForCompanyCreation',
  COMPANY_ROLES_CHIEF_ADMIN_TITLE: 'companyRolesAdminTitle',
  COMPANY_ROLES_CHIEF_ADMIN_DESC: 'companyRolesAdminDesc',
  COMPANY_ROLES_EMPLOYEE_TITLE: 'companyRolesEmployeeTitle',
  COMPANY_ROLES_EMPLOYEE_DESC: 'compnayRolesEmployeeDesc',
});
exports.TextType = TextType;

const LanguagePack = Object.freeze({ // TODO: Excel로부터 읽어와서 구성할 수 있도록 수정해야함.
  [TextType.USER_NAME_FOR_COMPANY_CREATION]: { kor: '최고관리자', eng: 'Administrator' },
  [TextType.COMPANY_ROLES_CHIEF_ADMIN_TITLE]: { kor: '최고관리자', eng: 'Administrator' },
  [TextType.COMPANY_ROLES_CHIEF_ADMIN_DESC]: { kor: '관리자는 모든 권한을 갖습니다.', eng: 'All roles' },
  [TextType.COMPANY_ROLES_EMPLOYEE_TITLE]: { kor: '직원', eng: 'Employee' },
  [TextType.COMPANY_ROLES_EMPLOYEE_DESC]: { kor: '직원은 제한된 권한을 갖습니다. 권한 및 알림 설정을 수정할 수 있습니다.', eng: 'Limited roles' },
});
exports.Text = (text, lang) => {
  text = LanguagePack[text];

  if (!text) return 'untitled';

  return text[lang] || text.kor;
};
