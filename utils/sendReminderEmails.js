const User = require('../models/User');
const CompletedChallenge = require('../models/CompletedChallenge');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth:{
       user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

exports.getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};


const sendReminderEmails = async () =>{
    try{
         const today = getTodayDate();
        const allUsers = await User.find({ isBanned: false }, '_id email name');
        const completedToday = await CompletedChallenge.find({ date: today }).select('user');
        const completedUserIds = completedToday.map(entry => entry.user.toString());
        const notCompletedUsers = allUsers.filter(user => !completedUserIds.includes(user._id.toString()));

        for(const user of notCompletedUsers){
            await transporter.sendMail({
                  from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Don’t forget your language challenge today!',
                html: `<p>Hi ${user.name},</p><p>Complete your daily language challenge to keep your streak going and earn XP!</p>`,
            });
            console.log(`📧 Reminder sent to ${user.email}`)
        }

    }catch(err){
        console.error('Error sending reminder emails:', err);
    }
}

module.exports = sendReminderEmails;
