const dbRecordRepository = require('../../infrastructure/database/dbRecordRepository');

class ReportService {
    async getRecordsByDate(compCode) {
        return dbRecordRepository.getRecordsByDate(compCode);
    }

    async allRecords(compCode) {
        return dbRecordRepository.allRecords(compCode);
    }

    async getLocations() {
        return dbRecordRepository.getLocations();
    }

    async getDepartments(compCode) {
        try {
            const result = await dbRecordRepository.getDepartments(compCode);
            console.log("Departments fetched:", result); // Log the result here
            return result;
        } catch (err) {
            console.error("Error fetching departments:", err.message);
            throw err; // Propagate the error after logging it
        }
    }
    

    async getEmployeesByIds(empIDs) {
        return dbRecordRepository.getEmployeesByIds(empIDs);
    }

    async getSortedRecords(sortBy, compCode) {
        return dbRecordRepository.getSortedRecords(sortBy, compCode);
    }

    async getFilteredRecords(searchQuery, compCode) {
        return dbRecordRepository.getFilteredRecords(searchQuery, compCode);
    }

    async getRecordsByDate(compCode, dateFrom, dateTo) {
        return dbRecordRepository.getRecordsByDate(compCode, dateFrom, dateTo);
    }
    async getRecordsByDateFilter(compCode, dateFrom, dateTo) {
        return dbRecordRepository.getRecordsByDateFilter(compCode, dateFrom, dateTo);
    }

    async getStartRecordsByDate(compCode) {
        return dbRecordRepository.getStartRecordsByDate(compCode);
    }

    async getNotRecordsByDate(compCode) {
        return dbRecordRepository.getNotRecordsByDate(compCode);
    }

    async getDepartments() {
        return dbRecordRepository.getDepartments();
    }

    async getLocations(compCode) {
        return dbRecordRepository.getLocations(compCode);
    }

    async getTotalEmployees(compCode) {
        return dbRecordRepository.getTotalEmployees(compCode);
    }

    async getDepartments(compCode) {
        const departments = await dbRecordRepository.getDepartments(compCode);
        return departments.map((d) => d.dept);
    }

    async getLocations(compCode) {
        return await dbRecordRepository.getLocations(compCode);
    }

    async getEmployeeCountsByLocation(compCode) {
        return await dbRecordRepository.getEmployeeCountsByLocation(compCode);
    }
 
    async getLateEmployees(compCode) {
        return await dbRecordRepository.getLateEmployees(compCode);
    }
 
    async getEmployeesWithoutLogout(compCode) {
        return await dbRecordRepository.getEmployeesWithoutLogout(compCode);
    }
 
    async getEmployeesWithoutLogin(compCode) {
        return await dbRecordRepository.getEmployeesWithoutLogin(compCode);
    }

    async getEmployeesWithoutLogin(currentDate, compCode, dept = null) {
        return await dbRecordRepository.getEmployeesWithoutLogin(currentDate, compCode, dept);
    }

    async getRejectedLogs(compCode) {
        return dbRecordRepository.getRejectedLogs(compCode);
    }

}

module.exports = new ReportService();
