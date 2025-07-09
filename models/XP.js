const mongoose = require('mongoose');

const xpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  xpToday: { type: Number, default: 0 }, 
  lastReset: { type: Date }              
}, { timestamps: true });

module.exports = mongoose.model('XP', xpSchema);
