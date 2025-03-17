class EmployeeEntity {
    constructor({
      id,
      compCode,
      empID,
      fname,
      mname = '',
      lname,
      dept,
      email = '', // Default value if not provided
      loc_assign,
      empPic = null, // Default to null if not provided
      regStat,
      empStat
    }) {
      this.id = id;
      this.compCode = compCode;
      this.empID = empID;
      this.fname = fname;
      this.mname = mname;
      this.lname = lname;
      this.dept = dept;
      this.email = email;
      this.loc_assign = loc_assign;
      this.empPic = empPic;
      this.regStat = regStat;
      this.empStat = empStat;
    }
  
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email || !emailRegex.test(this.email)) {
        throw new Error('Invalid email address');
      }
    }
  
    getFullName() {
      return `${this.fname} ${this.mname ? this.mname + ' ' : ''}${this.lname}`;
    }
  }
  
  module.exports = EmployeeEntity;
  