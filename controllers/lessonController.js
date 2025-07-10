const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

exports.createLesson = async (req, res) => {
    try {
        const { title, type, content, quizId } = req.body;

        const lesson = new Lesson({
            title,
            type,
            content,
            quiz: type === 'quiz' ? quizId : null
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

async function arePrerequisitesCompleted(userId, lesson) {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
        return true;
    }

    const completedCount = await UserLessonProgress.countDocument({
        user: userId,
        lesson: { $in: lesson.prerequisites },
        status: 'completed'
    });
    return completedCount === lesson.prerequisites.length;
}

async function unlockNextLesson(userId, currentLessonOrder) {

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