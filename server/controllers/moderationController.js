const FlaggedMessage = require('../models/FlaggedMessage');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

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

exports.dismissFlag = async (req, res) => {
  const { flagId } = req.body;

  if (!flagId) {
    return res.status(400).json({ message: "Flag ID is required" });
  }

  const flag = await FlaggedMessage.findById(flagId);
  if (!flag) {
    return res.status(404).json({ message: "Flag not found" });
  }

  await FlaggedMessage.findByIdAndDelete(flagId);

  res.json({ message: "Flag dismissed successfully" });
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    await Message.findByIdAndDelete(messageId);
    await FlaggedMessage.deleteMany({ messageId });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};

exports.getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    if (!messages.length) return res.status(404).json({ message: 'Chat or messages not found' });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching chat messages' });
  }
};