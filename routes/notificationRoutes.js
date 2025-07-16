const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, notificationController.getNotifications);
router.post('/send', auth, notificationController.sendNotification);
router.put('/:id/read', auth, notificationController.markAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);
router.post('/broadcast', auth, notificationController.broadcastAnnouncement);
router.get('/unread/count', auth, notificationController.getUnreadCount);


module.exports = router;