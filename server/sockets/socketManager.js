const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
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
        });

        socket.on('join', async (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;
                socket.user = { id: userId };
                onlineUsers.set(userId, socket.id);
                await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

                console.log(`✅ User ${userId} joined with socket ID: ${socket.id}`);
                await notifyFriendsStatus(userId, 'online', io);
            } catch (error) {
                console.error('❌ Error joining socket:', error.message);
                socket.emit('error', { message: 'Authentication failed' });
            }
        });

        socket.on('send_message', async ({ chatId, text }) => {
            try {
                const senderId = socket.user?.id;
                if (!senderId) {
                    console.warn('⚠️ senderId missing in send_message');
                    return;
                }

                const chat = await Chat.findById(chatId);
                if (!chat) return;

                const recipientId = chat.participants.find(
                    id => id.toString() !== senderId
                );
                const recipient = await User.findById(recipientId);

                const message = await Message.create({
                    chat: chatId,
                    sender: senderId,
                    text,
                });

                await message.populate('sender', 'name profilePic');

                // Emit to sender (confirmation)
                socket.emit('receive_message', {
                    chatId,
                    text: message.text,
                    createdAt: message.createdAt,
                    from: {
                        _id: senderId,
                        name: message.sender.name,
                        profilePic: message.sender.profilePic,
                    }
                });

                if (recipient?.socketId) {
                    io.to(recipient.socketId).emit('receive_message', {
                        chatId,
                        text: message.text,
                        createdAt: message.createdAt,
                        from: {
                            _id: senderId,
                            name: message.sender.name,
                            profilePic: message.sender.profilePic,
                        }
                    });
                }
            } catch (err) {
                console.error('Error sending socket message:', err);
            }
        });

        socket.on('webrtc_offer', ({ to, offer }) => {
            const recipientSocket = onlineUsers.get(to);
            if (recipientSocket) {
                io.to(recipientSocket).emit('webrtc_offer', {
                    from: socket.id,
                    offer
                });
            }
        });

        socket.on('webrtc_answer', ({ to, answer }) => {
            const recipientSocket = onlineUsers.get(to);
            if (recipientSocket) {
                io.to(recipientSocket).emit('webrtc_answer', {
                    from: socket.id,
                    answer
                });
            }
        });

        socket.on('webrtc_ice_candidate', ({ to, candidate }) => {
            const recipientSocket = onlineUsers.get(to);
            if (recipientSocket) {
                io.to(recipientSocket).emit('webrtc_ice_candidate', {
                    from: socket.id,
                    candidate
                });
            }
        });

        socket.on('user_typing', ({ chatId, to }) => {
            const recipientSocketId = onlineUsers.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_typing', {
                    chatId,
                    from: socket.user?.id,
                });
            }
        });

        socket.on('user_typing_stop', ({ chatId, to }) => {
            const recipientSocketId = onlineUsers.get(to);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_typing_stop', {
                    chatId,
                    from: socket.user?.id,
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
