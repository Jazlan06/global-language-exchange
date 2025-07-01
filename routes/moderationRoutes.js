const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const modController = require('../controllers/moderationController');


router.post('/flag',auth, modController.flagMessage);
router.get('/flagged-messages',auth, admin, modController.getFlaggedMessages);

module.exports = router;