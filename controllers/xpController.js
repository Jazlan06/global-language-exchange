const XP = require('../models/XP');
const XpHistory = require('../models/XpHistory');
const Notification = require('../models/Notification')

const isNextDay = (lastDate, currentDate) => {
    if (!lastDate) return false;
    const last = new Date(lastDate).setHours(0, 0, 0, 0);
    const current = new Date(currentDate).setHours(0, 0, 0, 0);
    return current - last === 24 * 60 * 60 * 1000;
};
exports.getXPHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await XpHistory.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(history);
    } catch (err) {
        console.error('❌ Error fetching XP history:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateXP = async (req, res) => {
    try {
        const userId = req.user.id;
        const xpToAdd = req.body.xp || 10;
        const today = new Date();
        const todayStr = today.toDateString();

        let userXP = await XP.findOne({ user: userId });

        if (!userXP) {
            userXP = new XP({
                user: userId,
                xp: xpToAdd,
                xpToday: xpToAdd,
                streak: 1,
                lastActiveDate: today,
                lastReset: today,
                milestonesNotified: [],
                streakMilestonesNotified: []
            });
        } else {
            if (!userXP.milestonesNotified) userXP.milestonesNotified = [];
            if (!userXP.streakMilestonesNotified) userXP.streakMilestonesNotified = [];

            const lastResetStr = userXP.lastReset?.toDateString() ?? null;
            if (lastResetStr !== todayStr) {
                userXP.xpToday = 0;
                userXP.lastReset = today;
            }

            userXP.xpToday += xpToAdd;
            userXP.xp += xpToAdd;

            const lastActiveStr = userXP.lastActiveDate?.toDateString() ?? null;
            if (lastActiveStr !== todayStr) {
                if (isNextDay(userXP.lastActiveDate, today)) {
                    userXP.streak += 1;
                } else {
                    userXP.streak = 1;
                }
            }

            userXP.lastActiveDate = today;
        }

        const xpMilestones = [100, 500, 1000, 2000];
        const newXpMilestones = xpMilestones.filter(
            m => userXP.xp >= m && !userXP.milestonesNotified.includes(m)
        );

        for (const milestone of newXpMilestones) {
            await Notification.create({
                type: 'xp_milestone',
                sender: userId,
                receiver: userId,
                text: `🎉 Congrats! You reached ${milestone} XP!`
            });
            userXP.milestonesNotified.push(milestone);
        }

        const streakMilestones = [7, 30, 100];
        const newStreakMilestone = streakMilestones.find(
            m => userXP.streak >= m && !userXP.streakMilestonesNotified?.includes(m)
        );

        if (newStreakMilestone) {
            await Notification.create({
                type: 'streak_milestone',
                sender: userId,
                receiver: userId,
                text: `🔥 You've hit a ${newStreakMilestone}-day streak! Keep it going!`
            });

            if (!userXP.streakMilestonesNotified) userXP.streakMilestonesNotified = [];
            userXP.streakMilestonesNotified.push(newStreakMilestone);
        }

        await userXP.save();

        await XpHistory.create({
            user: userId,
            xp: xpToAdd,
            sourceType: 'other',
            description: 'XP updated via updateXP API',
            createdAt: new Date()
        });

        res.json({
            message: 'XP updated',
            totalXP: userXP.xp,
            xpToday: userXP.xpToday,
            streak: userXP.streak,
            lastActiveDate: userXP.lastActiveDate,
            lastReset: userXP.lastReset,
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
            xpToday: userXP.xpToday,
            streak: userXP.streak,
            lastActiveDate: userXP.lastActiveDate,
            lastReset: userXP.lastReset,
        });
    } catch (error) {
        console.error('❌ Error in getXP:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await XP.find({})
            .sort({ xp: -1 })
            .limit(20)
            .populate('user', 'name profilePic');

        const leaderboard = topUsers.map((entry, index) => ({
            rank: index + 1,
            userId: entry.user._id,
            name: entry.user.name,
            profilePic: entry.user.profilePic,
            xp: entry.xp,
            streak: entry.streak,
            xpToday: entry.xpToday || 0,
        }));

        const allUsersSorted = await XP.find({}).sort({ xp: -1 }).select('user');
        const userIdStr = req.user.id.toString();
        const userRankIndex = allUsersSorted.findIndex(u => u.user.toString() === userIdStr);

        res.json({
            leaderboard,
            userRank: userRankIndex !== -1 ? userRankIndex + 1 : null
        });
    } catch (err) {
        console.error('❌ Error fetching leaderboard:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getDailyLeaderboard = async (req, res) => {
    try {
        const topUsers = await XP.find({})
            .sort({ xpToday: -1 })
            .limit(20)
            .populate('user', 'name profilePic');

        const leaderboard = topUsers.map((entry, index) => ({
            rank: index + 1,
            userId: entry.user._id,
            name: entry.user.name,
            profilePic: entry.user.profilePic,
            xpToday: entry.xpToday
        }));

        const allSorted = await XP.find({}).sort({ xpToday: -1 }).select('user');
        const userIdStr = req.user.id.toString();
        const userRankIndex = allSorted.findIndex(u => u.user.toString() === userIdStr);

        res.json({
            leaderboard,
            userRank: userRankIndex !== -1 ? userRankIndex + 1 : null
        });
    } catch (err) {
        console.error('❌ Error fetching daily leaderboard:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFullLeaderboard = async (req, res) => {
    console.log('🔁 Entered getFullLeaderboard');
    try {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(todayStart);
        monthStart.setMonth(monthStart.getMonth() - 1);

        async function getLeaderboardFor(field, timeframeStart = null) {
            const sortObj = {};
            sortObj[field] = -1;

            const query = {};
            if (field === 'xpToday' && timeframeStart) {
                query.lastReset = { $gte: timeframeStart };
                query[field] = { $gt: 0 };
            }

            const top = await XP.find(query)
                .sort(sortObj)
                .limit(20)
                .populate('user', 'name profilePic');

            const leaderboard = top.map((entry, index) => ({
                rank: index + 1,
                userId: entry.user._id,
                name: entry.user.name,
                profilePic: entry.user.profilePic,
                value: entry[field] || 0
            }));

            const all = await XP.find(query).sort(sortObj).select('user');
            const userIdStr = req.user.id.toString();
            const idx = all.findIndex(u => u.user.toString() === userIdStr);
            const userRank = idx !== -1 ? idx + 1 : null;

            return { leaderboard, userRank };
        }

        const global = await getLeaderboardFor('xp');
        const daily = await getLeaderboardFor('xpToday', todayStart);
        const weekly = await getLeaderboardFor('xpToday', weekStart);
        const monthly = await getLeaderboardFor('xpToday', monthStart);

        const userXP = await XP.findOne({ user: req.user.id });
        const streak = userXP ? userXP.streak : 0;

        let streakBadge = null;
        if (streak >= 30) streakBadge = '🏆 30-Day Streak';
        else if (streak >= 7) streakBadge = '🏅 7-Day Streak';
        else if (streak >= 3) streakBadge = '🔥 3-Day Streak';

        res.json({
            global,
            daily,
            weekly,
            monthly,
            streakBadge
        });
    } catch (err) {
        console.error('❌ Error fetching full leaderboard:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
