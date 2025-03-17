const DBEmployeeRepository = require('../../infrastructure/database/dbEmployeeRepository');
const EmployeeEntity = require('../../entities/EmployeeEntity');

class EmployeeService {
  constructor(employeeRepository = new DBEmployeeRepository()) {
      this.employeeRepository = employeeRepository;
  }

  async getEmployees(compCode) {
      return await this.employeeRepository.findEmployeesByCompany(compCode);
  }

  async getEmployeeRecords(empID) {
    try {
        const records = await this.employeeRepository.getEmployeeRecords(empID);
        return records;
    } catch (error) {
        throw new Error('Error fetching employee records: ' + error.message);
    }
}

async addEmployeeRecord(recordData) {
    try {
        const newRecord = await this.employeeRepository.addEmployeeRecord(recordData);
        return newRecord;
    } catch (error) {
        throw new Error(error.message || 'Error while adding employee record');
    }
}

  async createEmployee(employeeData) {
      const employee = new EmployeeEntity(employeeData);
      return await this.employeeRepository.createEmployee(employee);
  }

  async updateEmployee(employeeData) {
      const employee = new EmployeeEntity(employeeData);
      return await this.employeeRepository.updateEmployee(employee);
  }

  async deleteEmployee(id, compCode) {
      return await this.employeeRepository.deleteEmployee(id, compCode);
  }

  async getEmployeeById(id, compCode) {
      return await this.employeeRepository.getEmployeeById(id, compCode);
  }

  async searchAndSortEmployees(compCode, searchQuery, sortBy) {
      return await this.employeeRepository.searchEmployees(compCode, searchQuery, sortBy);
  }
}

module.exports = EmployeeService;
