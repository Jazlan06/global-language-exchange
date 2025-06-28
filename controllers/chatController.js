const Chat = require('../models/Chat');
const Message = require('../models/Message');
// Create or get chat between two users
exports.createOrGetChat = async (req, res) => {
    const { recipientId } = req.body;
    const userId = req.user.id;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId, recipientId] }
        }).populate('participants', 'name email');

        if (!chat) {
            chat = new Chat({ participants: [userId, recipientId] });
            await chat.save();
        }

        res.json(chat);
    } catch (err) {
        console.error('Error in createOrGetChat:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Send message in chat
exports.sendMessage = async (req, res) => {
    const { chatId, text } = req.body;
    const sender = req.user.id;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const message = await Message.create({
            chat: chatId,
            sender,
            text
        });

        chat.updatedAt = Date.now();
        await chat.save();

        res.json(message);
    } catch (err) {
        console.error('❌ Error in sendMessage:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all chats for current user
exports.getChats = async (req, res) => {
    const userId = req.user.id;

    try {
        const chats = await Chat.find({
            participants: userId
        }).populate('participants', 'name email').sort({ updatedAt: -1 });

        res.json(chats);
    } catch (err) {
        console.error('Error in getChats:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
    const chatId = req.params.chatId;

    try {
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });

        if (!messages) {
            return res.status(404).json({ message: 'No messages found' });
        }

        res.json(messages);
    } catch (err) {
        console.error('❌ Error in getMessages:', err);
        res.status(500).json({ message: 'Server error' });
    }
};