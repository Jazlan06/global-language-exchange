const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const lessonController = require('../controllers/lessonController');
const admin = require('../middleware/adminMiddleware')

router.get('/', auth, lessonController.getAllLessons);
router.get('/:lessonId', auth, lessonController.getLessonById);
// Admin only routes to add/edit/delete lessons
router.post('/', auth, admin, lessonController.createLesson);
router.put('/:lessonId', auth, admin, lessonController.updateLesson);
router.delete('/:lessonId', auth, admin, lessonController.deleteLesson);

module.exports = router;
