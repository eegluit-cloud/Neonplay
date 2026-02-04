require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const playersRoutes = require('./routes/players');
const kycRoutes = require('./routes/kyc');
const gamesRoutes = require('./routes/games');
const bonusRoutes = require('./routes/bonus');
const reportsRoutes = require('./routes/reports');
const adminsRoutes = require('./routes/admins');
const vipRoutes = require('./routes/vip');

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // Allow all origins in development
    const allowedOrigins = [
      'http://localhost:8003',
      'http://127.0.0.1:8003',
      'http://13.228.114.152:8003',
      process.env.ADMIN_FRONTEND_URL
    ].filter(Boolean);

    // Allow all origins for now (can be restricted later)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'player-backend', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/vip', vipRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-backend' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 8002;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Admin Backend running on ${HOST}:${PORT}`);
});

module.exports = app;
