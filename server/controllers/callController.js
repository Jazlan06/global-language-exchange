const CallSession = require('../models/CallSession');
const badgeService = require('../services/badgeService');

exports.startCall = async (req, res) => {
    const { chatId, receiverId } = req.body;
    try {
        const session = await CallSession.create({
            chatId,
            caller: req.user.id,
            receiver: receiverId,
            startedAt: Date.now()
        });

        res.status(201).json({ session });
    } catch (error) {
        console.error('❌ Error in startCall:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.endCall = async (req, res) => {
    const { sessionId, rating } = req.body;
    try {
        const session = await CallSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Call session not found' });
        }
        session.endedAt = Date.now();
        if (session.caller.toString() === req.user.id) {
            session.rating.fromCaller = rating;
        } else if (session.receiver.toString() === req.user.id) {
            session.rating.fromReceiver = rating;
        }

        await session.save();
        await badgeService.checkBadgesForUser(req.user);
        res.json({ message: 'Call ended successfully', session });
    } catch (error) {
        console.error('❌ Error in endCall:', error);
        res.status(500).json({ message: 'Server error' });

    }
}

exports.getCallHistory = async (req,res)=>{
    try {
        const seessions = await CallSession.find({
            $or: [
                { caller: req.user.id },
                { receiver: req.user.id }
            ]
        }).populate('caller receiver chatId');
        if (!seessions || seessions.length === 0) {
            return res.status(404).json({ message: 'No call history found.' });
        }

        res.json(seessions);
    } catch (error) {
        console.error('❌ Error in getCallHistory:', error);
        res.status(500).json({ message: 'Server error' });
        
    }
}
