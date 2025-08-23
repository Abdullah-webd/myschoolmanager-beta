const express = require('express');
const Settings = require('../models/Settings');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all settings (Admin only)
router.get('/', auth, requireRole(['admin']), async (req, res) => {
  try {
    const settings = await Settings.find().sort({ key: 1 });
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific setting
router.get('/:key', auth, async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update setting (Admin only)
router.put('/:key', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { value, description } = req.body;
    
    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      {
        value,
        description,
        updatedBy: req.user._id,
        updatedAt: Date.now()
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize default settings
router.post('/init', auth, requireRole(['admin']), async (req, res) => {
  try {
    const defaultSettings = [
      {
        key: 'exam_portal_enabled',
        value: true,
        description: 'Controls whether students can access the exam portal'
      },
      {
        key: 'notification_email_enabled',
        value: true,
        description: 'Enable email notifications'
      },
      {
        key: 'notification_whatsapp_enabled',
        value: false,
        description: 'Enable WhatsApp notifications'
      }
    ];

    for (const setting of defaultSettings) {
      await Settings.findOneAndUpdate(
        { key: setting.key },
        { ...setting, updatedBy: req.user._id },
        { upsert: true }
      );
    }

    res.json({ message: 'Default settings initialized' });
  } catch (error) {
    console.error('Initialize settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;