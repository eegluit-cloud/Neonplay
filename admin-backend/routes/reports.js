const express = require('express');
const { authenticateAdmin, requireRole } = require('../middleware/auth');
const reportsController = require('../controllers/reportsController');

const router = express.Router();

router.use(authenticateAdmin);

// Dashboard summary
router.get('/dashboard', reportsController.getDashboardSummary);

// Transaction reports
router.get('/transactions', reportsController.getTransactionReport);

// Banking reports
router.get('/banking', reportsController.getBankingReport);

// Bonus reports
router.get('/bonuses', reportsController.getBonusReport);

// Player reports
router.get('/players', reportsController.getPlayerReport);

// Game reports
router.get('/games', reportsController.getGameReport);

// Player segmentation report (Active, Inactive, Closed, GGR, NGR, Bonus spends)
router.get('/player-segmentation', reportsController.getPlayerSegmentationReport);

// Fraud detection report (Same IP detection)
router.get('/fraud', requireRole('super_admin', 'manager'), reportsController.getFraudReport);

// Export to CSV
router.get('/export', requireRole('super_admin', 'manager'), reportsController.exportToCsv);

module.exports = router;
