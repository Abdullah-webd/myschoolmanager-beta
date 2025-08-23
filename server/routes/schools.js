const express = require('express');
const School = require('../models/School');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// School signup
router.post('/signup', async (req, res) => {
  try {
    const {
      schoolName,
      adminName,
      email,
      phone,
      address,
      password,
      confirmPassword
    } = req.body;

    // Validate input
    if (!schoolName || !adminName || !email || !phone || !address || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const existingSchool = await School.findOne({ email: email.toLowerCase() });
    if (existingSchool) {
      return res.status(400).json({ message: 'School with this email already exists' });
    }

    // Split admin name into first/last
    const [firstName, ...lastNameParts] = adminName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Step 1: Create admin WITHOUT schoolId first
    const admin = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: 'admin',
      phone,
      isFirstLogin: false
    });

    await admin.save();

    // Step 2: Create school with admin reference
    const school = new School({
      name: schoolName,
      address,
      phone,
      email: email.toLowerCase(),
      admin: admin._id
    });

    await school.save();

    // Step 3: Update admin with schoolId
    admin.schoolId = school._id;
    await admin.save();

    // Generate token
    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      process.env.JWT_SECRET || 'defaultSecretKey',
      { expiresIn: '24h' }
    );

    // Send welcome email
    await sendWelcomeEmail(admin.email, admin.firstName, null, 'admin', true);

    res.status(201).json({
      message: 'School registered successfully',
      token,
      user: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isFirstLogin: admin.isFirstLogin,
        school: {
          id: school._id,
          name: school.name
        }
      }
    });
  } catch (error) {
    console.error('School signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;