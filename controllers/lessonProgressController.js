const UserLessonProgress = require('../models/UserLessonProgress');
const User = require('../models/User');

exports.markLessonComplete = async (req, res) => {
    try {
        const { lessonId } = req.body;

        if (!lessonId) {
            return res.status(400).json({ message: 'lessonId is required' });
        }

        const existing = await UserLessonProgress.findOne({
            user: req.user.id,
            lesson: lessonId
        });

        if (existing) {
            return res.status(200).json({ message: 'Lesson already marked complete' });
        }

        await UserLessonProgress.create({
            user: req.user.id,
            lesson: lessonId
        });

        await User.findByIdAndUpdate(req.user.id, { $inc: { xp: parseInt(process.env.LESSON_XP || 20) } });

        res.status(200).json({ message: 'Lesson marked complete and 20 XP awarded' });
    } catch (err) {
        console.error('Error marking lesson complete:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCompletedLessons = async (req, res) => {
    try {
        const lessons = await UserLessonProgress.find({
            user: req.user.id
        }).populate('lesson');

        res.json(lessons);
    } catch (err) {
        console.error('Error getting completed lessons:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
