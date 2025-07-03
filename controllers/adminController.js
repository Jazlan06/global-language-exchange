const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const FriendRequest = require('../models/FriendRequest');
const FlaggedMessage = require('../models/FlaggedMessage');
const ReportedUser = require('../models/ReportedUser');
const CallSession = require('../models/CallSession');
const XP = require('../models/XP');

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