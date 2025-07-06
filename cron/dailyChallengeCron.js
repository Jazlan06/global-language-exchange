const cron = require('node-cron');
const DailyChallenge = require('../models/DailyChallenge');
const { generateRandomChallengeText } = require('../utils/challengeGenerator');

const getTodayDate = () => new Date().toISOString().split('T')[0];

const scheduleDailyChallenge = () =>{
    cron.schedule('0 0 * * *', async ()=>{
        const today = getTodayDate();

        try{
            const existing  = await DailyChallenge.findOne({date : today});
            if(existing){
                console.log(`⏱️ Challenge already exists for ${today}`);
                return;
            }

            const newChallenge = new DailyChallenge({
                date : today,
                challengeText : generateRandomChallengeText()
            });

            await newChallenge.save();
            console.log(`✅ Daily challenge created for ${today}`);
        }catch(err){
            console.error('❌ Error generating daily challenge:', err.message);
        }
    })
}

module.exports = scheduleDailyChallenge;