const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin, requireRole, logAction } = require('../middleware/auth');
const playersController = require('../controllers/playersController');

const router = express.Router();

// All routes require authentication
router.use(authenticateAdmin);

// Get all players
router.get('/', playersController.getPlayers);

// Get player tags
router.get('/tags', playersController.getTags);

// Create tag
router.post('/tags', requireRole('super_admin', 'manager'), [
  body('name').notEmpty().withMessage('Tag name required'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
  validate
], playersController.createTag);

// Get single player
router.get('/:playerId', playersController.getPlayer);

// Update player
router.put('/:playerId', requireRole('super_admin', 'manager'), logAction('update_player', 'player'), playersController.updatePlayer);

// Update player status (block/unblock)
router.patch('/:playerId/status', requireRole('super_admin', 'manager'), logAction('update_player_status', 'player'), [
  body('status').isIn(['active', 'blocked', 'suspended']).withMessage('Invalid status'),
  validate
], playersController.updatePlayerStatus);

// Adjust balance
router.post('/:playerId/balance', requireRole('super_admin', 'manager'), logAction('adjust_balance', 'player'), [
  body('amount').isFloat().withMessage('Amount must be a number'),
  body('type').isIn(['real', 'bonus']).withMessage('Invalid balance type'),
  body('reason').notEmpty().withMessage('Reason required'),
  validate
], playersController.adjustBalance);

// Add note
router.post('/:playerId/notes', logAction('add_note', 'player'), [
  body('note').notEmpty().withMessage('Note required'),
  validate
], playersController.addNote);

// Assign tag
router.post('/:playerId/tags', logAction('assign_tag', 'player'), [
  body('tagId').isInt().withMessage('Valid tag ID required'),
  validate
], playersController.assignTag);

// Remove tag
router.delete('/:playerId/tags/:tagId', logAction('remove_tag', 'player'), playersController.removeTag);

// Get player transactions
router.get('/:playerId/transactions', playersController.getPlayerTransactions);

// Process withdrawal
router.post('/transactions/:transactionId/process', requireRole('super_admin', 'manager'), logAction('process_withdrawal', 'transaction'), [
  body('action').isIn(['approve', 'reject']).withMessage('Invalid action'),
  validate
], playersController.processWithdrawal);

module.exports = router;
