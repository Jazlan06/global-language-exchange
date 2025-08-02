const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const BlockedUser = require('../models/BlockedUser');

exports.getFriendSuggestions = async (req, res) => {
    const userId = req.user.id;

    try {
        const blockedDocs = await BlockedUser.find({
            $or: [
                { blocker: userId },
                { blocked: userId }
            ]
        });

        const blockedUserIds = blockedDocs.flatMap(doc => [doc.blocker.toString(), doc.blocked.toString()])
            .filter(id => id !== userId);

        const accepted = await FriendRequest.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ],
            status: 'accepted'
        });

        const friendIds = accepted.flatMap(req => [req.sender.toString(), req.receiver.toString()])
            .filter(id => id !== userId);

        const pending = await FriendRequest.find({
            $or: [
                { sender: userId, status: 'pending' },
                { receiver: userId, status: 'pending' }
            ]
        });

        const pendingIds = pending.flatMap(req => [req.sender.toString(), req.receiver.toString()])
            .filter(id => id !== userId);

        const excludeIds = [...new Set([
            userId,
            ...blockedUserIds,
            ...friendIds,
            ...pendingIds
        ])];

        const suggestions = await User.find({
            _id: { $nin: excludeIds }
        }).select('name email');

        res.json(suggestions)
    } catch (error) {
        console.error('❌ Error in getFriendSuggestions:', error);
        res.status(500).json({ message: 'Server error while fetching friend suggestions' });
    }
}

exports.sendRequest = async (req, res) => {
    const senderId = req.user.id;
    const { receiverId, email } = req.body;
    console.log('📨 sendRequest body:', req.body);
console.log('🧑 senderId:', senderId);

    try {
        let targetId = receiverId;

        if (!receiverId && email) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(404).json({ message: 'User not found with that email' });
            }
            targetId = user._id;
        }

        if (!targetId) {
            return res.status(400).json({ message: 'Missing receiverId or email' });
        }

        if (senderId === targetId.toString()) {
            return res.status(400).json({ message: "You can't send a request to yourself." });
        }

        const existingFriend = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: targetId },
                { sender: targetId, receiver: senderId }
            ],
            status: 'accepted'
        });

        if (existingFriend) {
            return res.status(400).json({ message: 'Already friends.' });
        }

        const existingPending = await FriendRequest.findOne({
            sender: senderId,
            receiver: targetId,
            status: 'pending'
        });

        if (existingPending) {
            return res.status(400).json({ message: 'Friend request already sent.' });
        }

        const request = new FriendRequest({
            sender: senderId,
            receiver: targetId,
            status: 'pending'
        });

        await request.save();

        res.status(201).json({ message: 'Friend request sent.' });

    } catch (error) {
        console.error('❌ sendRequest error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.acceptRequest = async (req, res) => {
    const receiverId = req.user.id;
    const { senderId } = req.body;

    try {
        const request = await FriendRequest.findOneAndUpdate(
            { sender: senderId, receiver: receiverId, status: 'pending' },
            { status: 'accepted' },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: 'Friend request not found or already accepted.' });
        }

        await Notification.create({
            type: 'request_accepted',
            sender: receiverId,
            receiver: senderId,
            text: `${req.user.name} has accepted your friend request.`
        });

        res.json({ message: 'Friend request accepted successfully.' });
    }
    catch (error) {
        console.error('❌ Error in acceptRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.rejectRequest = async (req, res) => {
    const receiverId = req.user.id;
    const { senderId } = req.body;
    try {
        const request = await FriendRequest.findOneAndUpdate(
            { sender: senderId, receiver: receiverId, status: 'pending' },
            { status: 'rejected' },
            { new: true }
        );
        if (!request) {
            return res.status(404).json({ message: 'Friend request not found or already rejected.' });
        }
        res.json({ message: 'Friend request rejected successfully.', request });
    }
    catch (error) {
        console.error('❌ Error in rejectRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await FriendRequest.find({
            receiver: req.user.id,
            status: 'pending'
        }).populate('sender', 'name email');

        if (requests.length === 0) {
            return res.json([]);
        }

        res.json(requests);
    } catch (error) {
        console.error('❌ Error in getPendingRequests:', error);
        res.status(500).json({ message: 'Server error' });

    }
}

exports.getFriendList = async (req, res) => {
    const userId = req.user.id;
    try {
        const sentRequests = await FriendRequest.find({
            sender: userId,
            status: 'accepted'
        }).populate('receiver', 'name email');

        const receivedRequests = await FriendRequest.find({
            receiver: userId,
            status: 'accepted'
        }).populate('sender', 'name email');

        const friends = [
            ...sentRequests.map(req => req.receiver),
            ...receivedRequests.map(req => req.sender)
        ];

        if (friends.length === 0) {
            return res.json([]);
        }

        res.json(friends);
    } catch (error) {
        console.error('❌ Error in getFriendList:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getMutualFriends = async (req, res) => {
    res.status(501).json({ message: "Mutual friends feature not implemented yet." });
};
