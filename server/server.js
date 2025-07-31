require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sanitizer = require('perfect-express-sanitizer');
const { globalLimiter } = require('./middleware/rateLimiter');
const connectDB = require('./config/db');
const http = require('http');
const socketManager = require('./sockets/socketManager');
const cleanupOnlineUsers = require('./utils/cleanupOnlineUsers');
const scheduleDailyChallenge = require('./cron/dailyChallengeCron');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors(corsOptions));
app.use(sanitizer.clean({ xss: true, noSql: true, sql: true }));
app.use(globalLimiter);
app.set('io', io);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/matchmaking', require('./routes/matchMakingRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/calls', require('./routes/callRoutes'));
app.use('/api/prompts', require('./routes/promptRoutes'));
app.use('/api/xp', require('./routes/xpRoutes'));
app.use('/api/user-moderation', require('./routes/userModerationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/moderation', require('./routes/moderationRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/group-messages', require('./routes/groupMessageRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/lesson/progress', require('./routes/lessonProgressRoutes'));

socketManager(io);

scheduleDailyChallenge();

setInterval(() => {
    cleanupOnlineUsers(io, require('./sockets/socketManager').onlineUsers);
}, 5 * 60 * 1000); // every 5 minutes

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
