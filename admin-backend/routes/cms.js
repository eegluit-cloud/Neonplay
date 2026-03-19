const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin, requireRole, logAction } = require('../middleware/auth');
const cmsController = require('../controllers/cmsController');

const router = express.Router();

// Public endpoint - no auth required
router.get('/public/:slug', cmsController.getPublicPage);

// All routes below require admin authentication
router.use(authenticateAdmin);

// List all pages
router.get('/', cmsController.listPages);

// Get single page
router.get('/:pageId', cmsController.getPage);

// Create page
router.post('/', requireRole('super_admin', 'manager'), logAction('create_cms_page', 'cms_page'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('status').optional().isIn(['published', 'draft']).withMessage('Status must be published or draft'),
  validate,
], cmsController.createPage);

// Update page
router.put('/:pageId', requireRole('super_admin', 'manager'), logAction('update_cms_page', 'cms_page'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('slug').optional().notEmpty().withMessage('Slug cannot be empty'),
  body('status').optional().isIn(['published', 'draft']).withMessage('Status must be published or draft'),
  validate,
], cmsController.updatePage);

// Delete page
router.delete('/:pageId', requireRole('super_admin'), logAction('delete_cms_page', 'cms_page'), cmsController.deletePage);

module.exports = router;
