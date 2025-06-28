const express = require('express');
const router = express.Router();
const xpController = require('../controllers/xpController');
const auth = require('../middleware/authMiddleware');

router.get('/me', auth, xpController.getXP);
router.post('/update', auth, xpController.updateXP);

module.exports = router;