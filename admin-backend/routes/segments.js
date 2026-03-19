const express = require('express');
const router = express.Router();
const { authenticateAdmin, requireRole } = require('../middleware/auth');
const {
  getSegments, getSegment, createSegment, updateSegment, deleteSegment
} = require('../controllers/segmentController');

router.use(authenticateAdmin);

router.get('/', getSegments);
router.get('/:segmentId', getSegment);
router.post('/', requireRole('super_admin', 'manager'), createSegment);
router.put('/:segmentId', requireRole('super_admin', 'manager'), updateSegment);
router.delete('/:segmentId', requireRole('super_admin', 'manager'), deleteSegment);

module.exports = router;
