const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const quizController = require('../controllers/quizController');
const admin = require('../middleware/adminMiddleware')

router.post('/submit', auth, quizController.submitQuiz);
router.get('/progress', auth, quizController.getUserQuizProgress);
// Admin only routes for quizzes
router.post('/', auth, admin, quizController.createQuiz);
router.put('/:quizId', auth, admin, quizController.updateQuiz);
router.delete('/:quizId', auth, admin, quizController.deleteQuiz);


module.exports = router;