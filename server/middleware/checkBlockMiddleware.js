const BlockedUser = require('../models/BlockedUser');

module.exports = async function (req, res, next) {
    try {
        const userId = req.user.id;

        const otherUserId =
            req.body.otherUserId ||
            req.body.receiverId ||
            req.body.receiver ||
            req.body.sender ||
            req.query.otherUserId ||
            req.params.otherUserId;

        if (!otherUserId) {
            return res.status(400).json({ message: 'Other user ID is required for block check' });
        }

        const userBlocked = await BlockedUser.findOne({
            blocker: userId,
            blocked: otherUserId,
        });

        const blockedByUser = await BlockedUser.findOne({
            blocker: otherUserId,
            blocked: userId,
        });

        if (userBlocked || blockedByUser) {
            return res.status(403).json({ message: 'Action not allowed due to blocking' });
        }

        next();
    } catch (error) {
        console.error('Error in block check middleware:', error);
        res.status(500).json({ message: 'Server error during block check' });
    }
};