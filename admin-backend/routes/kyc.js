const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticateAdmin, logAction } = require('../middleware/auth');
const kycController = require('../controllers/kycController');

const router = express.Router();

router.use(authenticateAdmin);

// Get KYC stats
router.get('/stats', kycController.getKycStats);

// Get KYC queue
router.get('/queue', kycController.getKycQueue);

// Get player KYC
router.get('/player/:playerId', kycController.getPlayerKyc);

// Review document
router.post('/document/:documentId/review', logAction('review_kyc', 'kyc_document'), [
  body('action').isIn(['approve', 'reject']).withMessage('Invalid action'),
  body('notes').optional().isString(),
  validate
], kycController.reviewDocument);

// Request additional documents
router.post('/player/:playerId/request-documents', logAction('request_documents', 'player'), [
  body('message').notEmpty().withMessage('Message required'),
  body('requiredDocs').isArray().withMessage('Required docs must be an array'),
  validate
], kycController.requestAdditionalDocuments);

module.exports = router;
