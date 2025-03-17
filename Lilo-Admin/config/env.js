require('dotenv').config(); // Load variables from .env into process.env

module.exports = {
  SESSION_SECRET: process.env.SESSION_SECRET || '12345678',
  JWT_SECRET_ADMIN: process.env.JWT_SECRET_ADMIN || 'admin-secret-key',
  JWT_SECRET_SUPERADMIN: process.env.JWT_SECRET_SUPERADMIN || 'superadmin-secret-key',
  DATABASE_URL: process.env.DATABASE_URL || './src/infrastructure/database.sqlite',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
