const DailyChallenge = require('../models/DailyChallenge');
const CompletedChallenge = require('../models/CompletedChallenge');
const User = require('../models/User');
const { generateRandomChallengeText } = require('../utils/challengeGenerator');
const badgeService = require('../services/badgeService');

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
        await CompletedChallenge.create({
            user: req.user.id,
            date: today
        });
        const user = await User.findById(req.user.id);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        if (user.lastChallengeDate === yesterdayDate) {
            user.challengeStreak += 1;
        } else {
            user.challengeStreak = 1;
        }

        user.lastChallengeDate = today;
        user.totalChallengeCompleted += 1;

        const XP_REWARD = parseInt(process.env.CHALLENGE_XP || '20', 10);
        user.xp = (user.xp || 0) + XP_REWARD;

        await user.save();
        const earnedBadges = await badgeService.checkBadgesForUser(user);
        res.json({
            message: `Challenge marked as completed`,
            xpGranted: XP_REWARD,
            streak: user.challengeStreak,
            totalXP: user.xp,
            earnedBadges,
            badges: user.badges
        });
    } catch (err) {
        console.error('Error completing challenge:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getChallengeStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalChallenges = await CompletedChallenge.countDocuments();

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyCompleted = await CompletedChallenge.countDocuments({
            completedAt: {
                $gte: weekAgo
            }
        });

        res.json({
            totalUsers,
            totalChallenges,
            challengesThisWeek: weeklyCompleted
        });
    } catch (err) {
        console.error('Error fetching challenge stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
}