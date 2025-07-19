const Group = require('../models/Group');

exports.createGroup = async (req, res) => {
    try {
        const { name, description, topic, languageLevel } = req.body;

        const group = new Group({
            name,
            description,
            topic,
            languageLevel,
            members: [req.user.id],
            admins: [req.user.id],
        })
        await group.save();
        res.status(201).json({ message: 'Group created', group });
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.listGroups = async (req, res) => {
    try {
        const groups = await Group.find().select('name description topic languageLevel members admins');
        res.json(groups);
    } catch (err) {
        console.error('Error fetching group:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId).populate('members', 'username').populate('admins', 'username');
        if (!group) return res.status(404).json({ message: 'Group Not Found' });
        res.json(group);
    } catch (err) {
        console.error('Error fetching group:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

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
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'Not a member' });
        }

        group.members = group.members.filter(memberId => memberId.toString() !== req.user.id);
        group.admins = group.admins.filter(adminId => adminId.toString() !== req.user.id);

        await group.save();
        res.json({ message: 'Left group', groupId: group._id });
    } catch (err) {
        console.error('Error leaving group:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

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