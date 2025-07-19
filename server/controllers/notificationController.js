const Notification = require('../models/Notification');
const User = require('../models/User');
const { onlineUsers } = require('../sockets/socketManager'); 

exports.sendNotification = async (req, res) => {
    const { receiverId, type, message } = req.body;

    try {
        const notification = await Notification.create({
            sender: req.user.id,
            receiver: receiverId,
            type,
            text: message
        });

        const io = req.app.get('io');
        const socketId = onlineUsers.get(receiverId);
        if (socketId) {
            io.to(socketId).emit('notification', notification);
        }

        res.status(201).json(notification);
    } catch (err) {
        console.error('❌ Error in sendNotification:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user.id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name email');

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found.' });
        }
        res.json(notifications);
    } catch (error) {
        console.error('❌ Error in getNotifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        res.json({ message: 'Marked as read', notification });
    } catch (error) {
        console.error('❌ Error in markAsRead:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteNotification = async (req, res) => {
    try {
        const delted = await Notification.findByIdAndDelete(req.params.id);
        if (!delted) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        res.json({ message: 'Notification deleted successfully.' });
    } catch (error) {
        console.error('❌ Error in deleteNotification:', error);
        res.status(500).json({ message: 'Server error' });

    }
}

exports.broadcastAnnouncement = async (req, res) => {
    try {
        const { message } = req.body;
        const users = await User.find({
            _id: {
                $ne: req.user.id
            }
        }).select('_id');

        const notifications = users.map(user => ({
            sender: req.user.id,
            receiver: user._id,
            type: 'announcement',
            text: message
        }));

        const insertedNotifications = await Notification.insertMany(notifications);

        const io = req.app.get('io');
        insertedNotifications.forEach(notification =>{
            const socketId = onlineUsers.get(notification.receiver.toString());
            if(socketId){
                io.to(socketId).emit('notification', notification);
            }
        })

        res.json({
            message: `Announcement sent to all users.`
        })
    } catch (err) {
        console.error('❌ Error in broadcastAnnouncement:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            receiver: req.user.id,
            isRead: false
        });

        res.json({ unreadCount: count })
    } catch (err) {
        console.error('❌ Error in getUnreadCount:', err);
        res.status(500).json({ message: 'Server error' });
    }
}