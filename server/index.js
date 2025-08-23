const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: '.env.local' });

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const schoolRoutes = require('./routes/schools');
const examRoutes = require('./routes/exams');
const assignmentRoutes = require('./routes/assignments');
const courseRoutes = require('./routes/courses');
const noteRoutes = require('./routes/notes');
const notificationRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');
const settingsRoutes = require('./routes/settings');
const messagingRoutes = require('./routes/messaging');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http://localhost:3000", "http://localhost:3001"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // <-- THIS
}));

app.use(cors({
  origin:  ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb+srv://webmastersmma:eANI0SwSST7zojY9@cluster0.1em9xrv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/payments', require('./routes/payment'));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});