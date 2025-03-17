class EmployeeRepository {
  async findEmployeesByCompany(compCode) {
      throw new Error("Method 'findEmployeesByCompany' must be implemented.");
  }

  async checkEmployeeId(empID, compCode) {
    throw new Error("Method 'checkEmployeeId' must be implemented.");
  }

  async createEmployee(employeeEntity) {
      throw new Error("Method 'createEmployee' must be implemented.");
  }

  async updateEmployee(employeeEntity) {
      throw new Error("Method 'updateEmployee' must be implemented.");
  }

  async deleteEmployee(id, compCode) {
      throw new Error("Method 'deleteEmployee' must be implemented.");
  }

  async getEmployeeById(id, compCode) {
      throw new Error("Method 'getEmployeeById' must be implemented.");
  }

  async getEmployeeByIdEmp(id, compCode) {
    throw new Error("Method 'getEmployeeById' must be implemented.");
}

  async searchEmployees(compCode, query, sortBy = 'createdAt') {
      throw new Error("Method 'searchEmployees' must be implemented.");
  }

  async findEmployeesByCompany(compCode) {
    throw new Error("Method 'findEmployeesByCompany' must be implemented.");
  }

  async getDepartmentsByCompany(compCode) {
    throw new Error("Method not implemented");
}
}

module.exports = EmployeeRepository;
