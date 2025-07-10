const User = require('../models/User');
const Message = require('../models/Message');
const CallSession = require('../models/CallSession');
const FriendRequest = require('../models/FriendRequest');
const badges = require('../utils/badges');

async function awardBadge(userId, badgeKey) {
    const user = await User.findById(userId);
    if (!user || user.badges.includes(badgeKey)) return;

    user.badges.push(badgeKey);
    await user.save();

    return badgeKey;
}

exports.checkBadgesForUser = async (req, res) => {
    const awarded = [];

    if (user.streak >= 7) {
        awarded.push(await awardBadge(user._id, badges.STREAK_7_DAYS.key));
    } else if (user.streak >= 3) {
        awarded.push(await awardBadge(user._id, badges.STREAK_3_DAYS.key));
    }

    const callCount = await CallSession.countDocuments({
        $or: [{ caller: user._id }, { receiver: user._id }]
    });
    if (callCount === 1) {
        awarded.push(await awardBadge(user._id, badges.FIRST_CALL.key))
    }

    const messageCount = await Message.countDocuments({ sender: user._id });
    if (messageCount >= 100) {
        awarded.push(await awardBadge(user._id, badges.MSG_100.key));
    }

    const friends = await FriendRequest.countDocuments({
        $or: [{ sender: user._id }, { receiver: user._id }],
        status: 'accepted'
    })
    if (friends >= 8) {
        awarded.push(await awardBadge(user._id, badges.FRIEND_5.key));
    }

    return awarded.filter(Boolean);
}