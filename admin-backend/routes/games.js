const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin, requireRole, logAction } = require('../middleware/auth');
const gamesController = require('../controllers/gamesController');

const router = express.Router();

router.use(authenticateAdmin);

// Categories
router.get('/categories', gamesController.getCategories);

router.post('/categories', requireRole('super_admin', 'manager'), logAction('create_category', 'category'), [
  body('name').notEmpty().withMessage('Name required'),
  body('slug').notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Invalid slug format'),
  validate
], gamesController.createCategory);

router.put('/categories/:categoryId', requireRole('super_admin', 'manager'), logAction('update_category', 'category'), gamesController.updateCategory);

router.delete('/categories/:categoryId', requireRole('super_admin', 'manager'), logAction('delete_category', 'category'), gamesController.deleteCategory);

router.post('/categories/reorder', requireRole('super_admin', 'manager'), logAction('reorder_categories', 'category'), [
  body('order').isArray().withMessage('Order must be an array'),
  validate
], gamesController.reorderCategories);

// Aggregators
router.get('/aggregators', gamesController.getAggregators);

router.put('/aggregators/:aggregatorId', requireRole('super_admin', 'manager'), logAction('update_aggregator', 'aggregator'), gamesController.updateAggregator);

// Providers
router.get('/providers', gamesController.getProviders);

router.put('/providers/:providerId', requireRole('super_admin', 'manager'), logAction('update_provider', 'provider'), gamesController.updateProvider);

// Games
router.get('/', gamesController.getGames);

router.get('/:gameId', gamesController.getGame);

router.put('/:gameId', requireRole('super_admin', 'manager'), logAction('update_game', 'game'), gamesController.updateGame);

router.post('/bulk-update', requireRole('super_admin', 'manager'), logAction('bulk_update_games', 'game'), [
  body('gameIds').isArray().withMessage('Game IDs must be an array'),
  validate
], gamesController.bulkUpdateGames);

module.exports = router;
