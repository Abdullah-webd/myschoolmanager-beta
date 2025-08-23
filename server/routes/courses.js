const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/courses';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|mp4|avi|mov|wmv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, documents, and videos are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter
});

// Get courses
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'teacher') {
      query.teacher = req.user._id;
    } else if (req.user.role === 'student') {
      query.class = req.user.class;
      query.isActive = true;
    }

    const courses = await Course.find(query)
      .populate('teacher', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific course
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'firstName lastName');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && (!req.user.assignedTeacher || course.teacher._id.toString() !== req.user.assignedTeacher.toString() || !course.isActive)) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (req.user.role === 'teacher' && course.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create course (Teachers only)
router.post('/', auth, requireRole(['teacher']), upload.array('files', 10), async (req, res) => {
  try {
    const { title, description, subject, class: courseClass, youtubeLinks } = req.body;

    const course = new Course({
      title,
      description,
      subject,
      class: courseClass,
      teacher: req.user._id,
      materials: []
    });

    // Process uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        let type = 'document';
        if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype === 'application/pdf') type = 'pdf';

        course.materials.push({
          type,
          title: file.originalname,
          filename: file.filename,
          url: `/uploads/courses/${file.filename}`,
          size: file.size
        });
      });
    }

    // Process YouTube links
    if (youtubeLinks) {
      const links = Array.isArray(youtubeLinks) ? youtubeLinks : [youtubeLinks];
      links.forEach((link, index) => {
        if (link.trim()) {
          const youtubeId = extractYouTubeId(link.trim());
          if (youtubeId) {
            course.materials.push({
              type: 'youtube',
              title: `YouTube Video ${index + 1}`,
              url: link.trim(),
              youtubeId
            });
          }
        }
      });
    }

    await course.save();
    await course.populate('teacher', 'firstName lastName');

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update course
router.put('/:id', auth, requireRole(['teacher']), upload.array('files', 10), async (req, res) => {
  try {
    const { title, description, subject, class: courseClass, youtubeLinks, removeMaterials } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update basic info
    course.title = title;
    course.description = description;
    course.subject = subject;
    course.class = courseClass;

    // Remove materials if specified
    if (removeMaterials) {
      const toRemove = Array.isArray(removeMaterials) ? removeMaterials : [removeMaterials];
      toRemove.forEach(materialId => {
        const materialIndex = course.materials.findIndex(m => m._id.toString() === materialId);
        if (materialIndex > -1) {
          const material = course.materials[materialIndex];
          // Delete file from filesystem
          if (material.filename) {
            const filePath = path.join('uploads/courses', material.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
          course.materials.splice(materialIndex, 1);
        }
      });
    }

    // Add new files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        let type = 'document';
        if (file.mimetype.startsWith('image/')) type = 'image';
        else if (file.mimetype.startsWith('video/')) type = 'video';
        else if (file.mimetype === 'application/pdf') type = 'pdf';

        course.materials.push({
          type,
          title: file.originalname,
          filename: file.filename,
          url: `/uploads/courses/${file.filename}`,
          size: file.size
        });
      });
    }

    // Add new YouTube links
    if (youtubeLinks) {
      const links = Array.isArray(youtubeLinks) ? youtubeLinks : [youtubeLinks];
      links.forEach((link, index) => {
        if (link.trim()) {
          const youtubeId = extractYouTubeId(link.trim());
          if (youtubeId) {
            course.materials.push({
              type: 'youtube',
              title: `YouTube Video ${course.materials.length + 1}`,
              url: link.trim(),
              youtubeId
            });
          }
        }
      });
    }

    await course.save();
    await course.populate('teacher', 'firstName lastName');

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete course
router.delete('/:id', auth, requireRole(['teacher']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete associated files
    course.materials.forEach(material => {
      if (material.filename) {
        const filePath = path.join('uploads/courses', material.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve uploaded files
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/courses', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

module.exports = router;