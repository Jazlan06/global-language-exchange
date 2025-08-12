const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { blockedUsers, blockUser, reportUser, unblockUser } = require('../controllers/userModerationController');

router.post('/block', auth, blockUser);
router.post('/report', auth, reportUser);
router.post('/unblock', auth, unblockUser);
router.get('/blocked', auth, blockedUsers);

module.exports = router;