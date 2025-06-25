const User = require('../models/User');

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
        profilePic
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
                profilePic
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