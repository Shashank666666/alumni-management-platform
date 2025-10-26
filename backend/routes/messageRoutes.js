const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Send a new message
router.post('/', messageController.sendMessage);

// Get user messages
router.get('/:userId', messageController.getUserMessages);

// Get conversation between two users
router.get('/conversation/:user1Id/:user2Id', messageController.getConversation);

// Mark message as read
router.put('/:id/read', messageController.markAsRead);

// Get unread message count
router.get('/unread/:userId', messageController.getUnreadCount);

module.exports = router;