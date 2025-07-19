const mongoose = require('mongoose');

const completedChallengeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    completedAt: {
        type: Date,
        default: Date.now,
    }
});

// Ensure a user can only complete one challenge per day
completedChallengeSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('CompletedChallenge', completedChallengeSchema);
