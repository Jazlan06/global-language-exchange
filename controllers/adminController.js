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

exports.tempBanUser = async (req, res) => {
    const {userId} = req.params;
    const {days} = req.body;

    const banUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(userId, {
        bannedUntil: banUntil})

     res.json({
        message : `User banned until ${banUntil.toISOString()}`
     });
};