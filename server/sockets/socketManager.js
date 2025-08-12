const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const FriendRequest = require('../models/FriendRequest');
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const Subscription = require('../models/Subscription');
const { sendPushNotification } = require('../controllers/pushController');
const emitUpdatedDashboardStats = require('../utils/emitUpdatedDashboardStats');

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

        socket.on('send_group_msg', async ({ groupId, text }) => {
            try {
                const userId = [...onlineUsers.entries()].find(([uid, sid]) => sid === socket.id)?.[0];
                if (!userId) return;

                const group = await Group.findById(groupId);
                if (!group) return;

                const groupMessage = new GroupMessage({
                    group: groupId,
                    sender: userId,
                    text,
                });

                await groupMessage.save();

                const populated = await groupMessage.populate('sender', 'name');

                io.to(groupId).emit('group_message', {
                    ...populated.toObject(),
                    groupId: groupId,
                });

            } catch (err) {
                console.error('❌ Error sending group message:', err);
            }
        });


        socket.on('group_typing', ({ groupId }) => {
            socket.to(groupId).emit('group_typing', {
                groupId,
                userId: socket.user?.id,
            });
        });

        socket.on('group_typing_stop', ({ groupId }) => {
            socket.to(groupId).emit('group_typing_stop', {
                groupId,
                userId: socket.user?.id,
            });
        });


        socket.on('join', async (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;
                socket.user = { id: userId };
                onlineUsers.set(userId, socket.id);
                await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

                console.log(`✅ User ${userId} joined with socket ID: ${socket.id}`);
                socket.emit('joined_success');

                await notifyFriendsStatus(userId, 'online', io);
                await emitUpdatedDashboardStats(io);

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
                await emitUpdatedDashboardStats(io);


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
                } else {
                    try {
                        const pushSub = await Subscription.findOne({ user: recipient._id });
                        if (pushSub) {
                            await sendPushNotification(recipient._id.toString(), {
                                title: message.sender.name || 'New Message',
                                body: message.text,
                                icon: '/chat-icon.png',
                                data: {
                                    url: '/chat'
                                }
                            });
                        }
                    } catch (err) {
                        console.error('❌ Error sending push notification:', err.message);
                    }
                }

            } catch (err) {
                console.error('Error sending socket message:', err);
            }
        });

        socket.on('webrtc_offer', ({ chatId, signal }) => {
            if (!chatId || !signal) return;
            socket.to(chatId).emit('webrtc_offer', {
                signal,
                from: socket.user?.id
            });
        });

        socket.on('webrtc_answer', ({ chatId, signal }) => {
            if (!chatId || !signal) return;
            socket.to(chatId).emit('webrtc_answer', {
                signal,
                from: socket.user?.id
            });
        });

        socket.on('call_ended', ({ chatId }) => {
            socket.to(chatId).emit('call_ended', {
                from: socket.user?.id
            });
        });

        socket.on('incoming_call', ({ to, fromUser, chatId, offer }) => {
            const recipientSocket = onlineUsers.get(to);
            if (recipientSocket) {
                io.to(recipientSocket).emit('incoming_call', {
                    fromUser,
                    chatId,
                    offer
                });
                console.log(`📞 Incoming call from ${fromUser._id} to ${to}`);
            }

        });

        socket.on('call_declined', ({ chatId }) => {
            socket.to(chatId).emit('call_declined', {
                from: socket.user?.id
            });
        });

        socket.on('webrtc_candidate', ({ chatId, candidate }) => {
            if (!chatId || !candidate) return;
            socket.to(chatId).emit('webrtc_candidate', {
                candidate,
                from: socket.user?.id
            });
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

        socket.on('join_room', ({ chatId }) => {
            socket.join(chatId);
            console.log(`👥 Socket ${socket.id} joined room ${chatId}`);
        });


        socket.on('start_call', async ({ chatId, receiverId }) => {
            try {
                const senderId = socket.user?.id;
                if (!senderId || !receiverId || !chatId) return;

                // Join caller to the room
                socket.join(chatId);

                // Get receiver socket
                const recipientSocketId = onlineUsers.get(receiverId);
                if (recipientSocketId) {
                    // Make sure receiver joins room
                    const recipientSocket = io.sockets.sockets.get(recipientSocketId);
                    if (recipientSocket) recipientSocket.join(chatId);

                    // Get full sender user data
                    const fromUser = await User.findById(senderId).select('_id name profilePic');

                    // Send incoming call to receiver
                    io.to(recipientSocketId).emit('incoming_call', {
                        chatId,
                        fromUser,
                    });
                    await emitUpdatedDashboardStats(io);

                    console.log(`📞 Incoming call from ${fromUser.name} (${senderId}) ➡️ ${receiverId}`);
                } else {
                    console.log(`⚠️ Receiver ${receiverId} is offline. Cannot send call.`);
                }

            } catch (err) {
                console.error('❌ Error in start_call:', err.message);
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
