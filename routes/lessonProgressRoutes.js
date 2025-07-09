const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/lessonProgressController');

router.post('/complete', auth, controller.markLessonComplete);
router.get('/completed', auth, controller.getCompletedLessons);

module.exports = router;
