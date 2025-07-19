const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const FriendRequest = require('../models/FriendRequest');
const FlaggedMessage = require('../models/FlaggedMessage');
const ReportedUser = require('../models/ReportedUser');
const CallSession = require('../models/CallSession');
const XP = require('../models/XP');
const XpHistory = require('../models/XpHistory');
const CompletedChallenge = require('../models/CompletedChallenge');
const moment = require('moment');

exports.getXpTrends = async (req, res) => {
    try {
        const today = moment().startOf('day');
        const last7Days = [...Array(7)].map((_, i) => today.clone().subtract(i, 'days').format('YYYY-MM-DD'));

        const xpByDate = await XpHistory.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: moment().subtract(7, 'days').toDate()
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalXp: { $sum: "$xp" }
                }
            }
        ]);

        const xpData = last7Days.map(date => {
            const day = xpByDate.find(d => d._id === date);
            return { date, xp: day ? day.totalXp : 0 };
        });
        res.json(xpData.reverse());
    } catch (err) {
        console.error('Error fetching XP trends:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getChallengeParticipation = async (req, res) => {
    try {
        const today = moment().startOf('day');
        const last7Days = [...Array(7)].map((_, i) => today.clone().subtract(i, 'days').format('YYYY-MM-DD'));

        const participation = await CompletedChallenge.aggregate([
            {
                $match: {
                    date: { $in: last7Days }
                }
            },
            {
                $group: {
                    _id: "$date",
                    totalCompleted: { $sum: 1 }
                }
            }
        ]);

        const data = last7Days.map(date => {
            const entry = participation.find(p => p._id === date);
            return { date, completed: entry ? entry.totalCompleted : 0 };
        });
        res.json(data.reverse());
    } catch (err) {
        console.error('Error fetching challenge participation:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getUserEngagement = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const activeUsers = await User.countDocuments({
            lastActiveDate: { $gte: since }
        });

        res.json({
            days,
            activeUsers
        })
    } catch (err) {
        console.error('Error fetching engagement stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getAllUsers = async (req, res) => {
    const users = await User.find({}, '-passwordHash');
    res.json(users);
};

exports.getReportedUsers = async (req, res) => {
    const reports = await ReportedUser.find()
        .populate('reporter', 'name email')
        .populate('reported', 'name email');

    res.json(reports);
};

exports.tempBanUser = async (req, res) => {
    const { userId } = req.params;
    const { days } = req.body;

    const banUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(userId, {
        bannedUntil: banUntil
    })

    res.json({
        message: `User banned until ${banUntil.toISOString()}`
    });
};

exports.getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalUsers,
            onlineUsers,
            activeToday,
            totalChats,
            messagesToday,
            totalMessages,
            totalFriendRequests,
            pendingFriendRequests,
            flaggedMessages,
            reportedUsers,
            bannedUsers,
            callsToday,
            topXPUsers
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isOnline: true }),
            User.countDocuments({ lastActiveDate: { $gte: startOfToday } }),
            Chat.countDocuments(),
            Message.countDocuments({ createdAt: { $gte: startOfToday } }),
            Message.countDocuments(),
            FriendRequest.countDocuments(),
            FriendRequest.countDocuments({ status: 'pending' }),
            FlaggedMessage.countDocuments(),
            ReportedUser.countDocuments(),
            User.countDocuments({ isBanned: true }),
            CallSession.countDocuments({ startedAt: { $gte: startOfToday } }),
            XP.find({})
                .sort({ xp: -1 })
                .limit(5)
                .populate('user', 'name email')
        ]);

        res.json({
            totalUsers,
            onlineUsers,
            activeToday,
            totalChats,
            totalMessages,
            messagesToday,
            totalFriendRequests,
            pendingFriendRequests,
            flaggedMessages,
            reportedUsers,
            bannedUsers,
            callsToday,
            topXPUsers: topXPUsers.map(entry => ({
                name: entry.user.name,
                email: entry.user.email,
                xp: entry.xp,
                streak: entry.streak
            }))
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};