const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin, requireRole, logAction } = require('../middleware/auth');
const bannersController = require('../controllers/bannersController');

const router = express.Router();
router.use(authenticateAdmin);

router.get('/', bannersController.listBanners);
router.get('/:bannerId', bannersController.getBanner);

router.post('/', requireRole('super_admin', 'manager'), logAction('create_banner', 'banner'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('platform').optional().isIn(['all', 'desktop', 'mobile', 'tablet']).withMessage('Invalid platform'),
  body('targetAudience').optional().isIn(['all', 'authenticated', 'guest']).withMessage('Invalid target audience'),
  validate,
], bannersController.createBanner);

router.put('/reorder', requireRole('super_admin', 'manager'), bannersController.reorderBanners);

router.put('/:bannerId', requireRole('super_admin', 'manager'), logAction('update_banner', 'banner'), bannersController.updateBanner);

router.delete('/:bannerId', requireRole('super_admin'), logAction('delete_banner', 'banner'), bannersController.deleteBanner);

module.exports = router;
