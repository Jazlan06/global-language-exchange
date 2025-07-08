const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  questions: [{
    question: String,
    choices: [String],
    correctAnswerIndex: Number,
  }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
