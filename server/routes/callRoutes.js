const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const auth = require('../middleware/authMiddleware');

router.post('/start', auth, callController.startCall);
router.post('/end', auth, callController.endCall);
router.get('/history', auth, callController.getCallHistory);

module.exports = router;