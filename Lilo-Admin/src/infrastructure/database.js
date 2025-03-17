const sqlite3 = require('sqlite3').verbose(); 
const env = require('../../config/env'); 

const db = new sqlite3.Database(env.DATABASE_URL, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.allAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

db.runAsync = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

db.getAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
      });
  });
};

module.exports = db;
