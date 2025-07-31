const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['text', 'quiz', 'audio'], required: true },
    content: { type: String },
    quiz: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    order: { type: Number, required: true, unique: true },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
