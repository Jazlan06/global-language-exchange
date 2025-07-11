const mongoose = require('mongoose');

const xpHistorySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    xp: { type: Number, required: true },
    sourceType: { type: String, enum: ['lesson', 'quiz', 'challenge', 'other'], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, refPath: 'sourceType', required: false },
    description: { type: String }, 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('XpHistory', xpHistorySchema);
