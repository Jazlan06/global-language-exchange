const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User')


router.get('/me', auth, userController.getProfile);
router.put('/me', auth, (req, res, next) => {
    console.log('🧾 Update user profile request body:', req.body);
    next();
}, userController.updateProfile);
router.put('/me/preferences', auth, userController.updatePreferences);
router.get('/all', auth, async (req, res) => {
    const users = await User.find({}, '_id name email');
    res.json(users);
});
router.get('/friends/online', auth, userController.getOnlineFriends);
router.get('/online', auth, userController.getAllOnlineUsers);
router.get('/me/badges', auth, userController.getMyBadges);router.put('/me/privacy', auth, userController.updatePrivacySettings);
router.put('/me/privacy', auth, userController.updatePrivacySettings);

module.exports = router;