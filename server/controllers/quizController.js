const UserQuizProgress = require('../models/UserQuizProgress');
const Quiz = require('../models/Quiz');
const User = require('../models/User');



exports.createQuiz = async (req, res) => {
    try {
        const { questions } = req.body;

        const quiz = new Quiz({ questions });
        await quiz.save();

        res.status(201).json({ message: 'Quiz created', quizId: quiz._id });
    } catch (err) {
        console.error('Error creating quiz:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        if (!quizId || !answers) {
            return res.status(400).json({ message: 'quizId and answers are required' });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        const detailedResults = [];

        for (let i = 0; i < quiz.questions.length; i++) {
            const q = quiz.questions[i];
            const userAnswer = answers.find(ans => ans.question === q.question);
            const isCorrect = userAnswer && userAnswer.selectedOption === q.correctAnswerIndex;

            detailedResults.push({
                question: q.question,
                selectedOption: userAnswer ? userAnswer.selectedOption : null,
                correctAnswer: q.correctAnswerIndex
            });

            if (isCorrect) score += 1;
        }

        const result = new UserQuizProgress({
            user: req.user.id,
            quiz: quiz._id,
            score,
            total: quiz.questions.length,
            passed: score >= Math.ceil(quiz.questions.length / 2),
            answers: detailedResults
        });

        await result.save();

        if (result.passed) {
            const lesson = await require('../models/Lesson').findOne({ quiz: quiz._id });
            if (lesson) {
                const lessonProgress = await require('../models/UserLessonProgress').findOneAndUpdate(
                    { user: req.user.id, lesson: lesson._id },
                    {
                        $set: {
                            status: 'completed',
                            completedAt: new Date()
                        }
                    },
                    { upsert: true, new: true }
                );

                const xpAmount = parseInt(process.env.LESSON_XP || 20);
                await User.findByIdAndUpdate(req.user.id, { $inc: { xp: xpAmount } });

                await require('../models/XpHistory').create({
                    user: req.user.id,
                    xp: xpAmount,
                    sourceType: 'lesson',
                    sourceId: lesson._id,
                    description: `Completed quiz lesson ${lesson._id}`
                });

                // Unlock next lesson
                const { unlockNextLesson } = require('./lessonController');
                await unlockNextLesson(req.user.id, lesson.order);
            }
        }

        res.status(200).json({
            message: 'Quiz Submitted',
            score,
            total: quiz.questions.length,
            passed: result.passed,
            answers: detailedResults
        });

    } catch (err) {
        console.error('Error submitting quiz:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getUserQuizProgress = async (req, res) => {
    try {
        const progress = await UserQuizProgress.find({ user: req.user.id })
            .populate('quiz', 'title')
            .sort({ date: -1 });

        res.json(progress);
    } catch (err) {
        console.error('Error fetching quiz progress:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const updateData = req.body;

        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updateData, { new: true });
        if (!updatedQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json({ message: 'Quiz updated', quiz: updatedQuiz });
    } catch (err) {
        console.error('Error updating quiz:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
        if (!deletedQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        console.error('Error deleting quiz:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) {
        console.error('Error fetching quizzes:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
