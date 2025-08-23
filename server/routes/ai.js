const express = require('express');
const AIChat = require('../models/AIChat');
const { auth } = require('../middleware/auth');
const { askAI } = require('../utils/aiService');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get user's chat sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await AIChat.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .select('sessionId title createdAt updatedAt messages');

    // Add message count to each session
    const sessionsWithCount = sessions.map(session => ({
      ...session.toObject(),
      messageCount: session.messages.length
    }));

    res.json(sessionsWithCount);
  } catch (error) {
    console.error('Get AI sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific chat session
router.get('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const session = await AIChat.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get AI session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to AI
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Find or create session
    let session;
    const currentSessionId = sessionId || uuidv4();

    if (sessionId) {
      session = await AIChat.findOne({ sessionId, user: req.user._id });
    }

    if (!session) {
      session = new AIChat({
        user: req.user._id,
        sessionId: currentSessionId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Get AI response
    const context = session.messages
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const aiResponse = await askAI(message, context);

    // Add AI response
    session.messages.push({
      role: 'assistant',
      content: aiResponse.response,
      timestamp: new Date()
    });

    await session.save();

    res.json({
      message: 'Response received',
      sessionId: currentSessionId,
      response: aiResponse.response,
      session: session
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', auth, async (req, res) => {
  try {
    const session = await AIChat.findOneAndDelete({
      sessionId: req.params.sessionId,
      user: req.user._id
    });

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete AI session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update session title
router.patch('/sessions/:sessionId/title', auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    const session = await AIChat.findOneAndUpdate(
      { sessionId: req.params.sessionId, user: req.user._id },
      { title },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({
      message: 'Session title updated',
      session
    });
  } catch (error) {
    console.error('Update session title error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;