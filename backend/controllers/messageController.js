const Message = require('../models/Message');
const db = require('../config/db');

const messageModel = new Message(db);

// Send a new message
exports.sendMessage = (req, res) => {
  const messageData = req.body;
  
  // Basic validation
  if (!messageData.sender_id || !messageData.recipient_id || !messageData.subject || !messageData.content) {
    return res.status(400).json({
      error: 'Sender ID, Recipient ID, Subject, and Content are required'
    });
  }
  
  messageModel.create(messageData, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error sending message'
      });
    }
    
    res.status(201).json({
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  });
};

// Get user messages
exports.getUserMessages = (req, res) => {
  const { userId } = req.params;
  
  messageModel.getUserMessages(userId, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving messages'
      });
    }
    
    res.json(results);
  });
};

// Get conversation between two users
exports.getConversation = (req, res) => {
  const { user1Id, user2Id } = req.params;
  
  messageModel.getConversation(user1Id, user2Id, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving conversation'
      });
    }
    
    res.json(results);
  });
};

// Mark message as read
exports.markAsRead = (req, res) => {
  const { id } = req.params;
  
  messageModel.markAsRead(id, (err, result) => {
    if (err) {
      return res.status(500).json({
        error: 'Error marking message as read'
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }
    
    res.json({
      message: 'Message marked as read'
    });
  });
};

// Get unread message count
exports.getUnreadCount = (req, res) => {
  const { userId } = req.params;
  
  messageModel.getUnreadCount(userId, (err, results) => {
    if (err) {
      return res.status(500).json({
        error: 'Error retrieving unread message count'
      });
    }
    
    res.json(results[0]);
  });
};