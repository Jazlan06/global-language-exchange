const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

const onlineUsers = new Map(); // Map to store online users

module.exports = (io) => {
    io.on('connection', async (socket) => {
        console.log('🔗 User connected:', socket.id);

        // When a user joins with a token
        socket.on('join', async (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;

                onlineUsers.set(userId, socket.id);
                await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

                console.log(`✅ User ${userId} joined with socket ID: ${socket.id}`);
            } catch (error) {
                console.error('❌ Error joining socket:', error.message);
                socket.emit('error', { message: 'Authentication failed' });
            }
        });

        socket.on('send_message', ({ receipentId, message }) => {
            const receipentSocket = onlineUsers.get(receipentId);
            if (receipentSocket) {
                io.to(receipentSocket).emit('receive_message', {
                    from: message.sender,
                    text: message.text,
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
            }
        });
    });
};
