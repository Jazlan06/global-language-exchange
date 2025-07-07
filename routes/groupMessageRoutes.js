const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const groupMessageController = require('../controllers/groupMessageController');

router.get('/:groupId', auth, groupMessageController.getGroupMessages);
router.delete('/:groupId/:messageId', auth, groupMessageController.deleteGroupMessage);

module.exports = router;