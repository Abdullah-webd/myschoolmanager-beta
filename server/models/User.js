const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  schoolId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
},

  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student'],
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  whatsappNumber: {
    type: String,
    trim: true
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Teacher specific fields
  subject: {
    type: String,
    trim: true
  },
  classAssigned: {
    type: String,
    trim: true
  },
  // Student specific fields
  studentId: {
    type: String,
    trim: true
  },
  class: {
    type: String,
    trim: true
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rollNumber: {
    type: String,
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
    subscription: {
    planType: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: null
    },
    startDate: {
      type: Date,
      default: null
    },
    expiryDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    },
    flutterwaveReference: String,
    lastPaymentDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});




// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);