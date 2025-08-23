const express = require('express');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const { auth, requireRole } = require('../middleware/auth');
const createMulterUpload = require('../middleware/multerConfig');
const upload = createMulterUpload('uploads/assignments');
const assignmentUpload = createMulterUpload('uploads/teacher');

const router = express.Router();

// Get assignments
// Get assignments
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      query.class = req.user.class;
      query.isActive = true;
    }

    // 1. Fetch assignments
    let assignments = await Assignment.find(query)
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (req.user.role === 'student') {
      // 2. Get all assignment IDs
      const assignmentIds = assignments.map(a => a._id);

      // 3. Fetch submissions by this student for these assignments
      const submissions = await AssignmentSubmission.find({
        assignment: { $in: assignmentIds },
        student: req.user._id
      }).select('assignment score feedback status');

      // 4. Create a map of assignmentId => submission
      const submissionMap = {};
      submissions.forEach(sub => {
        submissionMap[sub.assignment.toString()] = sub;
      });

      // 5. Attach submission info to each assignment
      assignments = assignments.map(a => {
        const sub = submissionMap[a._id.toString()];
        return {
          ...a.toObject(),
          submission: sub
            ? {
                score: sub.score,
                feedback: sub.feedback,
                status: sub.status
              }
            : null
        };
      });
    }
    console.log('Assignments fetched:', assignments);
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get specific assignment
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacher', 'firstName lastName');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && (assignment.class !== req.user.class || !assignment.isActive)) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assignment (Teachers only)
router.post('/', auth, requireRole(['teacher']),assignmentUpload.single('image'), async (req, res) => {
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
  try {
    const {
      title,
      description,
      subject,
      class: assignmentClass,
      dueDate,
      maxMarks,
      instructions
    } = req.body;

    const assignmentData = {
      title,
      description,
      subject,
      class: assignmentClass,
      teacher: req.user._id,
      dueDate: new Date(dueDate),
      maxMarks,
      instructions
    };

    if (req.file) {
      console.log('Image uploaded:', req.file);
      assignmentData.imageUrl = `/uploads/teacher/${req.file.filename}`;
    }

    const assignment = new Assignment(assignmentData);



    await assignment.save();
    await assignment.populate('teacher', 'firstName lastName');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assignment (Students only)
router.post('/:id/submit', auth, requireRole(['student']), upload.single('image'), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { content } = req.body;

    console.log('req.file:', req.file);


    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.class !== req.user.class || !assignment.isActive) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    const isLate = new Date() > assignment.dueDate;

    const submissionData = {
      assignment: assignmentId,
      student: req.user._id,
      content,
      isLate
    };

    // If image uploaded, save its path or URL
    if (req.file) {
      console.log('Image uploaded:', req.file);
      submissionData.imageUrl = `/uploads/assignments/${req.file.filename}`;
    }

    const submission = new AssignmentSubmission(submissionData);

    await submission.save();

    res.json({
      message: 'Assignment submitted successfully',
      submission: {
        id: submission._id,
        submittedAt: submission.submittedAt,
        isLate: submission.isLate,
        imageUrl: submission.imageUrl || null
      }
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get assignment submissions (Teachers and Admins)
router.get('/:id/submissions', auth, requireRole(['teacher', 'admin']), async (req, res) => {
  try {
    const assignmentId = req.params.id;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName studentId')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get assignment submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grade assignment submission (Teachers only)
router.put('/submissions/:id/grade', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submissionId = req.params.id;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate({
        path: 'assignment',
        populate: {
          path: 'teacher',
          select: '_id'
        }
      });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.assignment.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedAt = new Date();

    await submission.save();

    res.json({
      message: 'Assignment graded successfully',
      submission
    });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update assignment (Teachers only, must be creator)
router.put('/:id', auth, requireRole(['teacher']), assignmentUpload.single('image'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only the teacher who created it can update
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      title,
      description,
      subject,
      class: assignmentClass,
      dueDate,
      maxMarks,
      instructions,
      isActive
    } = req.body;

    // Update fields if provided
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (subject) assignment.subject = subject;
    if (assignmentClass) assignment.class = assignmentClass;
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (maxMarks) assignment.maxMarks = maxMarks;
    if (instructions) assignment.instructions = instructions;
    if (typeof isActive !== 'undefined') assignment.isActive = isActive;

    // Update image if uploaded
    if (req.file) {
      assignment.imageUrl = `/uploads/teacher/${req.file.filename}`;
    }

    await assignment.save();

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete assignment (Teachers only, must be creator)
router.delete('/:id', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Only the teacher who created it can delete
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete related submissions first (optional but clean)
    await AssignmentSubmission.deleteMany({ assignment: assignment._id });

    await assignment.deleteOne();

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;