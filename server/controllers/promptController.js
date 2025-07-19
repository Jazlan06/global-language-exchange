const prompts = require('../data/prompts');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.getRandomPrompt = (req, res) => {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    res.json({ prompt: prompts[randomIndex] });
};

exports.getAIPrompt = async (req, res) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that provides language learning prompts.',
                },
                {
                    role: 'user',
                    content: 'Give me a unique conversation prompt related to travel or food.',
                },
            ],
        });

        const prompt = response.choices[0].message.content.trim();
        res.json({ prompt });
    } catch (err) {
        console.error('❌ Error in getAIPrompt:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
