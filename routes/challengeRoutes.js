const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const challengeController = require('../controllers/challengeController');

router.get('/today', auth, challengeController.getTodayChallenge);
router.post('/complete', auth, challengeController.completeTodayChallenge);
router.get('/stats', auth, admin, challengeController.getChallengeStats);

module.exports = router;
