class CompanyEntity {
  constructor(id, compCode, compUser, compName, compEmail, compAddress, compCountEmp, compNum, subType, compExp, compVer, compFeat, createdAt, updatedAt) {
    this.id = id;
    this.compCode = compCode;
    this.compUser = compUser;
    this.compName = compName;
    this.compEmail = compEmail;
    this.compAddress = compAddress;
    this.compCountEmp = compCountEmp;
    this.compNum = compNum;
    this.subType = subType;
    this.compExp = compExp;
    this.compVer = compVer;
    this.compFeat = compFeat;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validateCode() {
    const errors = [];
    if (
      !this.compUser || 
      !this.compName ||
      !this.compEmail || 
      !this.compAddress ||
      !this.compCountEmp ||
      !this.compNum || 
      !this.subType || 
      !this.compExp || 
      !this.compVer || 
      !this.compFeat 
    ) {
      errors.push('All fields are required.');
    }
    return errors;
  }

  validateEmail() {
    const errors = [];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!this.compEmail || !emailRegex.test(this.compEmail)) {
      errors.push('Invalid email format.');
    }
    return errors;
  }

  validateCompNum() {
    const errors = [];
    const numRegex = /^[0-9]{11}$/;
    if (!this.compNum || !numRegex.test(this.compNum)) {
      errors.push('Company number must contain exactly 11 digits.');
    }
    return errors;
  }

  validate() {
    const errors = [];
    errors.push(...this.validateCode());
    // errors.push(...this.validateEmail());
    // errors.push(...this.validateCompNum());
    return errors;
  }
}

module.exports = CompanyEntity;
