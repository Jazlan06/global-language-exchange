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

    const normalizeLanguageArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr
            .map(item => typeof item === 'string' ? { language: item.trim() } : item)
            .filter(item => item && item.language);
    };

    try {
        console.log("🧾 Update user profile request body:", req.body);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                languagesKnown: normalizeLanguageArray(languagesKnown),
                languagesLearning: normalizeLanguageArray(languagesLearning),
                timeZone,
                interests,
                profilePic,
                theme,
                notificationPreferences
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('❌ Error in updateProfile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


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

exports.updatePrivacySettings = async (req, res) => {
    const { showEmail, showOnlineStatus, profileVisibleTo } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                'privacy.showEmail': showEmail,
                'privacy.showOnlineStatus': showOnlineStatus,
                'privacy.profileVisibleTo': profileVisibleTo
            },
            { new: true }
        ).select('-passwordHash');

        res.json({ message: 'Privacy settings updated', user });
    } catch (err) {
        console.error('❌ Error updating privacy settings:', err);
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
        res.json({ onlineUsers: users });
    } catch (error) {
        console.error('❌ Error in getAllOnlineUsers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserList = async (req, res) => {
    try {
        const query = req.query.q || '';
        const regex = new RegExp(query, 'i');

        const users = await User.find({
            _id: { $ne: req.user.id },
            name: { $regex: regex }
        }).select({ _id: 1, name: 1 }).lean();

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFriends = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).populate('friends', 'name email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ friends: user.friends || [] });
    } catch (err) {
        console.error('Error fetching friends:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
