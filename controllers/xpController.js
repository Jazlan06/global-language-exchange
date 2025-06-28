const XP = require('../models/XP');

const isNextDay = (lastDate, currentDate) => {
  if (!lastDate) return false;
  const last = new Date(lastDate).setHours(0, 0, 0, 0);
  const current = new Date(currentDate).setHours(0, 0, 0, 0);
  return current - last === 24 * 60 * 60 * 1000; // 1 day in ms
};

exports.updateXP = async (req, res) => {
  try {
    const userId = req.user.id;
    const xpToAdd = req.body.xp || 10;
    const today = new Date();

    let userXP = await XP.findOne({ user: userId });

    if (!userXP) {
      // Create new XP record for user
      userXP = new XP({
        user: userId,
        xp: xpToAdd,
        streak: 1,
        lastActiveDate: today,
      });
    } else {
      const lastActive = userXP.lastActiveDate ? new Date(userXP.lastActiveDate) : null;

      if (lastActive && lastActive.toDateString() === today.toDateString()) {
        // Same day, just add XP
        userXP.xp += xpToAdd;
      } else if (isNextDay(lastActive, today)) {
        // Next day, increment streak and add XP
        userXP.streak += 1;
        userXP.xp += xpToAdd;
        userXP.lastActiveDate = today;
      } else {
        // More than one day gap, reset streak and add XP
        userXP.streak = 1;
        userXP.xp += xpToAdd;
        userXP.lastActiveDate = today;
      }
    }

    await userXP.save();

    res.json({
      message: 'XP updated',
      xp: userXP.xp,
      streak: userXP.streak,
      lastActiveDate: userXP.lastActiveDate,
    });
  } catch (err) {
    console.error('❌ Error updating XP:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getXP = async (req, res) => {
  try {
    const userId = req.user.id;

    const userXP = await XP.findOne({ user: userId });

    if (!userXP) {
      return res.status(404).json({ message: 'XP data not found for user' });
    }

    res.json({
      xp: userXP.xp,
      streak: userXP.streak,
      lastActiveDate: userXP.lastActiveDate,
    });
  } catch (error) {
    console.error('❌ Error in getXP:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
