const UserQuizProgress = require('../models/UserQuizProgress');
const Quiz = require('../models/Quiz');


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
            .populate('quiz', 'questions')
            .sort({ date: -1 });

        res.json(progress);
    } catch (err) {
        console.error('Error fetching quiz progress:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
