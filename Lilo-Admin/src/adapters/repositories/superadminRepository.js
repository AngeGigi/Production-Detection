const db = require('../../infrastructure/database'); 
const SuperAdminEntity = require('../../entities/SuperAdminEntity'); 
const SuperAdmin = require('../../entities/SuperAdminEntity')
class SuperAdminRepository {
  // find by username
  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM SuperAdmin WHERE username = ?`;
      
      db.get(query, [username], (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return reject(err);
        }
        if (row) {
          try {
            const superadmin = new SuperAdminEntity(row);
            resolve(superadmin); 
          } catch (error) {
            console.error('Entity creation error:', error.message);
            reject(error);  
          }
        } else {
          resolve(null);  
        }
      });
    });
    
  }
  async updateProfile(currentUsername, { username, password }) {
    console.log('Attempting to update profile:', { currentUsername, username, password });
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE SuperAdmin
        SET username = ?, password = ?
        WHERE username = ?;
      `;
      db.run(query, [username, password, currentUsername], function (err) {
        if (err) {
          console.error('Database update error:', err);
          return reject(err);
        }
        if (this.changes === 0) {
          console.warn('No rows updated. Possible reasons: incorrect username or no actual changes.');
          return resolve(false);
        }
        console.log('Profile updated successfully for:', currentUsername);
        resolve(true);
      });
    });
  }
  
  async storeResetToken(superadminId, hashedToken, tokenExpiration) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE SuperAdmin SET resetToken = ?, resetTokenExpiration = ? WHERE id = ?`;
      db.run(query, [hashedToken, tokenExpiration, superadminId], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }

  async findByResetToken(resetToken) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM SuperAdmin WHERE resetToken = ?`;
      db.get(query, [resetToken], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row ? new SuperAdmin(row) : null);
      });
    });
  }

  async updatePassword(superadminId, newPassword) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE SuperAdmin SET password = ? WHERE id = ?`;
      db.run(query, [newPassword, superadminId], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }

  async clearResetToken(superadminId) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE SuperAdmin SET resetToken = NULL, resetTokenExpiration = NULL WHERE id = ?`;
      db.run(query, [superadminId], function (err) {
        if (err) {
          return reject(err);
        }
        resolve(this.changes);
      });
    });
  }

  async findUsername(username) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM SuperAdmin WHERE username = ?`;
      db.get(query, [username], (err, row) => {
        console.log(query, username)
        if (err) {
          return reject(err);
        }
        if (row) {
          resolve(new SuperAdmin(row)); 
        } else {
          resolve(null); 
        }
      });
    });
  }
}

module.exports = new SuperAdminRepository();
