const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    languagesKnown: [
        {
            language: String,
            level: String,
        },
    ],
    languagesLearning: [
        {
            language: String,
            level: String,
        },
    ],
    timeZone: { type: String },
    interests: [String],
    profilePic: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },

});

module.exports = mongoose.model('User', userSchema);
