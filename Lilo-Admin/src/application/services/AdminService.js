const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require("moment");
const AdminRepository = require('../../adapters/repositories/adminRepository');
const AdminEntity = require('../../entities/AdminEntity');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.SMTP_USER,  // Your Gmail address (e.g., 'youremail@gmail.com')
    pass: process.env.SMTP_PASS,  // Your Gmail password or App password (use App Password for 2FA)
  },
});


class AdminService {
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  async validatePassword(admin, password) {
    return bcrypt.compare(password, admin.password);
  }

  async generateToken(admin) {
    const token = jwt.sign(
      { username: admin.username, compCode: admin.compCode, role: 'admin' },
      process.env.JWT_SECRET_ADMIN,
      { expiresIn: '1h' }
    );
    return token;
  }

  async login(username, password) {
    const admin = await AdminRepository.findByUsername(username);
    if (!admin) {
      throw new Error('Username Not Found');
    }

    const isPasswordValid = await this.validatePassword(admin, password);
    if (!isPasswordValid) {
      throw new Error('Incorrect Password');
    }
    const token = await this.generateToken(admin);

    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      throw new Error('Token expiration decoding failed');
    }

    const expirationTime = new Date(decoded.exp * 1000).toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

    return { token, admin, expirationTime };
  }

  async register(adminEntity) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB');
    const formattedTime = currentDate.toLocaleTimeString('en-GB', { hour12: false });

    const formattedDateTime = `${formattedDate} ${formattedTime}`;
    
    adminEntity.createdAt = formattedDateTime;
    adminEntity.updatedAt = formattedDateTime;

    await AdminRepository.findByUsername(adminEntity.username);

    const hashedPassword = await bcrypt.hash(adminEntity.password, 10);
    adminEntity.password = hashedPassword;

    await AdminRepository.save(adminEntity);
  }

  async getAnalyticsData(compCode) {
    try {
      const currentDate = moment().format('dddd, MMMM D, YYYY');
      const currentTime = moment().format('h:mm:ss A');
  
      const totalEmployees = await AdminRepository.count(compCode);
  
      const today = new Date().toISOString().split('T')[0];
      const totalActiveEmployees = await AdminRepository.countStatus(compCode, 'Active');  
      const totalInactiveEmployees = await AdminRepository.countStatus(compCode, 'Inactive');  
      const totalPendingEmployees = await AdminRepository.countStatus(compCode, 'Pending');  
      const totalDailyUsage = await AdminRepository.countByStatus(compCode, today, '');  
      const totalLoggedIn = await AdminRepository.countByStatus(compCode, today, 'in');  
      const totalLoggedOut = await AdminRepository.countByStatus(compCode, today, 'out');  
      const recentUsers = await AdminRepository.getRecentUsers(compCode);
      const loginData = await AdminRepository.getLoginData(compCode);
      const dailyData = await AdminRepository.getDailyData(compCode);

      return {  
        currentDate,
        currentTime,
        totalEmployees,
        totalActiveEmployees,
        totalInactiveEmployees,
        totalPendingEmployees,
        totalDailyUsage,
        totalLoggedIn,
        totalLoggedOut,
        recentUsers,
        loginData,
        dailyData,
      };
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      throw error;
    }
  }
  
  async getMapsActiveUsersToday(compCode) {
    try {
      const activeUsers = await AdminRepository.getMapsActiveUsersToday(compCode);
        return activeUsers; 
    } catch (error) {
      console.error('Error fetching active users for today:', error);
      throw error;
    }
  }  

  async forgotPassword(username, email) {
    const admin = await this.adminRepository.findByUsername(username);
    
    if (!admin || admin.email !== email) {
      throw new Error('Admin not found or email does not match.');
    }
   const resetToken = crypto.randomBytes(32).toString('hex');
  
    const expirationTime = new Date(Date.now() + 3600000); // 1 hour from now
    const resetURL = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/reset-password?token=${resetToken}` : `http://localhost/reset-password?token=${resetToken}`;
  
    // Prepare email options
    const mailOptions = {
      to: admin.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Use the following link to reset your password: ${resetURL}. This link is valid for 1 hour.`,
    };
  
    // Send email
    await transporter.sendMail(mailOptions);
  
    // Store the reset token and its expiration time in the database
    await this.adminRepository.storeResetToken(admin.id, resetToken, expirationTime);
  
    return { message: 'EMAIL SENT' };
  }
  

  async resetPassword(resetToken, newPassword) {
    const admin = await this.adminRepository.findByResetToken(resetToken);

    if (!admin || new Date(admin.resetTokenExpiration) < new Date()) {
      throw new Error('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.adminRepository.updatePassword(admin.id, hashedPassword);

    await this.adminRepository.clearResetToken(admin.id);

    return { message: 'Password reset successfully.' };
  }
}

// Export the singleton instance
module.exports = new AdminService(AdminRepository);
