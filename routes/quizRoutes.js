const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const quizController = require('../controllers/quizController');

router.post('/', auth, quizController.createQuiz);
router.post('/submit', auth, quizController.submitQuiz);
router.get('/progress', auth, quizController.getUserQuizProgress);


module.exports = router;