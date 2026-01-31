const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin, requireRole, logAction } = require('../middleware/auth');
const adminsController = require('../controllers/adminsController');

const router = express.Router();

router.use(authenticateAdmin);

// Get all admins
router.get('/', requireRole('super_admin'), adminsController.getAdmins);

// Get single admin
router.get('/:adminId', requireRole('super_admin'), adminsController.getAdmin);

// Create admin
router.post('/', requireRole('super_admin'), logAction('create_admin', 'admin'), [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['super_admin', 'manager', 'support']).withMessage('Invalid role'),
  validate
], adminsController.createAdmin);

// Update admin
router.put('/:adminId', logAction('update_admin', 'admin'), adminsController.updateAdmin);

// Update admin status
router.patch('/:adminId/status', requireRole('super_admin'), logAction('update_admin_status', 'admin'), [
  body('status').isIn(['active', 'disabled']).withMessage('Invalid status'),
  validate
], adminsController.updateAdminStatus);

// Reset admin password
router.post('/:adminId/reset-password', requireRole('super_admin'), logAction('reset_admin_password', 'admin'), [
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate
], adminsController.resetAdminPassword);

// Delete admin
router.delete('/:adminId', requireRole('super_admin'), logAction('delete_admin', 'admin'), adminsController.deleteAdmin);

module.exports = router;
