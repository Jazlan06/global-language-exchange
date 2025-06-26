const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
       const notifications = await Notification.find({receiver: req.user.id})
       .sort({createdAt: -1})
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

exports.markAsRead = async(req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
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