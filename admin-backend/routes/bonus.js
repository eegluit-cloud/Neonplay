const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin, requireRole, logAction } = require('../middleware/auth');
const bonusController = require('../controllers/bonusController');

const router = express.Router();

router.use(authenticateAdmin);

// Stats
router.get('/stats', bonusController.getBonusStats);

// Player bonuses
router.get('/player-bonuses', bonusController.getPlayerBonuses);

// Get all bonuses
router.get('/', bonusController.getBonuses);

// Get single bonus
router.get('/:bonusId', bonusController.getBonus);

// Create bonus
router.post('/', requireRole('super_admin', 'manager'), logAction('create_bonus', 'bonus'), [
  body('name').notEmpty().withMessage('Name required'),
  body('type').isIn(['joining', 'deposit', 'losing', 'reload', 'custom']).withMessage('Invalid type'),
  body('wageringReq').optional().isFloat({ min: 0 }).withMessage('Invalid wagering requirement'),
  validate
], bonusController.createBonus);

// Update bonus
router.put('/:bonusId', requireRole('super_admin', 'manager'), logAction('update_bonus', 'bonus'), bonusController.updateBonus);

// Delete bonus
router.delete('/:bonusId', requireRole('super_admin'), logAction('delete_bonus', 'bonus'), bonusController.deleteBonus);

// Award bonus to player
router.post('/award', requireRole('super_admin', 'manager'), logAction('award_bonus', 'player_bonus'), [
  body('playerId').isInt().withMessage('Valid player ID required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Invalid amount'),
  validate
], bonusController.awardBonus);

// Cancel player bonus
router.post('/player-bonuses/:playerBonusId/cancel', requireRole('super_admin', 'manager'), logAction('cancel_bonus', 'player_bonus'), [
  body('reason').notEmpty().withMessage('Reason required'),
  validate
], bonusController.cancelPlayerBonus);

// Reset wagering requirement for a player's bonus
router.post('/player-bonuses/:playerBonusId/reset-wagering', requireRole('super_admin', 'manager'), logAction('reset_wagering', 'player_bonus'), [
  body('reason').optional(),
  body('newWageringTarget').optional().isFloat({ min: 0 }).withMessage('Invalid wagering target'),
  validate
], bonusController.resetWageringRequirement);

// Get available currencies for bonus creation
router.get('/currencies/available', bonusController.getAvailableCurrencies);

module.exports = router;
