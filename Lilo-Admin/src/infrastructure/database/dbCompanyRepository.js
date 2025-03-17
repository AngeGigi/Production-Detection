const db = require("../database");
const CompanyEntity = require("../../entities/CompanyEntity");
const CompanyRepository = require("../../adapters/repositories/companyRepository");
const { DateTime } = require("luxon");
const moment = require('moment-timezone'); 
class dbCompanyRepository extends CompanyRepository {
    async fetchAllCompanies() {
        const query = `SELECT * FROM Company ORDER BY createdAt DESC`;
        return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) return reject(err);

                const companies = rows.map(
                    (row) =>
                        new CompanyEntity(
                            row.id,     //superadmin add this???
                            row.compCode,
                            row.compUser,
                            row.compName,
                            row.compEmail,
                            row.compAddress,
                            row.compCountEmp,
                            row.compNum,
                            row.subType,
                            row.compExp,
                            JSON.parse(row.compVer),
                            JSON.parse(row.compFeat),
                            row.createdAt,
                            row.updatedAt
                        )
                );
                resolve(companies);
            });
        });
    }

    async findByCompCode(compCode) {
        const query = `SELECT * FROM Company WHERE compCode = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [compCode], (err, row) => {
                if (err) return reject(err);

                resolve(
                    row
                        ? new CompanyEntity(
                              row.id,
                              row.compCode,
                              row.compUser,
                              row.compName,
                              row.compEmail,
                              row.compAddress,
                              row.compCountEmp,
                              row.compNum,
                              row.subType,
                              row.compExp,
                              JSON.parse(row.compVer),
                              JSON.parse(row.compFeat),
                              row.createdAt,
                              row.updatedAt
                          )
                        : null
                );
            });
        });
    }

    async save(companyEntity) {
        const {
            compUser,
            compName,
            compEmail,
            compAddress,
            compCountEmp,
            compNum,
            subType,
            compExp,
            compVer,
            compFeat,
            createdAt,
            updatedAt
        } = companyEntity;

        let compCode;
        do {
            compCode = Math.floor(1000 + Math.random() * 9000);
        } while (await this.isCompCodeExists(compCode));

        const now = DateTime.now().setZone("Asia/Manila");
        const formattedDate = now.toFormat("yyyy-MM-dd hh:mm a");

        const query = `
          INSERT INTO Company (compCode, compUser, compName, compEmail, compAddress, compCountEmp,
                              compNum, subType, compExp, compVer, compFeat, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const values = [
            compCode,
            compUser,
            compName,
            compEmail,
            compAddress,
            compCountEmp,
            compNum,
            subType,
            compExp,
            JSON.stringify(compVer),
            JSON.stringify(compFeat),
            formattedDate,
            formattedDate,
        ];

       
        return new Promise((resolve, reject) => {
            db.run(query, values, function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    async isCompCodeExists(compCode) {
        const query = `SELECT COUNT(*) AS count FROM Company WHERE compCode = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [compCode], (err, row) => {
                if (err) return reject(err);
                resolve(row.count > 0);
            });
        });
    }

    async update(compCode, updatedEntity) {
        const {
            compUser,
            compName,
            compEmail,
            compAddress,
            compCountEmp,
            compNum,
            subType,
            compExp,
            compVer,
            compFeat,
            updatedAt
        } = updatedEntity;
    
        const now = DateTime.now().setZone("Asia/Manila");
        const formattedDate = now.toFormat("yyyy-MM-dd hh:mm a");
       
        const query = `
          UPDATE Company
          SET compUser = ?, compName = ?, compEmail = ?, compAddress = ?, compCountEmp = ?, compNum = ?, 
              subType = ?, compExp = ?, compVer = ?, compFeat = ?, updatedAt = ?
          WHERE compCode = ?
        `;
    console.log(query)
        const values = [
            compUser,
            compName,
            compEmail,
            compAddress,
            compCountEmp,
            compNum,
            subType,
            compExp,
            JSON.stringify(compVer),
            JSON.stringify(compFeat),
            formattedDate,
            compCode,
        ];
    console.log("Values", values)
        return new Promise((resolve, reject) => {
            db.run(query, values, function (err) {
                if (err) return reject(err);
                resolve(this.changes); 
            });
        });
    }
    
    

    async delete(compCode) {
        const query = `DELETE FROM Company WHERE compCode = ?`;

        return new Promise((resolve, reject) => {
            db.run(query, [compCode], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    async getCountCompanies() {
        const query = `SELECT COUNT(*) AS count FROM Company;`;
        return new Promise((resolve, reject) => {
          db.get(query, [], (err, row) => {
            if (err) return reject(err);
            resolve(row.count); 
          });
        });
      }
      
      
        async getAllTrial() {
          const query = `SELECT COUNT(*) AS count FROM Company WHERE subType = 'Trial';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }
      
        async getAllPro() {
          const query = `SELECT COUNT(*) AS count FROM Company WHERE subType = 'Pro';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }
      
        async getAllPremium() {
          const query = `SELECT COUNT(*) AS count FROM Company WHERE subType = 'Premium';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }
      
        async getAllHome() {
          const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compVer)
            WHERE json_each.value = 'Home';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }
      
        async getAllOffice() {
            const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compVer)
            WHERE json_each.value = 'Office';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }

        async getAllFeat() {
            const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compVer)
            WHERE json_each.value = 'All';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }

        async getAllVer() {
            const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compVer)
            WHERE json_each.value = 'All';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }

        async getAllGPS() {
            const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compVer)
            WHERE json_each.value = 'GPS';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }

        async getAllExt() {
            const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compFeat)
            WHERE json_each.value = 'Extended user';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }

        async getAllApi() {
            const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compVer)
            WHERE json_each.value = 'API Log';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }
        
        async getAllLoc() {
            const query = `SELECT COUNT(*) AS count 
            FROM Company, json_each(Company.compVer)
            WHERE json_each.value = 'Location Tracking';`;
          return new Promise((resolve, reject) => {
            db.get(query, [], (err, row) => {
              if (err) return reject(err);
              resolve(row.count);
            });
          });
        }
      
        async getRecentlyAdded() {
          const query = `SELECT * FROM Company ORDER BY createdAt DESC LIMIT 5;`;
          return new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            });
          });
        }

        async getCompaniesNearExpiration() {
            const query = `
                SELECT 
                    compName, 
                    compCode, 
                    createdAt, 
                    compExp, 
                    subType
                FROM 
                    Company
            `;
    
            return new Promise((resolve, reject) => {
                db.all(query, [], (err, rows) => {
                    if (err) return reject(err);
    
                    const currentDate = moment().tz('Asia/Manila'); // Current date in Asia/Manila timezone
    
                    // Calculate expiration days
                    const companies = rows.map(row => {
                        const createdAt = moment(row.createdAt).tz('Asia/Manila'); // Parse createdAt
                        const expirationDate = createdAt.add(row.compExp, 'days'); // Add compExp to createdAt
                        const expirationDays = expirationDate.diff(currentDate, 'days'); // Difference in days
    
                        return {
                            compName: row.compName,
                            compCode: row.compCode,
                            expirationDays,
                            subType: row.subType,
                        };
                    });
    
                    // Filter valid expirations and sort by nearest expiration
                    const validCompanies = companies
                        .filter(company => company.expirationDays >= 0) // Only companies that haven't expired
                        .sort((a, b) => a.expirationDays - b.expirationDays) // Sort by ascending expirationDays
                        .slice(0, 5); // Limit to 5
    
                    resolve(validCompanies);
                });
            });
        }

        async getCompaniesByActivity() {
            const query = `
                SELECT 
                    compName, 
                    compCode, 
                    createdAt, 
                    updatedAt
                FROM 
                    Company
                WHERE 
                    DATE(createdAt) = DATE('now') -- Filter by today's date (createdAt)
                OR 
                    DATE(updatedAt) = DATE('now') -- Filter by today's date (updatedAt)
            `;
        
            return new Promise((resolve, reject) => {
                db.all(query, [], (err, rows) => {
                    if (err) return reject(err);
        
                    // Initialize counters for Register and Update activities
                    let registerCount = 0;
                    let updateCount = 0;
        
                    // Iterate over rows to determine activity type based on createdAt and updatedAt
                    rows.forEach(row => {
                        if (row.createdAt === row.updatedAt) {
                            registerCount++;
                        } else if (new Date(row.updatedAt) > new Date(row.createdAt)) {
                            updateCount++;
                        }
                    });
                    console.log("aaaaaaaaa", registerCount, updateCount)
                    resolve({
                        registerCount,
                        updateCount,
                    });
                });
            });
        }
        async ReportCompanies() {
          const query = `
              SELECT 
                  compName AS "Company Name",
                  compCode AS "Company Code",
                  CASE 
                      WHEN updatedAt > createdAt THEN TIME(updatedAt)
                      ELSE TIME(createdAt)
                  END AS "Time",
                  CASE 
                      WHEN updatedAt > createdAt THEN DATE(updatedAt)
                      ELSE DATE(createdAt)
                  END AS "Date",
                  CASE 
                      WHEN updatedAt > createdAt THEN 'Update'
                      ELSE 'Register'
                  END AS "Activity",
                  compExp,
                  createdAt,
                  subType
              FROM 
                  Company
              ORDER BY 
                  CASE 
                      WHEN updatedAt > createdAt THEN updatedAt
                      ELSE createdAt
                  END DESC;
          `;
      
          return new Promise((resolve, reject) => {
              db.all(query, [], (err, rows) => {
                  if (err) return reject(err);
      
                  const currentDate = moment().tz('Asia/Manila'); 
      
                  const companies = rows.map(row => {
                      const createdAt = moment(row.createdAt, "YYYY-MM-DD hh:mm A").tz('Asia/Manila'); 
                      const expirationDate = createdAt.add(row.compExp, 'days'); 
                      const expirationDays = expirationDate.diff(currentDate, 'days'); 
      
                      const subscriptionStatus = expirationDays < 0 
                          ? 'Expired'
                          : `${expirationDays} days ${row.subType}`; 
      
                      const time = moment(row["Time"], "HH:mm").format("hh:mm A");
      
                      return {
                          compName: row["Company Name"],
                          compCode: row["Company Code"],
                          time: time,
                          date: row["Date"],
                          activity: row["Activity"],
                          subscriptionStatus,
                      };
                  });
      
                  const sortedCompanies = companies.sort((a, b) => {
                      const expA = a.subscriptionStatus === 'Expired' ? Number.POSITIVE_INFINITY : a.subscriptionStatus.split(' ')[0];
                      const expB = b.subscriptionStatus === 'Expired' ? Number.POSITIVE_INFINITY : b.subscriptionStatus.split(' ')[0];
      
                      return expA - expB;
                  });
                  resolve(sortedCompanies);
              });
          });
      }
      
                             
}

module.exports = dbCompanyRepository;
