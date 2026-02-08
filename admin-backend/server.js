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
const huiduRoutes = require('./routes/huidu');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/bonus', bonusRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/vip', vipRoutes);
app.use('/api/huidu', huiduRoutes);
app.use('/api/upload', require('./routes/upload'));

// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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

app.listen(PORT, () => {
  console.log(`Admin Backend running on port ${PORT}`);
});

module.exports = app;
