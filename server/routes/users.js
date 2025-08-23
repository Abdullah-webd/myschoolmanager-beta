const express = require('express');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { generateSecurePassword } = require('../utils/passwordGenerator');
const { sendWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = { schoolId: req.user._id }; // 👈 only users under this admin


    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students in teacher's class
router.get('/my-students', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      assignedTeacher: req.user._id,
      isActive: true
    }).select('-password').sort({ firstName: 1 });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign student to teacher
router.post('/assign-student', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is already assigned to this teacher
    if (student.assignedTeacher && student.assignedTeacher.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Student is already in your class' });
    }

    student.assignedTeacher = req.user._id;
    student.class = req.user.classAssigned || 'Unassigned';
    await student.save();

    res.json({
      message: 'Student added to your class successfully',
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentId: student.studentId
      }
    });
  } catch (error) {
    console.error('Assign student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove student from teacher's class
router.post('/remove-student', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const { studentId } = req.body;
    
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is assigned to this teacher
    if (!student.assignedTeacher || student.assignedTeacher.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Student is not in your class' });
    }

    student.assignedTeacher = undefined;
    student.class = 'Unassigned';
    await student.save();

    res.json({
      message: 'Student removed from your class successfully'
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available students (not assigned to any teacher)
router.get('/available-students', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const students = await User.find({
      role: 'student',
      $or: [
        { assignedTeacher: { $exists: false } },
        { assignedTeacher: null }
      ],
      isActive: true
    }).select('-password').sort({ firstName: 1 });

    res.json(students);
  } catch (error) {
    console.error('Get available students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (Admin only)
// Create user (Admin only)
router.post('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      role,
      phone,
      whatsappNumber,
      subject,
      classAssigned,
      studentId,
      class: studentClass,
      rollNumber
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate secure password
    const password = generateSecurePassword();

    // Create user object
    const userData = {
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role,
      phone,
      whatsappNumber,
      isFirstLogin: true,
      schoolId: req.user._id // 👈 link to the admin/school who created this user
    };

    // Add role-specific fields
    if (role === 'teacher') {
      userData.subject = subject;
      userData.classAssigned = classAssigned;
    } else if (role === 'student') {
      userData.studentId = studentId;
      userData.class = studentClass;
      userData.rollNumber = rollNumber;
    }

    const user = new User(userData);
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName, password, role);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId, // 👈 return schoolId too
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update user (Admin only)
router.put('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    // Remove sensitive fields from update
    delete updateData.password;
    delete updateData.role; // Prevent role change through this endpoint

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user active status (Admin only)
router.patch('/:id/toggle-status', auth, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;