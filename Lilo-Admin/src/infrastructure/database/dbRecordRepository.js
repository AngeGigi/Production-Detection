const db = require('../database'); 

const dbRecordRepository = {
    async getRecordsByDate(compCode) {
        const sql = `
            SELECT
                e.id,
                r.empID,
                r.time,
                r.date,
                r.act,
                r.img,
                r.address,
                r.long,
                r.lat
            FROM
                Record r
            JOIN
                Employee e ON r.empID = e.id
            WHERE
                DATE(r.date) = CURRENT_DATE
                AND e.compCode = ?
            ORDER BY r.createdAt DESC;
        `;
        try {
            const rows = await db.allAsync(sql, [compCode]);
            return rows;
        } catch (err) {
            throw new Error("Error fetching records by date: " + err.message);
        }
    },

    async allRecords(compCode) {
        const sql = `
            SELECT
                e.id,
                r.empID,
                r.time,
                r.date,
                r.act,
                r.img,
                r.address,
                r.long,
                r.lat,
                r.createdAt
            FROM
                Record r
            JOIN
                Employee e ON r.empID = e.id
            WHERE
                e.compCode = ?
            ORDER BY r.createdAt DESC;
        `;
        try {
            const rows = await db.allAsync(sql, [compCode]);
            return rows;
        } catch (err) {
            throw new Error("Error fetching all records: " + err.message);
        }
    },

    async getLocations() {
        const sql = `SELECT * FROM Location ORDER BY createdAt DESC`;
        try {
            const rows = await db.allAsync(sql);
            return rows;
        } catch (err) {
            throw new Error("Error fetching locations: " + err.message);
        }
    },

    async getDepartments(compCode) {
        const sql = `
            SELECT DISTINCT dept FROM Employee WHERE compCode = ?;
        `;
        try {
            const rows = await db.allAsync(sql, [compCode]);
            return rows;
        } catch (err) {
            throw new Error("Error fetching departments: " + err.message);
        }
    },

    async getEmployeesByIds(empIDs) {
        const sql = `
            SELECT * FROM Employee WHERE id IN (${empIDs.map(() => '?').join(', ')});
        `;
        try {
            const rows = await db.allAsync(sql, empIDs);
            return rows;
        } catch (err) {
            throw new Error("Error fetching employees: " + err.message);
        }
    },

    async getSortedRecords(sortBy = 'default', compCode) {
        let sql = `
            SELECT
                r.id, e.empID, e.dept, e.fname, e.mname, e.lname, r.time, r.date,
                r.act, r.img, r.address, r.long, r.lat, e.compCode
            FROM
                Record r
            JOIN
                Employee e ON r.empID = e.id
            WHERE
                DATE(r.date) = CURRENT_DATE AND
                e.compCode = ?
        `;
    
        if (sortBy === "default") {
            sql += " ORDER BY r.createdAt DESC"; 
        } else {
            switch (sortBy) {
                case "employeeId":
                    sql += " ORDER BY e.empID ASC";
                    break;
                case "fullName":
                    sql += ' ORDER BY CONCAT(e.fname, " ", e.mname, " ", e.lname) ASC';
                    break;
                case "department":
                    sql += " ORDER BY e.dept ASC";
                    break;
                case "check-in":
                    sql += ' AND r.act = "in" ORDER BY r.time ASC';
                    break;
                case "check-out":
                    sql += ' AND r.act = "out" ORDER BY r.time ASC';
                    break;
                default:
                    sql += " ORDER BY r.createdAt DESC"; 
                    break;
            }
        }
    
        try {
            const rows = await db.allAsync(sql, [compCode]);
            return rows;
        } catch (err) {
            throw new Error("Error fetching sorted records: " + err.message);
        }
    },
    

    async getFilteredRecords(searchQuery, compCode) {   
        const sql = `
            SELECT
                e.id,
                r.empID,
                e.dept,
                e.fname,
                e.mname,
                e.lname,
                r.time,
                r.date,
                r.act,
                r.img,
                r.address,
                r.long,
                r.lat
            FROM
                Record r
            JOIN
                Employee e ON r.empID = e.id
            WHERE
                DATE(r.date) = CURRENT_DATE AND
                e.compCode = ? AND 
                (e.fname LIKE ? OR e.mname LIKE ? OR e.lname LIKE ? OR e.empID LIKE ? OR 
                e.dept LIKE ? OR r.time LIKE ? OR r.act LIKE ? OR r.date LIKE ? OR 
                r.address LIKE ? OR r.long LIKE ? OR r.lat LIKE ?)
        `;
    
        const searchParam = `%${searchQuery}%`; 
    
        const params = [
            compCode,  
            searchParam, searchParam, searchParam, searchParam,  
            searchParam, searchParam, searchParam, searchParam,  
            searchParam, searchParam, searchParam  
        ];
    
        try {
            const rows = await db.allAsync(sql, params); 
            return rows;
        } catch (err) {
            throw new Error("Error fetching filtered records: " + err.message);
        }
    },    

    async getRecordsByDateFilter(compCode, dateFrom, dateTo) {
        let sql = `
            SELECT 
                r.* 
            FROM 
                Record r
            JOIN 
                Employee e ON r.empID = e.id 
            WHERE 
                e.compCode = ?`; 
        const params = [compCode];
    
        if (dateFrom && dateTo) {
            sql += ` AND r.date BETWEEN ? AND ?`;
            params.push(dateFrom, dateTo); 
        } else if (dateFrom) {
            sql += ` AND r.date >= ?`;
            params.push(dateFrom); 
        } else if (dateTo) {
            sql += ` AND r.date <= ?`;
            params.push(dateTo); 
        }
    
        try {
            const rows = await db.allAsync(sql, params); 
            return rows;
        } catch (err) {
            throw new Error("Error fetching records by date: " + err.message);
        }
    },
    
    //start of day

    async getStartRecordsByDate(compCode) {
        const sql = `
            SELECT
                e.empID,
                e.dept,
                e.fname,
                e.mname,
                e.lname,
                MIN(r.time) AS earliest_time,
                r.date,
                r.act,
                r.img,
                r.address AS address,  
                l.long,
                l.lat,
                e.compCode
            FROM
                Record r
            JOIN
                Employee e ON r.empID = e.id
            JOIN
                Location l ON e.loc_assign = l.id  
            WHERE
                DATE(r.date) = CURRENT_DATE AND
                r.act = 'in' AND
                e.compCode = ?  
            GROUP BY
                e.empID, e.fname, e.mname, e.lname, r.date, l.name, l.long, l.lat  
            ORDER BY
                r.date DESC, earliest_time ASC;
        `;

        try {
            const rows = await db.allAsync(sql, [compCode]);
            return rows;
        } catch (err) {
            throw new Error("Error fetching start records: " + err.message);
        }
    },

    async getNotRecordsByDate(compCode) {
        const sql = `
            SELECT
                e.empID,
                e.dept,
                e.fname,
                e.mname,
                e.lname,
                (SELECT MAX(r.time) FROM Record r WHERE r.empID = e.id AND DATE(r.date) < CURRENT_DATE) AS time,
                (SELECT MAX(r.date) FROM Record r WHERE r.empID = e.id AND DATE(r.date) < CURRENT_DATE) AS date,
                (SELECT MAX(r.act) FROM Record r WHERE r.empID = e.id AND DATE(r.date) < CURRENT_DATE) AS act,
                (SELECT MAX(r.img) FROM Record r WHERE r.empID = e.id AND DATE(r.date) < CURRENT_DATE) AS img,
                (SELECT MAX(r.address) FROM Record r WHERE r.empID = e.id AND DATE(r.date) < CURRENT_DATE) AS address,
                (SELECT MAX(r.long) FROM Record r WHERE r.empID = e.id AND DATE(r.date) < CURRENT_DATE) AS longitude,
                (SELECT MAX(r.lat) FROM Record r WHERE r.empID = e.id AND DATE(r.date) < CURRENT_DATE) AS latitude
            FROM
                Employee e
            WHERE
                e.id NOT IN (SELECT empID FROM Record WHERE DATE(date) = CURRENT_DATE) AND 
                e.compCode = ?;
        `;

        try {
            const rows = await db.allAsync(sql, [compCode]);
            return rows;
        } catch (err) {
            throw new Error("Error fetching not-logged-in records: " + err.message);
        }
    },

    async getDepartments() {
        const sql = `
            SELECT DISTINCT dept
            FROM Employee;
        `;

        try {
            const rows = await db.allAsync(sql);
            return rows.map((row) => row.dept);
        } catch (err) {
            throw new Error("Error fetching departments: " + err.message);
        }
    },

    async getLocations(compCode) {
        const sql = `
            SELECT *
            FROM Location
            WHERE compCode = ?
            ORDER BY createdAt DESC;
        `;

        try {
            return await db.allAsync(sql, [compCode]);
        } catch (err) {
            throw new Error("Error fetching locations: " + err.message);
        }
    },

    async getTotalEmployees(compCode) {
        const sql = `
            SELECT COUNT(*) AS total
            FROM Employee
            WHERE compCode = ?;
        `;

        try {
            const row = await db.getAsync(sql, [compCode]); 
            return row.total;
        } catch (err) {
            throw new Error("Error fetching total employees: " + err.message);
        }
    },

    //end of day
    async getDepartments(compCode) {
        const sql = `
            SELECT DISTINCT dept
            FROM Employee
            WHERE compCode = ?;
        `;
        return await db.allAsync(sql, [compCode]);
    },

    async getLocations(compCode) {
        const sql = `
            SELECT *
            FROM Location
            WHERE compCode = ?
            ORDER BY createdAt DESC;
        `;
        return await db.allAsync(sql, [compCode]);
    },

    async getEmployeeCountsByLocation(compCode) {
        const sql = `
            SELECT
                l.id AS locationId,
                l.name AS locationName,
                COUNT(DISTINCT r.empID) AS employeeCount,
                GROUP_CONCAT(DISTINCT e.dept) AS dept,
                GROUP_CONCAT(DISTINCT r.date) AS date
            FROM Location l
            JOIN Employee e ON e.loc_assign = l.id
            JOIN Record r ON r.empID = e.id
            WHERE
                r.act = 'in' AND e.compCode = ?
            GROUP BY l.id
            ORDER BY l.name;
        `;
        const result = await db.allAsync(sql, [compCode]);
        result.forEach(location => {
            location.dept = location.dept ? location.dept.split(',') : [];
            location.date = location.date ? location.date.split(',') : [];
        });
        return result;
    },    
 
    async getLateEmployees(compCode) {
        const sql = `
            SELECT
                r.empID, e.fname, e.lname, e.dept, MIN(r.time) AS time, r.date
            FROM Record r
            JOIN Employee e ON r.empID = e.id
            WHERE
                r.act = 'in' AND r.time > '08:00:00'
                AND e.compCode = ?
            GROUP BY r.empID, e.fname, e.lname, e.dept, r.date;
        `;
        return await db.allAsync(sql, [compCode]);
    },
   
 
    async getEmployeesWithoutLogout(compCode) {
        const sql = `
            SELECT
                e.id AS empID, e.fname, e.lname, e.dept, MIN(r.time) AS time, r.date
            FROM Employee e
            JOIN Record r ON r.empID = e.id
            WHERE
                r.act = 'in'
                AND e.compCode = ?
                AND r.empID NOT IN (
                    SELECT empID FROM Record WHERE act = 'out'
                )
            GROUP BY e.id, e.fname, e.lname, e.dept, r.date;
        `;
        const result = await db.allAsync(sql, [compCode]);
        return result;
    },
   
   
 
    async getEmployeesWithoutLogin(compCode) {
        const sql = `
            SELECT
                e.id, e.fname, e.lname, e.dept, r.date
            FROM Employee e
            LEFT JOIN Record r ON e.id = r.empID
            WHERE
                r.empID IS NULL
                AND e.compCode = ?
        `;        
        const parameters = [compCode];
        const result = await db.allAsync(sql, parameters);
        return result;
    },   

    async getEmployeeCount(compCode) {
        const sql = `
            SELECT COUNT(*) AS employeeCount
            FROM Employee
            WHERE compCode = ?;
        `;
        const result = await db.getAsync(sql, [compCode]);
        return result.employeeCount;
    },
    
    async getEmployeeCountByDept(compCode, dept) {
        const sql = `
            SELECT COUNT(*) AS employeeCount
            FROM Employee
            WHERE compCode = ? AND dept = ?;
        `;
        const result = await db.getAsync(sql, [compCode, dept]);
        return result.employeeCount;
    },

    //sort end of

    //rejected logs
     async getRejectedLogs(compCode) {
        if (!compCode) {
            throw new Error("Missing compCode");
        }

        const query = `
        SELECT 
            e.empID,
            e.dept,
            e.fname,
            e.mname,
            e.lname,
            r.time,
            r.date,
            r.act,
            r.img,
            l.name AS address,
            l.long,
            l.lat,
            6371 * acos(
                cos(radians(l.lat)) * 
                cos(radians(r.lat)) * 
                cos(radians(r.long) - radians(l.long)) + 
                sin(radians(l.lat)) * 
                sin(radians(r.lat))
            ) AS distance
        FROM 
            Record r
        JOIN 
            Employee e ON r.empID = e.id
        JOIN 
            Location l ON e.loc_assign = l.id
        WHERE 
            e.compCode = ?  
            AND 6371 * acos(
                cos(radians(l.lat)) * 
                cos(radians(r.lat)) * 
                cos(radians(r.long) - radians(l.long)) + 
                sin(radians(l.lat)) * 
                sin(radians(r.lat))
            ) > 0.05
        ORDER BY
            r.date DESC,
            r.time DESC;
        `;
        
        try {
            const rows = await db.allAsync(query, [compCode]);
            return rows;
        } catch (err) {
            throw new Error("Error fetching rejected logs: " + err.message);
        }
    }

};

module.exports = dbRecordRepository;
