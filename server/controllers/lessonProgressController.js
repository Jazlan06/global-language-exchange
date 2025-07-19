const UserLessonProgress = require('../models/UserLessonProgress');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const unlockNextLesson = require('./lessonController').unlockNextLesson;
const XpHistory = require('../models/XpHistory');

exports.markLessonComplete = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const userId = req.user.id;

        if (!lessonId) {
            return res.status(400).json({ message: 'lessonId is required' });
        }

        let progress = await UserLessonProgress.findOne({ user: userId, lesson: lessonId });

        if (progress && progress.status === 'completed') {
            return res.status(200).json({ message: 'Lesson already marked complete' });
        }

        if (!progress) {
            progress = new UserLessonProgress({
                user: userId,
                lesson: lessonId,
                status: 'completed',
                completedAt: new Date(),
            });
        } else {
            progress.status = 'completed';
            progress.completedAt = new Date();
        }

        await progress.save();

        const xpAmount = parseInt(process.env.LESSON_XP || 20);
        await User.findByIdAndUpdate(userId, { $inc: { xp: xpAmount } });

        await XpHistory.create({
            user: userId,
            xp: xpAmount,
            sourceType: 'lesson',
            sourceId: lessonId,
            description: `Completed lesson ${lessonId}`
        })

        const currentLesson = await Lesson.findById(lessonId);
        if (currentLesson) {
            await unlockNextLesson(userId, currentLesson.order);
        }

        res.status(200).json({ message: 'Lesson marked complete and XP awarded' });

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

exports.initializeLessons = async (req, res) => {
    try {
        const userId = req.user.id;

        const existingProgress = await UserLessonProgress.findOne({ user: userId });
        if (existingProgress) {
            return res.status(400).json({ message: 'Lessons already initialized' });
        }

        const firstLesson = await Lesson.findOne().sort({ order: 1 });
        if (!firstLesson) {
            return res.status(404).json({ message: 'No lessons found to initialize' });
        }

        const progress = new UserLessonProgress({
            user: userId,
            lesson: firstLesson._id,
            status: 'unlocked',
            completedAt: null
        });
        await progress.save();

        res.status(200).json({ message: 'First lesson unlocked', lessonId: firstLesson._id });
    } catch (err) {
        console.error('Error initializing lessons:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.initializeFirstLessonForUser = async (userId) => {
    const existingProgress = await UserLessonProgress.findOne({ user: userId });
    if (existingProgress) return;

    const firstLesson = await Lesson.findOne().sort({ order: 1 });
    if (!firstLesson) return;

    const progress = new UserLessonProgress({
        user: userId,
        lesson: firstLesson._id,
        status: 'unlocked',
        completedAt: null
    });

    await progress.save();
}
