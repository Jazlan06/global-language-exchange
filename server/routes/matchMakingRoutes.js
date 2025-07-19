const express = require('express');
const router = express.Router();
const matchMakingController = require('../controllers/matchMakingController');
const auth = require('../middleware/authMiddleware');

// Route to get all matches
router.get('/', auth,  matchMakingController.getMatches);

module.exports = router;
