const DailyChallenge = require('../models/DailyChallenge');
const CompletedChallenge = require('../models/CompletedChallenge');
const { generateRandomChallengeText } = require('../utils/challengeGenerator');

const getTodayDate = () => {
   return new Date().toISOString().split('T')[0];
}

exports.getTodayChallenge = async (req, res) => {
    try {
        const today = getTodayDate();

        let challenge = await DailyChallenge.findOne({ date: today });

        if (!challenge) {
            challenge = new DailyChallenge({
                date: today,
                challengeText: generateRandomChallengeText()
            });
            await challenge.save();
        }

        const completed = await CompletedChallenge.findOne({
            user: req.user.id,
            date: today,
        });

        res.json({
            challenge,
            completed: !!completed,
        })
    } catch (err) {
        console.error(`Error getting today's challenge:`, err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.completeTodayChallenge = async (req, res) => {
    try {
        const today = getTodayDate();

        const alreadyDone = await CompletedChallenge.findOne({
            user: req.user.id,
            date: today,
        });

        if (alreadyDone) {
            return res.status(400).json({
                message: `Challenge already completed today`
            })
        }

        const completed = new CompletedChallenge({
            user: req.user.id,
            date: today,
        });

        await completed.save();

        res.json({
            message: `Challenge marked as completed`
        })
    } catch (err) {
        console.error('Error completing challenge:', err);
        res.status(500).json({ message: 'Server error' });
    }
}