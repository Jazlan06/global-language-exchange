const express = require('express');
const router = express.Router();
const xpController = require('../controllers/xpController');
const auth = require('../middleware/authMiddleware');
const XpHistory = require('../models/XpHistory');

router.get('/me', auth, xpController.getXP);
router.post('/update', auth, xpController.updateXP);
router.get('/leaderboard', auth, xpController.getLeaderboard);
router.get('/daily-leaderboard', auth, xpController.getDailyLeaderboard);
router.get('/full', auth, xpController.getFullLeaderboard);
router.get('/history', auth, xpController.getXPHistory);

module.exports = router;
