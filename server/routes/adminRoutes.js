const express = require('express');
const { getStats } = require('../controllers/claimController');
const protect = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

const router = express.Router();

router.get('/stats', protect, adminOnly, getStats);

module.exports = router;
