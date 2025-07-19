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
    isOnline: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    bannedUntil: {
        type: Date,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    challengeStreak: {
        type: Number,
        default: 0
    },
    lastChallengeDate: {
        type: String,
        default: null
    },
    totalChallengeCompleted: {
        type: Number,
        default: 0
    },
    badges: {
        type: [String],
        default: []
    },
    xp: {
        type: Number,
        default: 0
    },
    theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    },
    privacy: {
    showEmail: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },
    profileVisibleTo: {
        type: String,
        enum: ['everyone', 'friends', 'only_me'],
        default: 'everyone'
    }
}
});

module.exports = mongoose.model('User', userSchema);
