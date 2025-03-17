const EmployeeRepository = require('../../adapters/repositories/employeeRepository');
const EmployeeEntity = require('../../entities/EmployeeEntity');
const db = require('../database'); 

class DBEmployeeRepository extends EmployeeRepository {
    async findEmployeesByCompany(compCode) {
        const query = `SELECT * FROM Employee WHERE compCode = ? ORDER BY createdAt DESC;`;
        const employees = await db.allAsync(query, [compCode]);
        return employees.map(emp => new EmployeeEntity(emp));
    }

    async checkEmployeeId(empID, compCode) {
        const query = `SELECT COUNT(*) as count FROM Employee WHERE empID = ? AND compCode = ?;`;
        const result = await db.getAsync(query, [empID, compCode]);
        return result.count > 0;
    }    

    async createEmployee(employeeEntity) {
        const query = `INSERT INTO Employee (compCode, empID, fname, mname, lname, dept, email, loc_assign, empPic, regStat, empStat)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        const { compCode, empID, fname, mname, lname, dept, email, loc_assign, empPic, regStat, empStat } = employeeEntity;
        await db.runAsync(query, [compCode, empID, fname, mname, lname, dept, email, loc_assign, empPic, regStat, empStat]);
    }

    async updateEmployee(employeeEntity) {
        const query = `UPDATE Employee SET fname = ?, mname = ?, lname = ?, dept = ?, email = ?, loc_assign = ? 
                    WHERE id = ? AND compCode = ?;`;
        const { id, fname, mname, lname, dept, email, loc_assign, compCode } = employeeEntity;
        const params = [fname, mname, lname, dept, email, loc_assign, id, compCode];
        await db.runAsync(query, params);
    }  

    async updateEmployeeStatus(id, empStat, compCode) {
        const query = `
            UPDATE Employee
            SET empStat = ?
            WHERE id = ? AND compCode = ?
        `;
        const params = [empStat, id, compCode];
        try {
            await db.runAsync(query, params);
        } catch (error) {
            console.error("Error updating employee status:", error.message);
            throw error;
        }
    } 

    async updateEmployeeDetails(employee) {
        const { loc_assign, ...employeeData } = employee;
    
        let locationID = loc_assign;
        if (typeof loc_assign === 'string') {
            const query = `SELECT id FROM Location WHERE name = ? AND compCode = ?`;
            const params = [loc_assign, employeeData.compCode];
            try {
                const result = await db.getAsync(query, params);
                if (result) {
                    locationID = result.id;  
                } else {
                    throw new Error("Location not found.");
                }
            } catch (error) {
                console.error("Error finding location ID:", error.message);
                throw error;
            }
        }
    
        const query = `
            UPDATE Employee
            SET empID = ?, fname = ?, mname = ?, lname = ?, dept = ?, email = ?, loc_assign = ?
            WHERE id = ? AND compCode = ?
        `;
    
        const params = [
            employeeData.empID, employeeData.fname, employeeData.mname || null, employeeData.lname,
            employeeData.dept || null, employeeData.email || null, locationID,
            employeeData.eid, employeeData.compCode
        ];

        try {
            await db.runAsync(query, params);
        } catch (error) {
            console.error("Error updating employee details:", error.message);
            throw error;
        }
    }
    
    async deleteEmployee(id, compCode) {
        const query = `DELETE FROM Employee WHERE id = ? AND compCode = ?;`;
        await db.runAsync(query, [id, compCode]);
    }

    async getEmployeeById(id, compCode) {
        const query = `SELECT * FROM Employee WHERE empID = ? AND compCode = ?;`;
        console.log(`Executing Query: ${query}, Parameters: [${id}, ${compCode}]`);
      
        const rawEmployee = await db.getAsync(query, [id, compCode]);
        // console.log('Fetched Data from DB:', rawEmployee);
    
        if (!rawEmployee) throw new Error("Employee not found.");
        return new EmployeeEntity(rawEmployee);
    }

    async getEmployeeByIdEmp(id, compCode) {
        const query = `SELECT * FROM Employee WHERE id = ? AND compCode = ?;`;
        console.log(`Executing Query: ${query}, Parameters: [${id}, ${compCode}]`);
      
        const rawEmployee = await db.getAsync(query, [id, compCode]);
        // console.log('Fetched Data from DB:', rawEmployee);
    
        if (!rawEmployee) throw new Error("Employee not found.");
        return new EmployeeEntity(rawEmployee);
    }
    
    async searchEmployees(compCode, query, sortBy = 'createdAt') {
        const validSortColumns = ['empID', 'fname', 'lname', 'dept', 'email', 'empStat', 'loc_assign', 'createdAt'];

        if (!validSortColumns.includes(sortBy)) {
            sortBy = 'createdAt'; 
        }

        const sql = `SELECT * FROM Employee WHERE compCode = ? AND (fname LIKE ? OR lname LIKE ? OR empID LIKE ? OR dept LIKE ?)
                     ORDER BY ${sortBy} DESC;`;

        const searchParam = `%${query || ''}%`;
        const employees = await db.allAsync(sql, [compCode, searchParam, searchParam, searchParam, searchParam]);
        return employees.map(emp => new EmployeeEntity(emp));
    }

    async findEmployeesByCompany(compCode) {
        const query = `
            SELECT e.*, l.name AS locationName
            FROM Employee e
            LEFT JOIN Location l ON e.loc_assign = l.id
            WHERE e.compCode = ?
            ORDER BY e.createdAt DESC
        `;
        return new Promise((resolve, reject) => {
            db.all(query, [compCode], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(row => ({
                    ...row,
                    Location: { name: row.locationName },
                })));
            });
        });
    }
    
    async findEmployeesByCompany(compCode) {
        const query = `
            SELECT e.*, l.name AS locationName
            FROM Employee e
            LEFT JOIN Location l ON e.loc_assign = l.id
            WHERE e.compCode = ?
            ORDER BY e.createdAt DESC
        `;
        return new Promise((resolve, reject) => {
            db.all(query, [compCode], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(row => ({
                    ...row,
                    Location: { name: row.locationName },
                })));
            });
        });
    }

    async getDepartmentsByCompany(compCode) {
        const query = `
            SELECT DISTINCT dept
            FROM Employee
            WHERE compCode = ?
        `;
        const departments = await db.allAsync(query, [compCode]);
        return departments;
    }

    async getEmployeeRecords(employeeId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT act AS activity, time, date FROM Record WHERE empID = ? ORDER BY createdAt DESC;`;
            
            console.log('Executing query:', query, 'with employeeId:', employeeId); // Log query and parameters for debugging
    
            db.all(query, [employeeId], (err, rows) => {
                if (err) {
                    console.error('Database error while fetching records:', err); // More detailed logging
                    return reject(new Error('Database error while fetching records: ' + err.message));
                }
                
                if (!rows || rows.length === 0) {
                    console.log('No records found for employeeId:', employeeId); // Log if no records are found
                }
                
                resolve(rows);  
            });
        });
    }
    
    async addEmployeeRecord({ empID, time, date, act, img, address, long, lat }) {
        return new Promise((resolve, reject) => {
            const employeeQuery = `SELECT id FROM Employee WHERE id = ?`;
            
            db.get(employeeQuery, [empID], (err, row) => {
                if (err) {
                    return reject(new Error('Database error while checking employee.'));
                }

                if (!row) {
                    return reject(new Error('Employee not found.'));
                }

                const insertRecordQuery = `
                    INSERT INTO Record (empID, time, date, act, img, address, long, lat)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                db.run(insertRecordQuery, [empID, time, date, act, img, address, long, lat], function (err) {
                    if (err) {
                        return reject(new Error('Error while adding the employee record.'));
                    }

                    resolve({
                        id: this.lastID,
                        empID,
                        time,
                        date,
                        act,
                        img,
                        address,
                        long,
                        lat,
                    });
                });
            });
        });
    }
}

module.exports = DBEmployeeRepository;

