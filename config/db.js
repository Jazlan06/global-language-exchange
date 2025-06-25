const mongoose = require('mongoose');
const cl = console.log.bind(console);

const conectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        cl('Mongo DB Connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
}

module.exports = conectDB;
