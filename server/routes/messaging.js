const express = require('express');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// Send bulk emails (Admin only)
router.post('/bulk-email', auth, async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;

    if (!subject || !message || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Subject, message, and recipients are required' });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Send emails to all recipients
    for (const email of recipients) {
      try {
        await emailService.sendBulkMessage(email, subject, message);
        results.successful.push(email);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        results.failed.push({ email, error: error.message });
      }
    }

    res.json({
      message: `Bulk email completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send bulk WhatsApp messages (Admin only)
router.post('/bulk-whatsapp', auth, async (req, res) => {
  try {
    const { message, recipients } = req.body;

    if (!message || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Message and recipients are required' });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Send WhatsApp messages to all recipients
    for (const phone of recipients) {
      try {
        const result = await whatsappService.sendBulkMessage(phone, message);
        if (result) {
          results.successful.push(phone);
        } else {
          results.failed.push({ phone, error: 'Failed to send message' });
        }
      } catch (error) {
        console.error(`Failed to send WhatsApp to ${phone}:`, error);
        results.failed.push({ phone, error: error.message });
      }
    }

    res.json({
      message: `Bulk WhatsApp completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Bulk WhatsApp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;