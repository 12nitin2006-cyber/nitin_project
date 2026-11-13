const express = require('express');
const {
  createClaim,
  getMyClaims,
  getAllClaims,
  updateClaimStatus,
} = require('../controllers/claimController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();

router.post('/', protect, createClaim);
router.get('/mine', protect, getMyClaims);

// Admin only
router.get('/', protect, adminOnly, getAllClaims);
router.patch('/:id', protect, adminOnly, updateClaimStatus);

module.exports = router;
