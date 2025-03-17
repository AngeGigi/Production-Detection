const db = require('../../infrastructure/database'); 
const Admin = require('../../entities/AdminEntity'); 

class AdminRepository {
  //find
  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Admin WHERE username = ?`;
      db.get(query, [username], (err, row) => {
        if (err) {
          return reject(err);
        }
        if (row) {
          resolve(new Admin(row)); 
        } else {
          resolve(null); 
        }
      });
    });
  }

  //save
  async save(adminEntity) {
    return new Promise((resolve, reject) => {
      const { username, password, email, compCode, createdAt, updatedAt } = adminEntity;
      const query = `INSERT INTO Admin (username, password, email, compCode, createdAt, updatedAt) 
                     VALUES (?, ?, ?, ?, ?, ?)`;

      db.run(query, [username, password, email, compCode, createdAt, updatedAt], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.lastID); 
      });
    });
  }

  //update
  async update(adminEntity) {
    return new Promise((resolve, reject) => {
      const { id, username, password, compCode, updatedAt } = adminEntity;
      const query = `UPDATE Admin SET username = ?, password = ?, compCode = ?, updatedAt = ? WHERE id = ?`;

      db.run(query, [username, password, compCode, updatedAt, id], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes); 
      });
    });
  }

  async count(compCode) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) AS count
        FROM Employee
        WHERE compCode = ?
      `;
  
      db.all(sql, [compCode], (err, rows) => {
        if (err) {
          reject(err); // Rejects if there's an error
        } else {
          resolve(rows[0].count); // Resolves the count value
        }
      });
    });
  }

  async countStatus(compCode, empStat) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) AS count
        FROM Employee
        WHERE compCode = ? AND empStat = ?
      `;

      db.all(sql, [compCode, empStat], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0].count);
        }
      });
    });
  }
  
  
  async countByStatus(compCode, date, action = null) {
    return new Promise((resolve, reject) => {
      let sql = `
          SELECT COUNT(*) AS count
          FROM Record
          INNER JOIN Employee ON Record.empID = Employee.id
          WHERE Employee.compCode = ? AND Record.date = ?
      `;

      // If action is provided, add it to the WHERE clause
      if (action) {
          sql += ` AND Record.act = ?`;
      }

      // Prepare parameters based on the presence of action
      const params = action ? [compCode, date, action] : [compCode, date];

  
      db.all(sql, params, (err, rows) => {
          if (err) {
              reject(err); // Rejects if there's an error
          } else {
              resolve(rows[0].count); // Resolves the count value
          }
      });
    });
  }

  async getRecentUsers(compCode) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT fname, lname
        FROM Employee
        WHERE compCode = ?
        ORDER BY createdAt DESC
        LIMIT 5
      `;
  
      db.all(sql, [compCode], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows); 
        }
      });
    });
  }
  
  async getLoginData(compCode) {
    return new Promise((resolve, reject) => {
      const sql = `
     SELECT 
    date,
    COUNT(DISTINCT CASE WHEN act = 'in' THEN Record.empID END) AS login_count,
    COUNT(DISTINCT CASE WHEN act = 'out' THEN Record.empID END) AS logout_count,
    MIN(CASE WHEN act = 'in' THEN time END) AS earliest_login_time,
    COALESCE(
        AVG(CASE WHEN act = 'in' THEN 
            strftime('%s', 
                CASE 
                    WHEN time LIKE '%AM' THEN REPLACE(time, ' AM', '')  -- Remove ' AM'
                    WHEN time LIKE '%PM' THEN REPLACE(time, ' PM', '')  -- Remove ' PM'
                    ELSE time  -- Leave other times as they are
                END
            ) END), 
        0) AS avg_login_seconds,  -- Replaces NULL with 0 if no login events
    COALESCE(
        AVG(CASE WHEN act = 'out' THEN 
            strftime('%s', 
                CASE 
                    WHEN time LIKE '%AM' THEN REPLACE(time, ' AM', '')  -- Remove ' AM'
                    WHEN time LIKE '%PM' THEN REPLACE(time, ' PM', '')  -- Remove ' PM'
                    ELSE time  -- Leave other times as they are
                END
            ) END), 
        0) AS avg_logout_seconds,  -- Replaces NULL with 0 if no logout events
COALESCE(
        MAX(CASE WHEN act = 'out' THEN time END),
        'No logout recorded'  -- Replace NULL with 'No logout recorded' if no logout event exists
    ) AS latest_out_time
FROM 
    Record
INNER JOIN 
    Employee ON Record.empID = Employee.id
WHERE 
    Employee.compCode = ?
    AND date BETWEEN DATE('now', '-7 days') AND DATE('now')
GROUP BY 
    date
ORDER BY 
    date ASC;
      `;
      db.all(sql, [compCode], (err, rows) => {
        if (err) {
          reject(err); // Reject if there's an error
        } else {
          resolve(rows); // Resolve with the login data
        }
      });
    });
  }
  
  async getDailyData(compCode) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
            Record.empID, 
            MIN(CASE WHEN Record.act = 'in' THEN Record.time END) AS earliest_time, 
            MAX(CASE WHEN Record.act = 'out' THEN Record.time END) AS latest_out_time,
            Employee.fname, 
            Employee.lname
        FROM 
            Record
        INNER JOIN 
            Employee ON Record.empID = Employee.id
        WHERE 
            Employee.compCode = ?
            AND Record.date = DATE('now') 
        GROUP BY 
            Record.empID, Employee.fname, Employee.lname
        ORDER BY 
            earliest_time DESC
      `;
  
      db.all(sql, [compCode], (err, rows) => {
        if (err) {
          reject(err); 
        } else {
          resolve(rows); 
        }
      });
    });
  }
  
  async getMapsActiveUsersToday(compCode) {
    return new Promise((resolve, reject) => {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
      const sql = `
        SELECT fname, lname, address, img, lat, long, time
        FROM Record
        INNER JOIN Employee e ON e.id = Record.empID
        WHERE e.compCode = ?
        AND Record.date = DATE('now')
        AND Record.act = 'in';
      `;
  
      db.all(sql, [compCode], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows); // Resolves the list of active users
        }
      });
    });
  }
  


  async storeResetToken(adminId, hashedToken, tokenExpiration) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Admin SET resetToken = ?, resetTokenExpiration = ? WHERE id = ?`;
      db.run(query, [hashedToken, tokenExpiration, adminId], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }

  async findByResetToken(resetToken) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Admin WHERE resetToken = ?`;
      db.get(query, [resetToken], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? new Admin(row) : null);
      });
    });
  }

  async updatePassword(adminId, newPassword) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Admin SET password = ? WHERE id = ?`;
      db.run(query, [newPassword, adminId], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }

  async clearResetToken(adminId) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE Admin SET resetToken = NULL, resetTokenExpiration = NULL WHERE id = ?`;
      db.run(query, [adminId], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }
}

// Export the singleton instance
module.exports = new AdminRepository();
