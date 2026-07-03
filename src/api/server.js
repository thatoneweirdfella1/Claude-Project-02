// Express API Server
// Wraps all backend services, handles routing, middleware

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('../database/init');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));
app.use(cors());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests'
});

const createQuestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 questions per hour
  message: 'Too many questions created'
});

const dialogueLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 dialogue turns per hour
  message: 'Too many dialogue turns'
});

app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === DIALOGUE ENDPOINTS ===

const dialogueRoutes = require('./routes/dialogues');
const accountRoutes = require('./routes/accounts');
const feedbackRoutes = require('./routes/feedback');
const historyRoutes = require('./routes/history');
const settingsRoutes = require('./routes/settings');

app.use('/api/v1/dialogues', dialogueLimiter, dialogueRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  res.status(err.status || 500).json({
    error: err.code || 'SERVER_ERROR',
    message: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Initialize and start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize database
    await db.initializeDatabase();

    // Initialize default accounts
    const accountManager = require('../services/account-manager');
    await accountManager.initializeDefaultAccounts();

    // Start listening
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API base: http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await db.close();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = app;
