const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true,
    },
    challengeText: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
