const express = require('express');
const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const Settings = require('../models/Settings');
const { auth, requireRole } = require('../middleware/auth');
const { generateQuestions } = require('../utils/aiService');
const { console } = require('inspector');

const router = express.Router();

// Get all exams (Admin) or teacher's exams (Teacher) or student's exams (Student)
// Get all exams (Admin) or teacher's exams (Teacher) or student's exams (Student)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      // Check if exam portal is enabled
      const portalSetting = await Settings.findOne({ key: 'exam_portal_enabled' });
      if (!portalSetting || !portalSetting.value) {
        console.log('Exam portal is disabled');
        return res.status(403).json({ message: 'Exam portal is currently closed' });
      }
      
      query.class = req.user.class;
      query.isActive = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    let exams = await Exam.find(query)
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });

    // For students, filter out exams that have graded submissions by the user
    if (req.user.role === 'student') {
      // Get all exam IDs
      const examIds = exams.map(exam => exam._id);

      // Find submissions by this user for these exams with status 'graded'
      const gradedSubs = await ExamSubmission.find({
        exam: { $in: examIds },
        student: req.user._id,
        status: 'graded'
      }).select('exam');

      // Create a Set of exam IDs that are graded for this student
      const gradedExamIds = new Set(gradedSubs.map(sub => sub.exam.toString()));

      // Filter out exams where the user has a graded submission
      exams = exams.filter(exam => !gradedExamIds.has(exam._id.toString()));
    }

    res.json(exams);
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get specific exam
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('teacher', 'firstName lastName');
      console.log('step 1')

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check permissions
    if (req.user.role === 'student') {
      if (exam.class !== req.user.class || !exam.isActive) {
        console.log('Access denied for exam:', exam.class, req.user.class, exam.isActive);
        return res.status(403).json({ message: 'Access denied' });
        
      }
      
      // Check if exam portal is enabled
      const portalSetting = await Settings.findOne({ key: 'exam_portal_enabled' });
      if (!portalSetting || !portalSetting.value) {
        return res.status(403).json({ message: 'Exam portal is currently closed' });
      }

      // Check if exam is within time range
      const now = new Date();
      if (now < exam.startDate || now > exam.endDate) {
        return res.status(403).json({ message: 'Exam is not available at this time' });
      }

      // Check if student has already submitted
      const submission = await ExamSubmission.findOne({
        exam: exam._id,
        student: req.user._id,
        status: 'submitted'
      });

      if (submission) {
        return res.status(403).json({ message: 'You have already submitted this exam' });
      }
    } else if (req.user.role === 'teacher' && exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(exam);
  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create exam (Teachers only)
router.post('/', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      class: examClass,
      questions,
      duration,
      instructions,
      startDate,
      endDate,
      createdBy = 'manual'
    } = req.body;

    const exam = new Exam({
      title,
      description,
      subject,
      class: examClass,
      teacher: req.user._id,
      questions,
      duration,
      instructions,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy
    });

    await exam.save();
    await exam.populate('teacher', 'firstName lastName');

    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate AI questions for exam (Teachers only)
router.post('/generate-questions', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const { subject, topic, difficulty = 'medium', numQuestions = 5 } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ message: 'Subject and topic are required' });
    }

    const result = await generateQuestions(subject, topic, difficulty, numQuestions);

    if (!result.success) {
      return res.status(500).json({ message: 'Failed to generate questions' });
    }

    res.json({
      message: result.isFallback ? 'Generated fallback questions' : 'Questions generated successfully',
      questions: result.questions,
      isFallback: result.isFallback || false
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit exam (Students only)
router.post('/:id/submit', auth, requireRole(['student']), async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    console.log('Submitting exam with answers:', answers, 'and timeSpent:', timeSpent);
    const examId = req.params.id;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if student can access this exam
    
    if (exam.class !== req.user.class || !exam.isActive) {
      console.log('Access denied for exam:', exam.class, req.user.class, exam.isActive);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already submitted
    const existingSubmission = await ExamSubmission.findOne({
      exam: examId,
      student: req.user._id,
      status: 'submitted'
    });

    if (existingSubmission) {
      return res.status(400).json({ isSubmitted: true,message: 'Exam already submitted' });
    }

    // Auto-grade multiple choice questions
    const gradedAnswers = answers.map(answer => {
  const question = exam.questions.id(answer.questionId);
  if (question && question.type === "multiple-choice") {
    // convert index -> actual option
    const chosenAnswer = question.options[answer.answer]; 
    const isCorrect = String(chosenAnswer) === String(question.correctAnswer);

    return {
      ...answer,
      chosenAnswer, // keep for clarity
      isCorrect,
      pointsEarned: isCorrect ? question.points : 0,
    };
  }
  return answer;
});


    // Create or update submission
    const submission = await ExamSubmission.findOneAndUpdate(
      { exam: examId, student: req.user._id },
      {
        answers: gradedAnswers,
        status: 'submitted',
        submittedAt: new Date(),
        timeSpent
      },
      { upsert: true, new: true }
    );

    // Calculate score for auto-graded questions
    const autoGradedScore = gradedAnswers
      .filter(answer => answer.pointsEarned !== undefined)
      .reduce((total, answer) => total + answer.pointsEarned, 0);

    submission.totalScore = autoGradedScore;
    submission.percentage = (autoGradedScore / exam.totalMarks) * 100;
    
    // Mark as graded if all questions are multiple choice
    const hasWrittenQuestions = exam.questions.some(q => q.type === 'written');
    if (!hasWrittenQuestions) {
      submission.status = 'graded';
      submission.gradedAt = new Date();
    }

    await submission.save();

    res.json({
      message: 'Exam submitted successfully',
      submission: {
        id: submission._id,
        totalScore: submission.totalScore,
        percentage: submission.percentage,
        status: submission.status
      }
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get exam submissions (Teachers and Admins)
router.get('/:id/submissions', auth, requireRole(['teacher', 'admin','student']), async (req, res) => {
  try {
    const examId = req.params.id;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if teacher owns this exam
    if (req.user.role === 'teacher' && exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await ExamSubmission.find({ exam: examId })
      .populate('student', 'firstName lastName studentId')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auto-save exam progress (Students only)
router.put('/:id/auto-save', auth, requireRole(['student']), async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;
    const examId = req.params.id;

    const exam = await Exam.findById(examId);
    if (!exam || !req.user.assignedTeacher || exam.teacher.toString() !== req.user.assignedTeacher.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await ExamSubmission.findOneAndUpdate(
      { exam: examId, student: req.user._id },
      {
        answers,
        timeSpent,
        autoSaved: true,
        status: 'in-progress'
      },
      { upsert: true }
    );

    res.json({ message: 'Progress saved' });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update exam by ID (Teachers only)
router.put('/:id', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const examId = req.params.id;
    const updates = req.body;

    // Find the exam first
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check ownership
    if (exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Allowed fields to update (you can customize this list)
    const allowedUpdates = [
      'title',
      'description',
      'subject',
      'class',
      'questions',
      'duration',
      'instructions',
      'startDate',
      'endDate',
      'isActive'
    ];

    // Filter updates to allowed fields only
    for (const key of Object.keys(updates)) {
      if (allowedUpdates.includes(key)) {
        exam[key] = updates[key];
      }
    }

    // If dates are provided, convert to Date object
    if (updates.startDate) {
      exam.startDate = new Date(updates.startDate);
      console.log('Updated startDate:', exam.startDate);
    }
    if (updates.endDate) {
      exam.endDate = new Date(updates.endDate);
      console.log('Updated endDate:', exam.endDate);
    }

    await exam.save();

    await exam.populate('teacher', 'firstName lastName');

    res.json({
      message: 'Exam updated successfully',
      exam
    });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete exam (Teachers only, must be creator — or admin)
router.delete('/:id', auth, requireRole(['teacher', 'admin']), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // If teacher, make sure they own it
    if (req.user.role === 'teacher' && exam.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete related submissions first
    await ExamSubmission.deleteMany({ exam: exam._id });

    // Delete the exam itself
    await exam.deleteOne();

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;