// app/frameworks/models/Admin.js
class Admin {
    constructor(id, compCode, username, password, createdAt, updatedAt) {
        this.id = id;
        this.compCode = compCode;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
  }
  
  module.exports = Admin;
  