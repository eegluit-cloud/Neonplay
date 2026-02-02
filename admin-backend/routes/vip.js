const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateAdmin } = require('../middleware/auth');
const vipController = require('../controllers/vipController');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Protect all VIP routes
router.use(authenticateAdmin);

// VIP tier management
router.get('/tiers', vipController.getAllTiers);
router.get('/tiers/:tierId', vipController.getTier);
router.post('/tiers', upload.single('iconFile'), vipController.createTier);
router.put('/tiers/:tierId', upload.single('iconFile'), vipController.updateTier);
router.delete('/tiers/:tierId', vipController.deleteTier);

// VIP statistics
router.get('/stats', vipController.getVipStats);

// VIP page content management
router.get('/page-content', vipController.getVipPageContent);
router.put('/page-content', vipController.updateVipPageContent);

module.exports = router;
