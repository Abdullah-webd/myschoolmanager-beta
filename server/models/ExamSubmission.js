const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
});

const examSubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  totalScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'graded'],
    default: 'in-progress'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  gradedAt: Date,
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  autoSaved: {
    type: Boolean,
    default: false
  }
});

// Calculate scores before saving
examSubmissionSchema.pre('save', function(next) {
  if (this.status === 'graded') {
    this.totalScore = this.answers.reduce((total, answer) => total + (answer.pointsEarned || 0), 0);
  }
  next();
});

module.exports = mongoose.model('ExamSubmission', examSubmissionSchema);