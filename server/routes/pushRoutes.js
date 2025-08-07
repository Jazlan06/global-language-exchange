const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pushController = require('../controllers/pushController');

router.post('/subscribe', auth, pushController.saveSubscription);

module.exports = router;
