const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Authenticated routes
router.get('/me', auth, userController.getProfile);
router.put('/me', auth, (req, res, next) => {
    console.log('🧾 Update user profile request body:', req.body);
    next();
}, userController.updateProfile);
router.put('/me/preferences', auth, userController.updatePreferences);
router.put('/me/privacy', auth, userController.updatePrivacySettings);
router.get('/me/badges', auth, userController.getMyBadges);

// Friends & online
router.get('/friends/online', auth, userController.getOnlineFriends);
router.get('/:userId/friends', auth, userController.getFriends);
router.get('/online', auth, userController.getAllOnlineUsers);

// Search & listing
router.get('/list', auth, userController.getUserList);
router.get('/all', auth, async (req, res) => {
    try {
        const users = await User.find({}, '_id name email');
        res.json(users);
    } catch (err) {
        console.error('❌ Error fetching all users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
