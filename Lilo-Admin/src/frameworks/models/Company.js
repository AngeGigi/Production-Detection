class Company {
    constructor(compCode, compUser, compName, compEmail, compAddress, compCountEmp, compNum, subType, compExp, compVer, compFeat, createdAt, updatedAt) {
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
  }
  
module.exports = Company;
  