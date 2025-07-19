require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const makeAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@gmail.com'; // Change this to the target user's email
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found.');
      return;
    }

    user.role = 'admin'; // Assuming you added 'role' to userSchema
    await user.save();

    console.log(`✅ ${user.email} is now an admin.`);
    process.exit();
  } catch (err) {
    console.error('⚠️ Error making user admin:', err.message);
    process.exit(1);
  }
};

makeAdmin();