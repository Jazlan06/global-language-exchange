const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/adminMiddleware');

router.get('/users', auth, adminCheck, adminController.getAllUsers);
router.get('/reports', auth, adminCheck, adminController.getReportedUsers);
router.delete('/ban/:userId', auth, adminCheck, adminController.tempBanUser);
router.post('/ban/:userId', auth, adminCheck, adminController.tempBanUser);

module.exports = router;