const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const challengeController = require('../controllers/challengeController');

router.get('/today', auth, challengeController.getTodayChallenge);
router.post('/complete', auth, challengeController.completeTodayChallenge);

module.exports = router;
