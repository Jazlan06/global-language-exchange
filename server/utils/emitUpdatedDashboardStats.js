// utils/emitUpdatedDashboardStats.js
const User = require('../models/User');
const Message = require('../models/Message');
const CallSession = require('../models/CallSession');
const FriendRequest = require('../models/FriendRequest');
const FlaggedMessage = require('../models/FlaggedMessage');
const ReportedUser = require('../models/ReportedUser');

module.exports = async function emitUpdatedDashboardStats(io) {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalUsers,
            onlineUsers,
            activeToday,
            totalMessages,
            messagesToday,
            callsToday,
            totalFriendRequests,
            pendingFriendRequests,
            flaggedMessages,
            reportedUsers,
            bannedUsers,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isOnline: true }),
            User.countDocuments({ lastActiveDate: { $gte: startOfToday } }),
            Message.countDocuments(),
            Message.countDocuments({ createdAt: { $gte: startOfToday } }),
            CallSession.countDocuments({ startedAt: { $gte: startOfToday } }),
            FriendRequest.countDocuments(),
            FriendRequest.countDocuments({ status: 'pending' }),
            FlaggedMessage.countDocuments(),
            ReportedUser.countDocuments(),
            User.countDocuments({ isBanned: true }),
        ]);

        io.emit('admin_stats_update', {
            totalUsers,
            onlineUsers,
            activeToday,
            totalMessages,
            messagesToday,
            callsToday,
            totalFriendRequests,
            pendingFriendRequests,
            flaggedMessages,
            reportedUsers,
            bannedUsers,
        });

    } catch (error) {
        console.error('❌ Failed to emit updated dashboard stats:', error);
    }
}
