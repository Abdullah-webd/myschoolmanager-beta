const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true,
      auth: {
       user: process.env.EMAIL_USER || "webmastersmma@gmail.com",
      pass: process.env.EMAIL_PASS || "dzzlinhxmmunnyfx",
      }
    });
  }

  async sendCredentials(email, firstName, tempPassword) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@school.com',
      to: email,
      subject: 'Your School Portal Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to School Management Portal</h2>
          <p>Dear ${firstName},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          <p>You can access the portal at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></p>
          <p>If you have any questions, please contact the administration.</p>
          <p>Best regards,<br>School Administration</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordReset(email, firstName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@school.com',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Dear ${firstName},</p>
          <p>You have requested to reset your password. Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>School Administration</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendNotification(email, firstName, title, message) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@school.com',
      to: email,
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${title}</h2>
          <p>Dear ${firstName},</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message}
          </div>
          <p>Best regards,<br>School Administration</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendBulkMessage(email, subject, message) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@school.com',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>Best regards,<br>School Administration</p>
        </div>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();