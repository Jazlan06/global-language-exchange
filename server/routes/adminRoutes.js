//routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const adminCheck = require('../middleware/adminMiddleware');

router.get('/users', auth, adminCheck, adminController.getAllUsers);
router.get('/reports', auth, adminCheck, adminController.getReportedUsers);
router.delete('/ban/:userId', auth, adminCheck, adminController.tempBanUser);
router.post('/ban/:userId', auth, adminCheck, adminController.tempBanUser);
router.get('/dashboard/stats', auth, adminCheck, adminController.getDashboardStats);
router.get('/analytics/xp-trends', auth, adminCheck, adminController.getXpTrends);
router.get('/analytics/challenge-participation', auth, adminCheck, adminController.getChallengeParticipation);
router.get('/analytics/engagement', auth, adminCheck, adminController.getUserEngagement);


module.exports = router;