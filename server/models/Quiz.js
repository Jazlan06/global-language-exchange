const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [{
        question: String,
        choices: [String],
        correctAnswerIndex: Number,
    }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
