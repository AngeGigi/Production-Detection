class SuperAdminEntity {
  constructor({ id, username, password, email, resetToken, resetTokenExpiration, createdAt, updatedAt }) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.email = email;
    this.resetToken = resetToken;
    this.resetTokenExpiration = resetTokenExpiration;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  validateCredentials() {
    if (!this.username || !this.password) {
      throw new Error('All fields are required.');
    }

    if (this.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (!/^[a-zA-Z0-9]+$/.test(this.username)) {
      throw new Error('Username can only contain alphanumeric characters.');
    }
  }

  setResetToken(token, expiration) {
    this.resetToken = token;
    this.resetTokenExpiration = expiration;
  }

  clearResetToken() {
    this.resetToken = null;
    this.resetTokenExpiration = null;
  }
  }
  
  module.exports = SuperAdminEntity;
  