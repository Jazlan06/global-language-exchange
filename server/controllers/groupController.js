const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');

exports.createGroup = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: user info missing' });
        }

        const { name, description, topic, languageLevel, participants = [] } = req.body;

        const uniqueMembers = [...new Set([req.user.id, ...participants])];

        const group = new Group({
            name,
            description,
            topic,
            languageLevel,
            members: uniqueMembers,
            admins: [req.user.id],
        });

        await group.save();
        await group.populate('members', 'name email');
        res.status(201).json({ message: 'Group created', group });
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.listGroups = async (req, res) => {
    try {
        const groups = await Group.find().select('name description topic languageLevel members admins');
        res.json({ groups });
    } catch (err) {
        console.error('Error fetching group:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('members', 'name')
            .populate('admins', 'name');

        if (!group) return res.status(404).json({ message: 'Group Not Found' });

        const messages = await GroupMessage.find({ group: req.params.groupId })
            .populate('sender', 'username')
            .sort({ createdAt: 1 });

        res.json({
            group,
            messages
        });
    } catch (err) {
        console.error('Error fetching group:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        group.members.push(req.user.id);
        await group.save();
        res.json({ message: 'Joined group', groupId: group._id });
    } catch (err) {
        console.error('Error joining group:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.leaveGroup = async (req, res) => {
    try {
        const userId = req.body.userId || req.user.id;

        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const isSelf = req.user.id === userId;
        const isAdmin = group.admins.includes(req.user.id);
        if (!isSelf && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to remove others' });
        }

        group.members = group.members.filter(id => id.toString() !== userId);
        group.admins = group.admins.filter(id => id.toString() !== userId);

        await group.save();
        res.json({ message: 'User removed from group', groupId: group._id });
    } catch (err) {
        console.error('Error leaving/removing user from group:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addAdmin = async (req, res) => {
    try {
        const { userIdToAdd } = req.body;
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.admins.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!group.members.includes(userIdToAdd)) {
            return res.status(400).json({ message: 'User not a member' });
        }
        if (group.admins.includes(userIdToAdd)) {
            return res.status(400).json({ message: 'User already an admin' });
        }
        group.admins.push(userIdToAdd);
        await group.save();
        res.json({
            message: 'Admin Added',
            groupId: group._id
        })
    } catch (err) {
        console.error('Error adding admin:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.removeAdmin = async (req, res) => {
    try {
        const { userIdToRemove } = req.body;

        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.admins.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!group.admins.includes(userIdToRemove)) {
            return res.status(400).json({ message: 'User is not an admin' });
        }

        group.admins = group.admins.filter(adminId => adminId.toString() !== userIdToRemove);
        await group.save();
        res.json({
            message: 'Admin Removed',
            groupId: group._id
        })
    } catch (err) {
        console.error('Error removing admin:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.admins.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await group.remove();
        res.json({
            message: 'Group Deleted'
        })
    } catch (err) {
        console.error('Error deleting group:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getUnreadCounts = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId });

        const unreadCounts = {};

        for (const group of groups) {
            const count = await GroupMessage.countDocuments({
                group: group._id,
                readBy: { $ne: userId },
            });
            unreadCounts[group._id] = count;
        }

        res.json(unreadCounts);
    } catch (err) {
        console.error('Error in getUnreadCounts:', err);
        res.status(500).json({ message: 'Failed to fetch unread counts' });
    }
};

exports.markGroupAsRead = async (req, res) => {
    const userId = req.user._id;
    const groupId = req.params.groupId;

    try {
        await GroupMessage.updateMany(
            { group: groupId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );

        res.json({ message: 'Marked as read' });
    } catch (err) {
        console.error('Error marking messages as read:', err);
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
};

exports.editGroup = async (req, res) => {
    const { name, description, topic, languageLevel } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.admins.includes(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized' });
    }

    if (name) group.name = name;
    if (description) group.description = description;
    if (topic) group.topic = topic;
    if (languageLevel) group.languageLevel = languageLevel;

    await group.save();
    res.json({ message: 'Group updated', group });
};
