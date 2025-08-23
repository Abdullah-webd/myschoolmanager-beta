const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
   host: "smtp.gmail.com",
  port: 587, // try 587 instead of 465
  secure: false, // false for 587// true for port 465
  auth: {
    user: process.env.EMAIL_USER || "webmastersmma@gmail.com",
    pass: process.env.EMAIL_PASS || "dzzlinhxmmunnyfx", // App password
  },
});


const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || "StudyMaster Team",
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (userEmail, firstName, password, role, isSchoolAdmin = false) => {
  const subject = 'Welcome to School Management System';
  
  if (isSchoolAdmin) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to School Management System</h2>
        <p>Dear ${firstName},</p>
        <p>Your school has been successfully registered with our School Management System!</p>
        <p>You can now access your admin dashboard to:</p>
        <ul>
          <li>Add teachers and students</li>
          <li>Manage exam portal settings</li>
          <li>View all exams and assignments</li>
          <li>Send notifications and messages</li>
        </ul>
        <p>Login at: <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}">${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}</a></p>
        <p>Best regards,<br>School Management Team</p>
      </div>
    `;
    return sendEmail(userEmail, subject, html);
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to School Management System</h2>
      <p>Dear ${firstName},</p>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Role:</strong> ${role}</p>
      </div>
      <p><strong>Important:</strong> You will be required to change your password on first login for security purposes.</p>
      <p>Login at: <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}">${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}</a></p>
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;
  
  return sendEmail(userEmail, subject, html);
};

const sendPasswordResetEmail = async (userEmail, firstName, resetToken) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Dear ${firstName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <div style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Best regards,<br>School Management Team</p>
    </div>
  `;
  
  return sendEmail(userEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};