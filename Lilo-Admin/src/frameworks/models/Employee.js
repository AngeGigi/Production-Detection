// app/frameworks/models/Employee.js
class Employee {
    constructor(id, compCode, empID, fname, mname, lname, dept, email, loc_assign, empPic, regStat, empStat, createdAt, updatedAt) {
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
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }

    // Method to validate email
    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }
}

module.exports = Employee;
