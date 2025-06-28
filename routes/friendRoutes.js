const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const auth = require('../middleware/authMiddleware');

router.post('/request', auth, friendController.sendRequest);
router.post('/accept', auth, friendController.acceptRequest);
router.post('/reject', auth, friendController.rejectRequest);
router.get('/pending', auth, friendController.getPendingRequests);
router.get('/list', auth, friendController.getFriendList);
router.get('/mutual/:otherUserId', auth, friendController.getMutualFriends);

module.exports = router;