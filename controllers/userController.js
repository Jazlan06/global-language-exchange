const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const badges = require('../utils/badges');

exports.getMyBadges = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, 'badges');
        const detailed = user.badges.map(bKey => badges[bKey.toUpperCase()]);
        res.json({
            badges: detailed
        });
    } catch (err) {
        console.error('Failed to fetch badges:', err);
        res.status(500).json({ message: 'Failed to fetch badges' });
    }
}

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('❌ Error in getProfile:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updateProfile = async (req, res) => {
    const {
        name,
        languagesKnown,
        languagesLearning,
        timeZone,
        interests,
        profilePic,
        theme,
        notificationPreferences
    } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                languagesKnown,
                languagesLearning,
                timeZone,
                interests,
                profilePic,
                theme,
                notificationPreferences
            },
            { new: true }
        ).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('❌ Error in updateProfile:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.updatePreferences = async (req, res) => {
    const { theme, notificationPreferences } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { theme, notificationPreferences },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Preferences updated', user });
    } catch (err) {
        console.error('❌ Error updating preferences:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getOnlineFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        const sent = await FriendRequest.find({ sender: userId, status: 'accepted' });
        const received = await FriendRequest.find({ receiver: userId, status: 'accepted' });

        const friendIds = [
            ...sent.map(r => r.receiver.toString()),
            ...received.map(r => r.sender.toString())
        ];

        const onlineFriends = await User.find({
            _id: { $in: friendIds },
            isOnline: true
        }, '_id name email isOnline');

        res.json({ onlineFriends });
    } catch (error) {
        console.error('❌ Error fetching online friends:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getAllOnlineUsers = async (req, res) => {
    try {
        const users = await User.find({ isOnline: true }, 'name email');
        if (users.length === 0) {
            return res.status(404).json({ message: 'No online users found' });
        }
        res.json({ onlineUsers: users });
    } catch (error) {
        console.error('❌ Error in getAllOnlineUsers:', error);
        res.status(500).json({ message: 'Server error' });
    }
}