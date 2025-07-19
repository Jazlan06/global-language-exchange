const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/authMiddleware');
const checkBlock = require('../middleware/checkBlockMiddleware');

router.post('/request', auth, checkBlock, friendController.sendRequest);
router.post('/accept', auth, checkBlock, friendController.acceptRequest);
router.post('/reject', auth, checkBlock, friendController.rejectRequest);
router.get('/pending', auth, friendController.getPendingRequests);
router.get('/list', auth, friendController.getFriendList);
router.get('/mutual/:otherUserId', auth, checkBlock, friendController.getMutualFriends);

module.exports = router;