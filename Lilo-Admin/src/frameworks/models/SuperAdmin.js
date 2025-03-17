// app/frameworks/models/Admin.js
class SuperAdmin {
    constructor(id, username, password, createdAt, updatedAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
      }
  }
  
  module.exports = SuperAdmin;
  