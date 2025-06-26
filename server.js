require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const matchMakingRoutes = require('./routes/matchMakingRoutes');
app.use('/api/matchmaking', matchMakingRoutes);
const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);
const friendRoutes = require('./routes/friendRoutes');
app.use('/api/friends', friendRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});