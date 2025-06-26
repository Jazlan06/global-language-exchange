const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, chatController.getChats);
router.post('/create', auth, chatController.createOrGetChat);
router.post('/send', auth, chatController.sendMessage);
router.get('/:chatId/messages', auth, chatController.getMessages);

module.exports = router;