const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const UserLessonProgress = require('../models/UserLessonProgress');

exports.getUserProgress = async (req, res) => {
    try {
        const progress = await UserLessonProgress.find({ user: req.user.id }).populate('lesson');
        res.json(progress);
    } catch (err) {
        console.error('❌ Error getting lesson progress:', err);
        res.status(500).json({ message: 'Failed to get lesson progress' });
    }
};

exports.createLesson = async (req, res) => {
    try {
        const { title, type, content, quizId, order, prerequisites } = req.body;

        const lesson = new Lesson({
            title,
            type,
            content,
            quiz: type === 'quiz' ? quizId : null,
            order,
            prerequisites: prerequisites || []
        });
        await lesson.save();
        res.status(201).json({
            message: 'Lesson Created',
            lesson
        });
    } catch (err) {
        console.error('Error creating lesson:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getAllLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find().populate('quiz');
        res.json(lessons);
    } catch (err) {
        console.error('Error fetching lessons:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId).populate('quiz');
        if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
        res.json(lesson);
    } catch (err) {
        console.error('Error fetching lesson:', err);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.updateLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const updateData = req.body;

        // Optional: Validate updateData here if needed

        const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, updateData, { new: true });
        if (!updatedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.json({ message: 'Lesson updated', lesson: updatedLesson });
    } catch (err) {
        console.error('Error updating lesson:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const deletedLesson = await Lesson.findByIdAndDelete(lessonId);
        if (!deletedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.json({ message: 'Lesson deleted' });
    } catch (err) {
        console.error('Error deleting lesson:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

async function arePrerequisitesCompleted(userId, lesson) {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
        return true;
    }

    const completedCount = await UserLessonProgress.countDocuments({
        user: userId,
        lesson: { $in: lesson.prerequisites },
        status: 'completed'
    });
    return completedCount === lesson.prerequisites.length;
}

async function unlockNextLesson(userId, currentLessonOrder) {
    // Validate currentLessonOrder is a number
    if (typeof currentLessonOrder !== 'number' || isNaN(currentLessonOrder)) {
        console.error('unlockNextLesson: invalid currentLessonOrder:', currentLessonOrder);
        return null;  // safely bail out here
    }

    const nextLesson = await Lesson.findOne({
        order: currentLessonOrder + 1
    });

    if (!nextLesson) return null;

    const alreadyProgress = await UserLessonProgress.findOne({
        user: userId,
        lesson: nextLesson._id,
    });
    if (alreadyProgress) return null;

    const canUnlock = await arePrerequisitesCompleted(userId, nextLesson);
    if (!canUnlock) return null;

    const newProgress = new UserLessonProgress({
        user: userId,
        lesson: nextLesson._id,
        status: 'unlocked',
        completedAt: null
    });

    await newProgress.save();
    return newProgress;
}



exports.unlockNextLesson = unlockNextLesson;