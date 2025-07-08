const mongoose = require('mongoose');

const userLessonProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  completed: { type: Boolean, default: false },
  quizScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('UserLessonProgress', userLessonProgressSchema);
