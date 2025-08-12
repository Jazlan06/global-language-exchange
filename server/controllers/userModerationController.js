const BlockedUser = require('../models/BlockedUser');
const ReportedUser = require('../models/ReportedUser');

exports.blockedUsers = async (req, res) => {
    try {
        const blockerId = req.user.id;
        const blocked = await BlockedUser.find({ blocker: blockerId }).select('blocked');
        const blockedIds = blocked.map(entry => entry.blocked.toString());
        return res.status(200).json(blockedIds);
    } catch (err) {
        console.error('Error fetching blocked users:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};


exports.blockUser = async (req, res) => {
    const blockerId = req.user.id;
    const { blockedId } = req.body;

    if (blockerId === blockedId) {
        return res.status(400).json({ message: "You cannot block yourself." });
    }

    try {
        const existing = await BlockedUser.findOne({
            blocker: blockerId,
            blocked: blockedId
        });

        if (existing) {
            return res.status(400).json({ message: "User is already blocked." });
        }

        const block = new BlockedUser({
            blocker: blockerId,
            blocked: blockedId
        });
        await block.save();
        return res.status(200).json({ message: "User blocked successfully." });
    } catch (err) {
        console.error('❌ Error blocking user:', err);
        return res.status(500).json({ message: "Server error" });
    }
}

exports.unblockUser = async (req, res) => {
    try {
        const blocker = req.user.id;
        const { blocked } = req.body;

        const blockRecord = await BlockedUser.findOne({ blocker, blocked });
        if (!blockRecord) {
            return res.status(404).json({ message: "Block record not found." });
        }

        await BlockedUser.deleteOne();
        return res.status(200).json({ message: "User unblocked successfully." });
    } catch (err) {
        console.error('❌ Error unblocking user:', err);
        return res.status(500).json({ message: "Server error" });
    }
}

exports.reportUser = async (req, res) => {
    const reporterId = req.user.id;
    const { reportedId, reason } = req.body;
    if (reporterId === reportedId) {
        return res.status(400).json({ message: "You cannot report yourself." });
    }
    try {
        const report = new ReportedUser({
            reporter: reporterId,
            reported: reportedId,
            reason
        });
        await report.save();
        return res.status(200).json({ message: "User reported successfully." });
    } catch (err) {
        console.error('❌ Error reporting user:', err);
        return res.status(500).json({ message: "Server error" });
    }
}