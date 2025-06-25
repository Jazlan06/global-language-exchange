const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');


router.get('/me', auth, userController.getProfile);
router.put('/me', auth, (req, res, next) => {
    console.log('🧾 Update user profile request body:', req.body);
    next();
}, userController.updateProfile);


module.exports = router;