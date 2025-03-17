const DBEmployeeRepository = require('../../infrastructure/database/dbEmployeeRepository');
const EmployeeEntity = require('../../entities/EmployeeEntity');
const DBLocationRepository = require('../../infrastructure/database/dbLocationRepository');

class GetEmployeesUseCase {
  constructor() {
      this.employeeRepository = new DBEmployeeRepository();
  }

  async execute(compCode) {
      return await this.employeeRepository.findEmployeesByCompany(compCode);
  }
}

class CheckEmployeeIdUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
    }

    async execute(empID, compCode) {
        return await this.employeeRepository.checkEmployeeId(empID, compCode);
    }
}

class AddEmployeeUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
        this.locationRepository = new DBLocationRepository();
    }

    async execute({ compCode, empID, fname, mname, lname, dept, email, empPic, loc_assign }) {
        const location = await this.locationRepository.getLocationByName(loc_assign, compCode);
        const employeeEntity = new EmployeeEntity({
            compCode,
            empID,
            fname,
            mname,
            lname,
            dept,
            email,
            loc_assign: location.id,
            empPic,
            regStat: "Pre-registered",
            empStat: "Active"
        });
        await this.employeeRepository.createEmployee(employeeEntity);
        return employeeEntity;
    }
}

class UpdateEmployeeUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
        this.locationRepository = new DBLocationRepository();
    }

    async execute({ eid, empID, fname, mname, lname, dept, email, loc_assign, empStat, compCode }) {
        const location = await this.locationRepository.getLocationByName(eid, compCode);
        const employeeEntity = new EmployeeEntity({
            id: eid,
            compCode,
            empID,
            fname,
            mname,
            lname,
            dept,
            email,
            loc_assign: location.id,
            loc_assign,
            empStat
        });
        await this.employeeRepository.updateEmployee(employeeEntity);
        return employeeEntity;
    }
}

class UpdateEmployeeStatusUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
    }

    async execute({ id, empStat, compCode }) {
        if (!id || !empStat) {
            throw new Error("Employee ID and status are required");
        }
        console.log(id, empStat, compCode);
        await this.employeeRepository.updateEmployeeStatus(id, empStat, compCode);
        return { id, empStat };
    }
}

class UpdateEmployeeDetailsUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
    }

    async execute({ eid, empID, fname, mname, lname, dept, email, loc_assign, empStat, compCode }) {
        if (!eid || !fname || !lname) {
            throw new Error("Employee ID, first name, and last name are required");
        }
        await this.employeeRepository.updateEmployeeDetails({
            eid, empID, fname, mname, lname, dept, email, loc_assign, empStat, compCode
        });
        return { eid, empID, fname, lname };
    }
}


class DeleteEmployeeUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
    }

    async execute(id, compCode) {
        await this.employeeRepository.deleteEmployee(id, compCode);
    }
}

class GetEmployeeByIdUseCase {
     constructor() {
        this.employeeRepository = new DBEmployeeRepository();
    }
    async execute(id, compCode) {
      const employee = await this.employeeRepository.getEmployeeById(id, compCode);
        if (!employee) {
        console.log("No employee found in use case.");
        return null;
      }
      return employee;
    }
  }

  class GetEmployeeByIdEmpUseCase {
    constructor() {
       this.employeeRepository = new DBEmployeeRepository();
   }
   async execute(id, compCode) {
     const employee = await this.employeeRepository.getEmployeeByIdEmp(id, compCode);
       if (!employee) {
       console.log("No employee found in use case.");
       return null;
     }
     return employee;
   }
 }
  

class SearchEmployeesUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
    }

    async execute(searchQuery, compCode) {
        return await this.employeeRepository.searchEmployees(compCode, searchQuery, 'createdAt');
    }
}

class SortEmployeesUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
    }

    async execute(searchQuery, sortBy, compCode) {
        return await this.employeeRepository.searchEmployees(compCode, searchQuery, sortBy);
    }
}

class ImportEmployeesUseCase {
    constructor() {
        this.employeeRepository = new DBEmployeeRepository();
        this.locationRepository = new DBLocationRepository();
    }
 
    async execute(employees, compCode) {
        for (const employeeData of employees) {
            let locationId = null;
            if (employeeData.loc_assign) {
                const location = await this.locationRepository.getLocationIDByName(employeeData.loc_assign, compCode);
                if (location) {
                    locationId = location.id;
                } else {
                    throw new Error(`Location "${employeeData.loc_assign}" not found.`);
                }
            }
 
            const employeeEntity = new EmployeeEntity({
                ...employeeData,
                compCode,
                loc_assign: locationId,
            });
 
            await this.employeeRepository.createEmployee(employeeEntity);
        }
    }
}

class GetDepartmentsUseCase {
    constructor(employeeRepository = new DBEmployeeRepository()) {  // Default initialization if not passed
        this.employeeRepository = employeeRepository;
    }
  
    async execute(compCode) {
        return await this.employeeRepository.getDepartmentsByCompany(compCode);
    }
}


module.exports = {
    GetEmployeesUseCase,
    CheckEmployeeIdUseCase,
    AddEmployeeUseCase,
    UpdateEmployeeUseCase,
    UpdateEmployeeStatusUseCase,
    UpdateEmployeeDetailsUseCase,
    DeleteEmployeeUseCase,
    GetEmployeeByIdUseCase,
    GetEmployeeByIdEmpUseCase,
    SearchEmployeesUseCase,
    SortEmployeesUseCase,
    ImportEmployeesUseCase,
    GetDepartmentsUseCase
};
