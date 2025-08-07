const rateLimit = require('express-rate-limit');

const abuseStrikes = new Map();

const MAX_STRIKES = 3;
const BAN_DURATION_MS = 60 * 60 * 1000;

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});


const xpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.user?.id || req.ip,
    handler: (req, res) => {
        const userId = req.user?.id || req.ip;

        const current = abuseStrikes.get(userId) || { strikes: 0, bannedUntil: null };

        if (current.bannedUntil && current.bannedUntil > Date.now()) {
            const remaining = Math.ceil((current.bannedUntil - Date.now()) / 60000);
            return res.status(429).json({
                message: `⛔ You are temporarily banned from XP updates. Try again in ${remaining} minute(s).`
            });
        }

        current.strikes += 1;

        if (current.strikes >= MAX_STRIKES) {
            current.bannedUntil = Date.now() + BAN_DURATION_MS;
            console.warn(`🚫 User ${userId} temporarily banned from XP for ${BAN_DURATION_MS / 60000} minutes.`);
        }

        abuseStrikes.set(userId, current);

        res.status(429).json({
            message: 'Too many XP updates. Please wait a moment and try again.',
            strikes: current.strikes,
            bannedUntil: current.bannedUntil ? new Date(current.bannedUntil).toISOString() : null
        });
    }
});

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 500,
    message: 'Too many login attempts. Try again later.',
});

module.exports = {
    globalLimiter,
    xpLimiter,
    loginLimiter,
    abuseStrikes
};
