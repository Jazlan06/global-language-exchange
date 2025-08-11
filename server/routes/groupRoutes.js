const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const groupMessageController = require('../controllers/groupMessageController');
const auth = require('../middleware/authMiddleware');

router.get('/unread-counts', auth, groupController.getUnreadCounts)
router.post('/create', auth, groupController.createGroup);
router.get('/', auth, groupController.listGroups);
router.post('/:groupId/message', auth, groupMessageController.sendGroupMessage)
router.get('/:groupId', auth, groupController.getGroup);
router.post('/:groupId/join', auth, groupController.joinGroup);
router.post('/:groupId/leave', auth, groupController.leaveGroup);
router.post('/:groupId/addAdmin', auth, groupController.addAdmin);
router.post('/:groupId/removeAdmin', auth, groupController.removeAdmin);
router.delete('/:groupId', auth, groupController.deleteGroup);
router.post('/:groupId/mark-read', auth, groupController.markGroupAsRead);
router.put('/groups/:groupId', auth, groupController.editGroup);


module.exports = router;