const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/register', register);
router.post('/login', loginLimiter, login);

module.exports = router;