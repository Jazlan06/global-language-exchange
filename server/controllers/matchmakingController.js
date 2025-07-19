const User = require('../models/User');

exports.getMatches = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const myKnownLanguages = currentUser.languagesKnown.map(lang => lang.language);
        const myLearningLanguages = currentUser.languagesLearning.map(lang => lang.language);

        const matches = await User.find({
            _id: { $ne: req.user.id },
            "languagesKnown.language": { $in: myLearningLanguages },
            "languagesLearning.language": { $in: myKnownLanguages }
        }).select('-passwordHash');

        if (matches.length === 0) {
            return res.status(404).json({ message: 'No matches found' });
        }

        res.json(matches);
    } catch (err) {
        console.error('❌ Error in getMatches:', err);
        res.status(500).json({ message: 'Server error' });
    }

}