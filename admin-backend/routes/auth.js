const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  validate
], authController.login);

// Get Profile
router.get('/profile', authenticateAdmin, authController.getProfile);

// Change Password
router.post('/change-password', authenticateAdmin, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate
], authController.changePassword);

// Activity Logs
router.get('/activity-logs', authenticateAdmin, authController.getActivityLogs);

module.exports = router;
