const challenges = [
  "Write a sentence using 3 new vocabulary words.",
  "Introduce yourself in your learning language.",
  "Translate your favorite quote.",
  "Ask a question to a friend in your target language.",
  "Watch a short video and describe it in the language you're learning.",
  "Listen to a song and write down a chorus line.",
  "Write a mini-dialogue about ordering food.",
  "Name 5 animals and their colors in your learning language.",
  "Say the days of the week aloud.",
  "Practice counting from 1 to 20."
];

exports.generateRandomChallengeText = ()=>{
    const index = Math.floor(Math.random() * challenges.length)
    return challenges[index];
}