const Chat = require('../models/Chat');
const Message = require('../models/Message');
const BlockedUser = require('../models/BlockedUser');
const badgeService = require('../services/badgeService');
const mongoose = require('mongoose');

exports.createOrGetChat = async (req, res) => {
    const { recipientId } = req.body;
    const userId = req.user.id;

    try {
        const isBlocked = await BlockedUser.findOne({
            $or: [
                { blocker: userId, blocked: recipientId },
                { blocker: recipientId, blocked: userId }
            ]
        });

        if (isBlocked) {
            return res.status(403).json({ message: 'Chat not allowed. One of the users has blocked the other.' });
        }

        let chat = await Chat.findOne({
            participants: { $all: [userId, recipientId] }
        }).populate('participants', 'name email');

        if (!chat) {
            chat = new Chat({ participants: [userId, recipientId] });
            await chat.save();
            chat = await Chat.findById(chat._id).populate('participants', 'name email');
        }

        res.json(chat);
    } catch (err) {
        console.error('Error in createOrGetChat:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    const { chatId, text } = req.body;
    const sender = req.user._id.toString(); 

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: 'Invalid chatId format' });
    }

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const recipient = chat.participants.find(p => p.toString() !== sender);
        if (!recipient) return res.status(400).json({ message: 'Invalid chat participants' });

        const isBlocked = await BlockedUser.findOne({
            $or: [
                { blocker: sender, blocked: recipient },
                { blocker: recipient, blocked: sender }
            ]
        });

        if (isBlocked) {
            return res.status(403).json({ message: 'Message blocked. One of the users has blocked the other.' });
        }

        const message = await Message.create({
            chat: chatId,
            sender,
            text,
        });

        chat.updatedAt = Date.now();
        await chat.save();
        await badgeService.checkBadgesForUser(req.user);

        const populatedMessage = await message.populate('sender', 'name email');

        res.json(populatedMessage);
    } catch (err) {
        console.error('Error in sendMessage:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getChats = async (req, res) => {
    try {

        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', 'name email')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (err) {
        console.error('Error in getChats:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMessages = async (req, res) => {
    const chatId = req.params.chatId;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        return res.status(400).json({ message: 'Invalid chatId format' });
    }

    try {
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'name email')
            .sort({ createdAt: 1 });

        if (!messages || messages.length === 0) {
            return res.json(messages || []);
        }

        res.json(messages);
    } catch (err) {
        console.error('Error in getMessages:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
