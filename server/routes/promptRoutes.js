const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');
const auth = require('../middleware/authMiddleware');

router.get('/random', auth, promptController.getRandomPrompt);
// router.get('/ai', auth, promptController.getAIPrompt);

module.exports = router;