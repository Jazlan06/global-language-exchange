const User = require('../models/User');
const ReportedUser = require('../models/ReportedUser');

exports.getAllUsers = async (req, res) => {
    const users = await User.find({}, '-passwordHash');
    res.json(users);
};

exports.getReportedUsers = async (req, res) => {
    const reports = await ReportedUser.find()
        .populate('reporter', 'name email')
        .populate('reported', 'name email');

    res.json(reports);
};

exports.banUser = async (req, res) => {
    const {userId} = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User banned successfully' });
};