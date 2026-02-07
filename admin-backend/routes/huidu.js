const express = require('express');
const multer = require('multer');
const { authenticateAdmin, requireRole, logAction } = require('../middleware/auth');
const huiduController = require('../controllers/huiduController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for Excel files
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.xlsx$/i)) {
      return cb(new Error('Only .xlsx files are allowed'));
    }
    cb(null, true);
  },
});

// Import games from Huidu Excel spreadsheet (open - no auth required)
router.post(
  '/import/excel',
  upload.single('file'),
  huiduController.importExcelGames,
);

// All routes below require authentication
router.use(authenticateAdmin);

// Sync providers from Huidu API
router.post(
  '/sync/providers',
  requireRole('super_admin'),
  logAction('huidu_sync_providers', 'game_provider'),
  huiduController.syncProviders,
);

// Sync games for a specific provider
router.post(
  '/sync/games/:providerCode',
  requireRole('super_admin'),
  logAction('huidu_sync_games', 'game'),
  huiduController.syncGames,
);

// Sync all games from all Huidu providers
router.post(
  '/sync/all-games',
  requireRole('super_admin'),
  logAction('huidu_sync_all_games', 'game'),
  huiduController.syncAllGames,
);

// Get Huidu integration status
router.get('/status', huiduController.getStatus);

module.exports = router;
