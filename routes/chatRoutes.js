const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');
const checkBlock = require('../middleware/checkBlockMiddleware');

router.get('/', auth, chatController.getChats);
router.post('/create', auth, checkBlock, chatController.createOrGetChat);
router.post('/send', auth, checkBlock, chatController.sendMessage);
router.get('/:chatId/messages', auth, chatController.getMessages);

module.exports = router;