const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const lessonController = require('../controllers/lessonController');

router.post('/', auth, lessonController.createLesson); 
router.get('/', auth, lessonController.getAllLessons);
router.get('/:lessonId', auth, lessonController.getLessonById);

module.exports = router;