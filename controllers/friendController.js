const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res) => {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
        return res.status(400).json({ message: "You can't send a request to yourself." });
    }

    try {
        const existing = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });

        if (existing) {
            return res.status(400).json({ message: 'Friend request already sent.' });
        }

        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId
        });

        await newRequest.save();
        // Create a notification for the receiver
        await Notification.create({
            type: 'friend_request',
            sender: senderId,
            receiver: receiverId,
            text: `${req.user.name} has sent you a friend request.`
        });

        res.status(201).json({ message: 'Friend request sent successfully.' });
    } catch (error) {
        console.error('❌ Error in sendRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

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
            type : 'request_accepted',
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
            return res.status(404).json({ message: 'No pending friend requests.' });
        }

        res.json(requests);
    } catch (error) {
        console.error('❌ Error in getPendingRequests:', error);
        res.status(500).json({ message: 'Server error' });

    }
}