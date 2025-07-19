const mongoose = require('mongoose');

const userQuizProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    passed: { type: Boolean, default: false },
    answers: [
        {
            question: String,
            selectedOption: String,
            correctAnswer: String
        }
    ]
});

module.exports = mongoose.model('UserQuizProgress', userQuizProgressSchema);
