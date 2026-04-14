/**
 * Message Model
 * Database operations for messaging system
 * Handles real-time and async messaging between users
 */

const pool = require('../app').pool;

class Message {
  /**
   * Create a new message
   * @param {Object} messageData - { sender_id, receiver_id, subject, message, message_type, related_id }
   * @returns {Promise<Object>} Created message
   */
  async create(messageData) {
    try {
      const { sender_id, receiver_id, subject, message, message_type = 'direct', related_id = null } = messageData;

      const query = `
        INSERT INTO messages
        (sender_id, receiver_id, subject, message, message_type, related_id, is_read, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
        RETURNING *
      `;

      const values = [sender_id, receiver_id, subject, message, message_type, related_id];

      const result = await pool.query(query, values);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }
  }

  /**
   * Get conversation between two users
   * @param {number} user1_id - First user ID
   * @param {number} user2_id - Second user ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Array>} Conversation messages
   */
  async getConversation(user1_id, user2_id, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT m.*,
               u1.name as sender_name,
               u2.name as receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE (m.sender_id = $1 AND m.receiver_id = $2)
           OR (m.sender_id = $2 AND m.receiver_id = $1)
        ORDER BY m.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await pool.query(query, [user1_id, user2_id, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }
  }

  /**
   * Get all conversations for a user
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Conversations per page
   * @returns {Promise<Array>} User's conversations
   */
  async getUserConversations(user_id, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT DISTINCT
          CASE
            WHEN m.sender_id = $1 THEN m.receiver_id
            ELSE m.sender_id
          END as other_user_id,
          u.name as other_user_name,
          u.role as other_user_role,
          u.phone as other_user_phone,
          MAX(m.created_at) as last_message_time,
          COUNT(CASE WHEN m.receiver_id = $1 AND m.is_read = false THEN 1 END) as unread_count,
          (
            SELECT message
            FROM messages
            WHERE (sender_id = $1 AND receiver_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
               OR (receiver_id = $1 AND sender_id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
            ORDER BY created_at DESC
            LIMIT 1
          ) as last_message
        FROM messages m
        JOIN users u ON (
          CASE
            WHEN m.sender_id = $1 THEN m.receiver_id
            ELSE m.sender_id
          END = u.id
        )
        WHERE m.sender_id = $1 OR m.receiver_id = $1
        GROUP BY other_user_id, u.name, u.role, u.phone
        ORDER BY last_message_time DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [user_id, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user conversations: ${error.message}`);
    }
  }

  /**
   * Get messages for a user (inbox)
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Array>} User's messages
   */
  async getUserMessages(user_id, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT m.*,
               u.name as sender_name,
               u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [user_id, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user messages: ${error.message}`);
    }
  }

  /**
   * Get sent messages for a user
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Array>} User's sent messages
   */
  async getSentMessages(user_id, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT m.*,
               u.name as receiver_name,
               u.role as receiver_role
        FROM messages m
        JOIN users u ON m.receiver_id = u.id
        WHERE m.sender_id = $1
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await pool.query(query, [user_id, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching sent messages: ${error.message}`);
    }
  }

  /**
   * Mark message as read
   * @param {number} message_id - Message ID
   * @param {number} user_id - User ID (receiver)
   * @returns {Promise<Object>} Updated message
   */
  async markAsRead(message_id, user_id) {
    try {
      const query = `
        UPDATE messages
        SET is_read = true, read_at = NOW(), updated_at = NOW()
        WHERE id = $1 AND receiver_id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [message_id, user_id]);

      if (result.rows.length === 0) {
        throw new Error('Message not found or unauthorized');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking message as read: ${error.message}`);
    }
  }

  /**
   * Mark all messages from a user as read
   * @param {number} sender_id - Sender user ID
   * @param {number} receiver_id - Receiver user ID
   * @returns {Promise<number>} Number of messages marked as read
   */
  async markConversationAsRead(sender_id, receiver_id) {
    try {
      const query = `
        UPDATE messages
        SET is_read = true, read_at = NOW(), updated_at = NOW()
        WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
      `;

      const result = await pool.query(query, [sender_id, receiver_id]);

      return result.rowCount;
    } catch (error) {
      throw new Error(`Error marking conversation as read: ${error.message}`);
    }
  }

  /**
   * Get unread message count for user
   * @param {number} user_id - User ID
   * @returns {Promise<number>} Unread message count
   */
  async getUnreadCount(user_id) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM messages
        WHERE receiver_id = $1 AND is_read = false
      `;

      const result = await pool.query(query, [user_id]);

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }

  /**
   * Get messages related to a booking/property/service
   * @param {number} related_id - Related entity ID
   * @param {string} message_type - Type of related entity
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Array>} Related messages
   */
  async getRelatedMessages(related_id, message_type, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT m.*,
               u1.name as sender_name,
               u2.name as receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.related_id = $1 AND m.message_type = $2
        ORDER BY m.created_at ASC
        LIMIT $3 OFFSET $4
      `;

      const result = await pool.query(query, [related_id, message_type, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching related messages: ${error.message}`);
    }
  }

  /**
   * Delete message (soft delete by marking as deleted)
   * @param {number} message_id - Message ID
   * @param {number} user_id - User ID (sender or receiver)
   * @returns {Promise<boolean>} Success status
   */
  async deleteMessage(message_id, user_id) {
    try {
      // Check if user is sender or receiver
      const ownershipQuery = `
        SELECT id FROM messages
        WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)
      `;

      const ownershipCheck = await pool.query(ownershipQuery, [message_id, user_id]);

      if (ownershipCheck.rows.length === 0) {
        throw new Error('Message not found or unauthorized');
      }

      // Soft delete by setting deleted flag
      const query = `
        UPDATE messages
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = $1
      `;

      await pool.query(query, [message_id]);

      return true;
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }

  /**
   * Get message statistics for user
   * @param {number} user_id - User ID
   * @returns {Promise<Object>} Message statistics
   */
  async getUserStats(user_id) {
    try {
      const query = `
        SELECT
          COUNT(CASE WHEN receiver_id = $1 THEN 1 END) as total_received,
          COUNT(CASE WHEN sender_id = $1 THEN 1 END) as total_sent,
          COUNT(CASE WHEN receiver_id = $1 AND is_read = false THEN 1 END) as unread_count,
          COUNT(DISTINCT CASE WHEN sender_id = $1 THEN receiver_id WHEN receiver_id = $1 THEN sender_id END) as unique_conversations
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
      `;

      const result = await pool.query(query, [user_id]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  /**
   * Search messages by content
   * @param {number} user_id - User ID
   * @param {string} search_term - Search term
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Array>} Search results
   */
  async searchMessages(user_id, search_term, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const query = `
        SELECT m.*,
               u1.name as sender_name,
               u2.name as receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE (m.sender_id = $1 OR m.receiver_id = $1)
          AND (m.subject ILIKE $2 OR m.message ILIKE $2)
        ORDER BY m.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const result = await pool.query(query, [user_id, `%${search_term}%`, limit, offset]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error searching messages: ${error.message}`);
    }
  }
}

module.exports = Message;
