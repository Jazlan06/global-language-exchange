const Subscription = require('../models/Subscription');
const webPush = require('../utils/webPush');

exports.saveSubscription = async (req, res) => {
    const { subscription } = req.body;
    console.log('📥 Received push subscription for user:', req.user.id);
    try {
        const existing = await Subscription.findOne({ user: req.user.id });
        if (existing) {
            existing.subscription = subscription;
            await existing.save();
        } else {
            await Subscription.create({ user: req.user.id, subscription });
        }

        res.status(201).json({ message: 'Subscription saved' });
    } catch (err) {
        console.error('❌ Error saving subscription:', err);
        res.status(500).json({ message: 'Failed to save subscription' });
    }
};

exports.sendPushNotification = async (userId, payload) => {
    try {
        const subscriptionEntry = await Subscription.findOne({ user: userId });
        if (!subscriptionEntry) {
            console.warn(`📭 No push subscription found for user ${userId}`);
            return;
        }


        await webPush.sendNotification(subscriptionEntry.subscription, JSON.stringify(payload));
    } catch (err) {
        console.error('❌ Push error:', err.message);
    }
};
