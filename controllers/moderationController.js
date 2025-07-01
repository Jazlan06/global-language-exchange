const FlaggedMessage = require('../models/FlaggedMessage');
const Message = require('../models/Message');

exports.flagMessage = async (req, res) => {
    const{messageId, reason} = req.body;

    const existing = await FlaggedMessage.findOne({ messageId, flaggedBy: req.user.id });
    if(existing) {
        return res.status(400).json({message: "You have already flagged this message."});
    }

    const flag = await FlaggedMessage.create({
        messageId,
        flaggedBy: req.user.id,
        reason
    });
    if(!flag) {
        return res.status(500).json({message: "Failed to flag message."});
    }

    res.status(200).json({message: "Message flagged for review", flag});
}

exports.getFlaggedMessages = async (req, res) => {
    const flags = await FlaggedMessage.find()
        .populate('messageId')
        .populate('flaggedBy', 'name email')

    res.json(flags);    
};