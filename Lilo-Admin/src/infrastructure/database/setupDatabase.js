
const db = require('../database'); // SQLite database connection


const createAllTables = () => {
  const createCompanyTable = `
   CREATE TABLE IF NOT EXISTS Company (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      compCode TEXT NOT NULL UNIQUE,        
      compUser TEXT NOT NULL,
      compName TEXT NOT NULL,
      compEmail TEXT NOT NULL,
      compAddress TEXT NOT NULL,
      compCountEmp INTEGER NOT NULL,
      compNum INTEGER NOT NULL,  
      subType TEXT NOT NULL,  
      compExp INTEGER NOT NULL, 
      compVer TEXT NOT NULL,
      compFeat TEXT NOT NULL,  
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;


  const createLocationTable = `
    CREATE TABLE IF NOT EXISTS Location (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      long FLOAT NOT NULL,
      lat FLOAT NOT NULL,
      compCode TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME,
      FOREIGN KEY(compCode) REFERENCES Company(compCode)
    );
  `;
  
  const createEmployeeTable = `
    CREATE TABLE IF NOT EXISTS Employee (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compCode TEXT NOT NULL,
      empID TEXT NOT NULL,
      fname TEXT NOT NULL,
      mname TEXT,
      lname TEXT NOT NULL,
      dept TEXT NOT NULL,
      email TEXT,
      loc_assign INTEGER NOT NULL,
      empPic TEXT,
      regStat TEXT NOT NULL,
      empStat TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME,
      FOREIGN KEY(compCode) REFERENCES Company(compCode),
      FOREIGN KEY(loc_assign) REFERENCES Location(id),
      UNIQUE(empID, compCode)
    );
  `;

  const createAdminTable = `
    CREATE TABLE IF NOT EXISTS Admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      compCode TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      resetToken TEXT,
      resetTokenExpiration DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME,
      FOREIGN KEY(compCode) REFERENCES Company(compCode)
    );
  `;

  const createSuperAdminTable = `
    CREATE TABLE IF NOT EXISTS SuperAdmin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      resetToken TEXT,                        
      resetTokenExpiration DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME
    );
  `;
  
  const createRecordTable = `
    CREATE TABLE IF NOT EXISTS Record (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empID TEXT NOT NULL,
      time TEXT,
      date DATE,
      act TEXT CHECK(act IN ('in', 'out')),
      img TEXT,
      address TEXT,
      long FLOAT,
      lat FLOAT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(empID) REFERENCES Employee(empID)
    );
  `;

  const createNoticeTable = `
    CREATE TABLE IF NOT EXISTS Notice (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        compCodes TEXT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        image VARCHAR(255),
        file VARCHAR(255),
        STime DATETIME NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
    );
  `;

  db.serialize(() => {
    db.run(createCompanyTable);
    db.run(createLocationTable);
    db.run(createEmployeeTable);
    db.run(createAdminTable);
    db.run(createSuperAdminTable); 
    db.run(createRecordTable);
    db.run(createNoticeTable);
  });
};

const addTriggers = () => {
  const updateTrigger = `
    CREATE TRIGGER IF NOT EXISTS update_timestamp
    AFTER UPDATE ON <TABLE_NAME>
    BEGIN
      UPDATE <TABLE_NAME>
      SET updatedAt = CURRENT_TIMESTAMP
      WHERE rowid = NEW.rowid;
    END;
  `;


  db.serialize(() => {
    db.run(updateTrigger.replace(/<TABLE_NAME>/g, 'Company'));
    db.run(updateTrigger.replace(/<TABLE_NAME>/g, 'Location'));
    db.run(updateTrigger.replace(/<TABLE_NAME>/g, 'Employee'));
    db.run(updateTrigger.replace(/<TABLE_NAME>/g, 'Admin'));
    db.run(updateTrigger.replace(/<TABLE_NAME>/g, 'SuperAdmin'));
    db.run(updateTrigger.replace(/<TABLE_NAME>/g, 'Record'));
    db.run(updateTrigger.replace(/<TABLE_NAME>/g, 'Notice'));
  });

};

const initializeDatabase = () => {
  createAllTables(); 
  
};

module.exports = initializeDatabase;
