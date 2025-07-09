const express = require('express');
const router = express.Router();
const xpController = require('../controllers/xpController');
const auth = require('../middleware/authMiddleware');

router.get('/me', auth, xpController.getXP);
router.post('/update', auth, xpController.updateXP);
router.get('/leaderboard', auth, xpController.getLeaderboard);
router.get('/daily-leaderboard', auth, xpController.getDailyLeaderboard);
router.get('/full', auth, xpController.getFullLeaderboard); // ✅ here

module.exports = router;
