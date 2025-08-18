const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { initializeFirstLessonForUser } = require('./lessonProgressController');
const UserLessonProgress = require('../models/UserLessonProgress');
const Lesson = require('../models/Lesson');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    console.log('🧾 Register request body:', req.body);
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, passwordHash: hashedPassword });
        await newUser.save();
        await initializeFirstLessonForUser(newUser._id);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('❌ Error in register:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const existingProgress = await UserLessonProgress.findOne({ user: user._id });
        if (!existingProgress) {
            const firstLesson = await Lesson.findOne().sort({ order: 1 });
            if (firstLesson) {
                await UserLessonProgress.create({
                    user: user._id,
                    lesson: firstLesson._id,
                    status: 'unlocked',
                    completedAt: null
                });
                console.log(`✅ First lesson unlocked for ${user.email}`);
            }
        }

        const lessonProgress = await UserLessonProgress.find({
            user: user._id
        }).populate('lesson').select('status lesson');

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            lessonProgress
        });
    } catch (error) {
        //TYpe of error
        console.error('❌ Error in login:', error);
        return res.status(500).json({ message: 'Server error' });
    }
}