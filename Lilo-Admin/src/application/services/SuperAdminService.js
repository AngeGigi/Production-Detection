const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../../../config/env'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const SuperAdminRepository = require('../../adapters/repositories/superadminRepository'); 

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.SMTP_USER,  
    pass: process.env.SMTP_PASS,  
  },
});

class SuperAdminService {
  constructor(SuperAdminRepository) {
    this.SuperAdminRepository = SuperAdminRepository; 
  }
  async getProfile(currentUsername) {
    if (!currentUsername) {
        throw new Error('Username is required to fetch the profile.');
    }

    console.log('Fetching profile for:', currentUsername);

    const superadmin = await SuperAdminRepository.findByUsername(currentUsername);
    if (!superadmin) {
        console.error('Superadmin not found for username:', currentUsername);
        throw new Error('Superadmin not found.');
    }

    return { username: superadmin.username };
}


  async updateProfile(currentUsername, { username, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await SuperAdminRepository.updateProfile(currentUsername, {
      username,
      password: hashedPassword,
    });
  
    if (!updated) {
      throw new Error('No changes made or user not found.');
    }
  }
  

  async validatePassword(superadmin, password) {
    return bcrypt.compare(password, superadmin.password);
  }

  async generateToken(superadmin) {
    if (!process.env.JWT_SECRET_SUPERADMIN) {
      throw new Error("JWT_SECRET_SUPERADMIN is not defined in the environment.");
    }

    const supertoken = jwt.sign(
      { username: superadmin.username, role: 'superadmin' }, 
      process.env.JWT_SECRET_SUPERADMIN, 
      { expiresIn: '1h' }
    );
    return supertoken;
  }

  async login(username, password) {
    try {
      const superadmin = await SuperAdminRepository.findByUsername(username);
      if (!superadmin) {
        throw new Error('User not found'); 
      }

      const isPasswordValid = await this.validatePassword(superadmin, password);
      if (!isPasswordValid) {
        throw new Error('Invalid passwird'); 
      }

      const supertoken = await this.generateToken(superadmin);

      const decoded = jwt.decode(supertoken);
      if (!decoded || !decoded.exp) {
        throw new Error('Token expiration decoding failed');
      }

      const expirationTime = new Date(decoded.exp * 1000).toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

      return { supertoken, superadmin, expirationTime };
    } catch (error) {
      console.error('Error during login:', error);
      throw error; 
    }
  }

  
  async forgotPassword(username, email) {
    console.log(username, email)
    const superadmin = await this.SuperAdminRepository.findUsername(username);
    
    if (!superadmin || superadmin.email !== email) {
      throw new Error('Super Admin not found or email does not match.');
    }
   const resetToken = crypto.randomBytes(32).toString('hex');
  
    const expirationTime = new Date(Date.now() + 3600000); 
    const resetURL = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/superadmin/reset-password?token=${resetToken}` : `http://localhost/reset-password?token=${resetToken}`;
  
    const mailOptions = {
      to: superadmin.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Use the following link to reset your password: ${resetURL}. This link is valid for 1 hour.`,
    };
  
    await transporter.sendMail(mailOptions);
  
    await this.SuperAdminRepository.storeResetToken(superadmin.id, resetToken, expirationTime);
  
    return { message: 'EMAIL SENT' };
  }

  async resetPassword(resetToken, newPassword) {
    const superadmin = await this.SuperAdminRepository.findByResetToken(resetToken);

    if (!superadmin || new Date(superadmin.resetTokenExpiration) < new Date()) {
      throw new Error('Invalid or expired reset token.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.SuperAdminRepository.updatePassword(superadmin.id, hashedPassword);

    await this.SuperAdminRepository.clearResetToken(superadmin.id);

    return { message: 'Password reset successfully.' };
  }
}

module.exports = new SuperAdminService(SuperAdminRepository);
