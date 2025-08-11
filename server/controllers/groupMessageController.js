const GroupMessage = require('../models/GroupMessage');
const Group = require('../models/Group');

exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await GroupMessage.find({
            group: groupId
        }).populate('sender', 'name');
        res.json(messages)
    } catch (err) {
        console.error('Error fetching group messages:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteGroupMessage = async (req, res) => {
    try {
        const { groupId, messageId } = req.params;
        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.admins.includes(req.user.id)) {
            return res.status(403).json({ message: 'Only admins can delete messages' });
        }
        await GroupMessage.findByIdAndDelete(messageId);
        res.json({
            message: 'Message deleted'
        })
    } catch (err) {
        console.error('Error deleting group message:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.sendGroupMessage = async (req, res) => {
    try {
        console.log("Inside")
        const { text } = req.body;
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'Access denied or group not found' });
        }

        const message = new GroupMessage({
            sender: req.user.id,
            group: groupId,
            text,
        });

        await message.save();
        await message.populate('sender', 'name');

        req.app.get('io').to(groupId.toString()).emit('group_message', {
            groupId: groupId.toString(),
            text: message.text,
            sender: {
                _id: message.sender._id,
                name: message.sender.name,
            },
            createdAt: message.createdAt,
        });

        res.status(201).json({ message: 'Message sent', data: message });
    } catch (err) {
        console.error('Error sending group message:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

