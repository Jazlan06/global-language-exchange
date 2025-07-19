const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

const cleanupOnlineUsers = async (io, onlineUsers) => {
    console.log('🧹 Running cleanup for stale socket connections...');

    const allOnlineUsers = await User.find({ isOnline: true });

    for (const user of allOnlineUsers) {
        const socketId = user.socketId;

        const socketIsActive = io.sockets.sockets.has(socketId);

        if (!socketIsActive) {
            console.log(`❌ Stale socket for user ${user._id}. Cleaning up.`);

            user.isOnline = false;
            user.socketId = '';
            await user.save();

            onlineUsers.delete(user._id.toString());

            const sent = await FriendRequest.find({ sender: user._id, status: 'accepted' });
            const received = await FriendRequest.find({ receiver: user._id, status: 'accepted' });

            const friendIds = [
                ...sent.map(r => r.receiver.toString()),
                ...received.map(r => r.sender.toString())
            ];

            friendIds.forEach(friendId => {
                const friendSocketId = onlineUsers.get(friendId);
                if (friendSocketId) {
                    io.to(friendSocketId).emit('friend_status_update', {
                        userId: user._id.toString(),
                        status: 'offline'
                    });
                }
            });
        }
    }
};

module.exports = cleanupOnlineUsers;
