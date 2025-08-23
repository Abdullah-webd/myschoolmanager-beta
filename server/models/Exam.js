const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'written'],
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: String,
    required: function() { return this.type === 'multiple-choice'; }
  },
  points: {
    type: Number,
    default: 1
  }
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  class: {
    type: String,
    required: true,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  instructions: {
    type: String,
    default: 'Please read all questions carefully before answering.'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    enum: ['manual', 'ai'],
    default: 'manual'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total marks before saving
examSchema.pre('save', function(next) {
  this.totalMarks = this.questions.reduce((total, question) => total + question.points, 0);
  next();
});

module.exports = mongoose.model('Exam', examSchema);