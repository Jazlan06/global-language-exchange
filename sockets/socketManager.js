const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const FriendRequest = require('../models/FriendRequest');
const GroupMessage = require('../models/GroupMessage');

const onlineUsers = new Map();
const notifyFriendsStatus = async (userId, status, io) => {
    const sent = await FriendRequest.find({ sender: userId, status: 'accepted' });
    const received = await FriendRequest.find({ receiver: userId, status: 'accepted' });

    const friendIds = [
        ...sent.map(r => r.receiver.toString()),
        ...received.map(r => r.sender.toString())
    ];

    friendIds.forEach(friendId => {
        const friendSocketId = onlineUsers.get(friendId);
        if (friendSocketId) {
            io.to(friendSocketId).emit('friend_status_update', {
                userId,
                status
            });
        }
    });
};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔗 User connected:', socket.id);

        socket.on('join_group', ({ groupId }) => {
            socket.join(groupId);
            console.log(`🧑‍🤝‍🧑 Socket ${socket.id} joined group ${groupId}`);
        });

        socket.on('send_group_msg', async ({ groupId, message }) => {
            try {
                const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
                if (!userId) return;
                const newMessage = await GroupMessage.create({
                    group: groupId,
                    sender: userId,
                    text: message
                });

                io.to(groupId).emit('group_message', {
                    groupId,
                    sender: userId,
                    text: message,
                    createdAt: newMessage.createdAt
                });
            } catch (err) {
                console.error('❌ Error sending group message:', err.message);
            }
        })

        socket.on('join', async (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;

                onlineUsers.set(userId, socket.id);
                await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

                console.log(`✅ User ${userId} joined with socket ID: ${socket.id}`);

                await notifyFriendsStatus(userId, 'online', io);

            } catch (error) {
                console.error('❌ Error joining socket:', error.message);
                socket.emit('error', { message: 'Authentication failed' });
            }
        });

        socket.on('send_message', ({ receipientId, message }) => {
            const receipentSocket = onlineUsers.get(receipentId);
            if (receipentSocket) {
                io.to(receipentSocket).emit('receive_message', {
                    from: message.sender,
                    text: message.text,
                    originalText: message.text,
                    chatId: message.chatId,
                    createdAt: new Date()
                });
            }
        });

        socket.on('webrtc_offer', ({ to, offer }) => {
            const receipentSocket = onlineUsers.get(to);
            if (receipentSocket) {
                io.to(receipentSocket).emit('webrtc_offer', {
                    from: socket.id,
                    offer
                });
            }
        });

        socket.on('webrtc_answer', ({ to, answer }) => {
            const receipentSocket = onlineUsers.get(to);
            if (receipentSocket) {
                io.to(receipentSocket).emit('webrtc_answer', {
                    from: socket.id,
                    answer
                });
            }
        });

        socket.on('webrtc_ice_candidate', ({ to, candidate }) => {
            const receipentSocket = onlineUsers.get(to);
            if (receipentSocket) {
                io.to(receipentSocket).emit('webrtc_ice_candidate', {
                    from: socket.id,
                    candidate
                });
            }
        });

        socket.on('disconnect', async () => {
            console.log('🔌 User disconnected:', socket.id);

            const userId = [...onlineUsers.entries()].find(([_, sId]) => sId === socket.id)?.[0];
            if (userId) {
                onlineUsers.delete(userId);
                await User.findByIdAndUpdate(userId, { isOnline: false, socketId: '' });
                console.log(`❌ User ${userId} disconnected`);
                await notifyFriendsStatus(userId, 'offline', io);
            }
        });
    });
};


module.exports.onlineUsers = onlineUsers;
