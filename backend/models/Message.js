class Message {
  constructor(db) {
    this.db = db;
  }

  // Create a new message
  create(messageData, callback) {
    const query = `
      INSERT INTO messages (
        sender_id, recipient_id, subject, content
      ) VALUES (?, ?, ?, ?)
    `;
    
    const values = [
      messageData.sender_id,
      messageData.recipient_id,
      messageData.subject,
      messageData.content
    ];

    this.db.query(query, values, callback);
  }

  // Get messages for a user
  getUserMessages(userId, callback) {
    const query = `
      SELECT m.*, 
             CONCAT(s.first_name, ' ', s.last_name) as sender_name,
             CONCAT(r.first_name, ' ', r.last_name) as recipient_name
      FROM messages m
      JOIN alumni s ON m.sender_id = s.id
      JOIN alumni r ON m.recipient_id = r.id
      WHERE m.recipient_id = ? OR m.sender_id = ?
      ORDER BY m.sent_at DESC
    `;
    
    this.db.query(query, [userId, userId], callback);
  }

  // Get messages between two users
  getConversation(user1Id, user2Id, callback) {
    const query = `
      SELECT m.*, 
             CONCAT(s.first_name, ' ', s.last_name) as sender_name,
             CONCAT(r.first_name, ' ', r.last_name) as recipient_name
      FROM messages m
      JOIN alumni s ON m.sender_id = s.id
      JOIN alumni r ON m.recipient_id = r.id
      WHERE (m.sender_id = ? AND m.recipient_id = ?) OR 
            (m.sender_id = ? AND m.recipient_id = ?)
      ORDER BY m.sent_at ASC
    `;
    
    this.db.query(query, [user1Id, user2Id, user2Id, user1Id], callback);
  }

  // Mark message as read
  markAsRead(messageId, callback) {
    const query = 'UPDATE messages SET is_read = TRUE WHERE id = ?';
    this.db.query(query, [messageId], callback);
  }

  // Get unread message count for a user
  getUnreadCount(userId, callback) {
    const query = 'SELECT COUNT(*) as unread_count FROM messages WHERE recipient_id = ? AND is_read = FALSE';
    this.db.query(query, [userId], callback);
  }
}

module.exports = Message;