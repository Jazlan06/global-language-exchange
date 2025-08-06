const Chat = require('../models/Chat'); 
const BlockedUser = require('../models/BlockedUser');

module.exports = async function (req, res, next) {
    try {
        const userId = req.user._id.toString(); 

        let otherUserId =
            req.body?.otherUserId ||
            req.body?.receiverId ||
            req.body?.receiver ||
            req.body?.sender ||
            req.body?.senderId ||
            req.query?.otherUserId ||
            req.params?.otherUserId;

        if (!otherUserId && req.body?.chatId) {
            const chat = await Chat.findById(req.body.chatId);
            if (!chat) {
                return res.status(404).json({ message: 'Chat not found for block check' });
            }
            otherUserId = chat.participants.find(p => p.toString() !== userId);
            otherUserId = otherUserId.toString(); 
        }

        if (!otherUserId) {
            console.warn('🚫 Block check middleware failed: missing otherUserId');
            return res.status(400).json({ message: 'Other user ID is required for block check' });
        }

        console.log('Block check userId:', userId, 'otherUserId:', otherUserId);

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
