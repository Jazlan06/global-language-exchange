// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-passwordHash');
        if (!user) return res.status(401).json({ message: 'User not found' });

        if (user.bannedUntil && user.bannedUntil > new Date()) {
            return res.status(403).json({ message: `You are banned until ${user.bannedUntil}` });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};
