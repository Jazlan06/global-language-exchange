const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { blockUser, reportUser } = require('../controllers/userModerationController');

router.post('/block', auth, blockUser);
router.post('/report', auth, reportUser);
router.post('/unblock', auth, unblockUser);

module.exports = router;