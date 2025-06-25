const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');

    // Check for the token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user data to request object
        req.user = decoded;

        next(); //
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        res.status(401).json({ message: 'Invalid token' });
    }
};
