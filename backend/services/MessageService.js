/**
 * Message Service
 * Business logic for messaging operations
 */

class MessageService {
  constructor(messageModel, userModel) {
    this.messageModel = messageModel;
    this.userModel = userModel;
  }

  /**
   * Validate message input
   * @param {Object} data - Message data
   * @throws {Error} If validation fails
   */
  validateMessageInput(data) {
    if (!data.receiver_id || !Number.isInteger(data.receiver_id) || data.receiver_id < 1) {
      throw new Error('Valid receiver ID is required');
    }

    if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
      throw new Error('Message content is required');
    }

    if (data.message.length > 1000) {
      throw new Error('Message cannot exceed 1000 characters');
    }

    if (data.subject && (typeof data.subject !== 'string' || data.subject.length > 200)) {
      throw new Error('Subject cannot exceed 200 characters');
    }

    const validTypes = ['direct', 'booking', 'property', 'service', 'inquiry'];
    if (data.message_type && !validTypes.includes(data.message_type)) {
      throw new Error(`Message type must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Send a message
   * @param {number} sender_id - Sender user ID
   * @param {Object} messageData - Message information
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(sender_id, messageData) {
    try {
      this.validateMessageInput(messageData);

      // Verify receiver exists
      const receiver = await this.userModel.findById(messageData.receiver_id);
      if (!receiver) {
        throw new Error('Receiver not found');
      }

      // Prevent self-messaging
      if (sender_id === messageData.receiver_id) {
        throw new Error('Cannot send message to yourself');
      }

      const message = await this.messageModel.create({
        sender_id,
        ...messageData
      });

      return message;
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  /**
   * Get conversation between two users
   * @param {number} user_id - Current user ID
   * @param {number} other_user_id - Other user ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Object>} Conversation with pagination
   */
  async getConversation(user_id, other_user_id, page = 1, limit = 20) {
    try {
      if (!Number.isInteger(other_user_id) || other_user_id < 1) {
        throw new Error('Invalid user ID');
      }

      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 20;

      const messages = await this.messageModel.getConversation(user_id, other_user_id, page, limit);
      const unreadCount = await this.messageModel.getUnreadCount(user_id);

      return {
        success: true,
        data: messages,
        pagination: {
          current_page: page,
          per_page: limit,
          total_unread: unreadCount
        },
        conversation_with: {
          user_id: other_user_id,
          // Additional user info would be fetched if needed
        }
      };
    } catch (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }
  }

  /**
   * Get user's conversations (inbox overview)
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Conversations per page
   * @returns {Promise<Object>} User's conversations
   */
  async getUserConversations(user_id, page = 1, limit = 10) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 10;

      const conversations = await this.messageModel.getUserConversations(user_id, page, limit);
      const totalUnread = await this.messageModel.getUnreadCount(user_id);

      return {
        success: true,
        data: conversations,
        pagination: {
          current_page: page,
          per_page: limit
        },
        summary: {
          total_unread: totalUnread,
          total_conversations: conversations.length
        }
      };
    } catch (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }
  }

  /**
   * Get user's inbox messages
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Object>} User's received messages
   */
  async getInbox(user_id, page = 1, limit = 20) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 20;

      const messages = await this.messageModel.getUserMessages(user_id, page, limit);
      const unreadCount = await this.messageModel.getUnreadCount(user_id);

      return {
        success: true,
        data: messages,
        pagination: {
          current_page: page,
          per_page: limit
        },
        summary: {
          unread_count: unreadCount,
          total_messages: messages.length
        }
      };
    } catch (error) {
      throw new Error(`Error fetching inbox: ${error.message}`);
    }
  }

  /**
   * Get user's sent messages
   * @param {number} user_id - User ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Object>} User's sent messages
   */
  async getSentMessages(user_id, page = 1, limit = 20) {
    try {
      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 20;

      const messages = await this.messageModel.getSentMessages(user_id, page, limit);

      return {
        success: true,
        data: messages,
        pagination: {
          current_page: page,
          per_page: limit
        }
      };
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
      if (!Number.isInteger(message_id) || message_id < 1) {
        throw new Error('Invalid message ID');
      }

      const message = await this.messageModel.markAsRead(message_id, user_id);

      return message;
    } catch (error) {
      throw new Error(`Error marking message as read: ${error.message}`);
    }
  }

  /**
   * Mark conversation as read
   * @param {number} user_id - Current user ID
   * @param {number} other_user_id - Other user ID
   * @returns {Promise<Object>} Result with count
   */
  async markConversationAsRead(user_id, other_user_id) {
    try {
      if (!Number.isInteger(other_user_id) || other_user_id < 1) {
        throw new Error('Invalid user ID');
      }

      const count = await this.messageModel.markConversationAsRead(other_user_id, user_id);

      return {
        success: true,
        message: `Marked ${count} messages as read`,
        marked_count: count
      };
    } catch (error) {
      throw new Error(`Error marking conversation as read: ${error.message}`);
    }
  }

  /**
   * Get unread message count
   * @param {number} user_id - User ID
   * @returns {Promise<Object>} Unread count
   */
  async getUnreadCount(user_id) {
    try {
      const count = await this.messageModel.getUnreadCount(user_id);

      return {
        success: true,
        unread_count: count
      };
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }

  /**
   * Get messages related to a specific entity (booking, property, service)
   * @param {number} related_id - Related entity ID
   * @param {string} message_type - Type of related entity
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Object>} Related messages
   */
  async getRelatedMessages(related_id, message_type, page = 1, limit = 20) {
    try {
      if (!Number.isInteger(related_id) || related_id < 1) {
        throw new Error('Invalid related ID');
      }

      const validTypes = ['booking', 'property', 'service'];
      if (!validTypes.includes(message_type)) {
        throw new Error(`Invalid message type. Must be one of: ${validTypes.join(', ')}`);
      }

      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 20;

      const messages = await this.messageModel.getRelatedMessages(related_id, message_type, page, limit);

      return {
        success: true,
        data: messages,
        pagination: {
          current_page: page,
          per_page: limit
        },
        related_to: {
          id: related_id,
          type: message_type
        }
      };
    } catch (error) {
      throw new Error(`Error fetching related messages: ${error.message}`);
    }
  }

  /**
   * Delete message
   * @param {number} message_id - Message ID
   * @param {number} user_id - User ID (sender or receiver)
   * @returns {Promise<Object>} Success response
   */
  async deleteMessage(message_id, user_id) {
    try {
      if (!Number.isInteger(message_id) || message_id < 1) {
        throw new Error('Invalid message ID');
      }

      await this.messageModel.deleteMessage(message_id, user_id);

      return {
        success: true,
        message: 'Message deleted successfully'
      };
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }

  /**
   * Get message statistics for user
   * @param {number} user_id - User ID
   * @returns {Promise<Object>} Message statistics
   */
  async getStats(user_id) {
    try {
      const stats = await this.messageModel.getUserStats(user_id);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      throw new Error(`Error getting message stats: ${error.message}`);
    }
  }

  /**
   * Search messages
   * @param {number} user_id - User ID
   * @param {string} search_term - Search term
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Promise<Object>} Search results
   */
  async searchMessages(user_id, search_term, page = 1, limit = 20) {
    try {
      if (!search_term || typeof search_term !== 'string' || search_term.trim().length < 2) {
        throw new Error('Search term must be at least 2 characters long');
      }

      if (page < 1) page = 1;
      if (limit < 1 || limit > 50) limit = 20;

      const messages = await this.messageModel.searchMessages(user_id, search_term, page, limit);

      return {
        success: true,
        data: messages,
        pagination: {
          current_page: page,
          per_page: limit
        },
        search_term: search_term
      };
    } catch (error) {
      throw new Error(`Error searching messages: ${error.message}`);
    }
  }

  /**
   * Send inquiry message (predefined template)
   * @param {number} sender_id - Sender user ID
   * @param {number} receiver_id - Receiver user ID
   * @param {string} inquiry_type - Type of inquiry (property, service, artisan)
   * @param {number} item_id - Item ID being inquired about
   * @param {string} custom_message - Optional custom message
   * @returns {Promise<Object>} Created inquiry message
   */
  async sendInquiry(sender_id, receiver_id, inquiry_type, item_id, custom_message = '') {
    try {
      const validTypes = ['property', 'service', 'artisan'];
      if (!validTypes.includes(inquiry_type)) {
        throw new Error(`Invalid inquiry type. Must be one of: ${validTypes.join(', ')}`);
      }

      let subject = '';
      let message = '';

      switch (inquiry_type) {
        case 'property':
          subject = 'Property Inquiry';
          message = `Hi, I'm interested in your property listing. ${custom_message}`.trim();
          break;
        case 'service':
          subject = 'Service Inquiry';
          message = `Hi, I'm interested in your service. ${custom_message}`.trim();
          break;
        case 'artisan':
          subject = 'Product/Service Inquiry';
          message = `Hi, I'm interested in your listing. ${custom_message}`.trim();
          break;
      }

      const inquiryMessage = await this.messageModel.create({
        sender_id,
        receiver_id,
        subject,
        message,
        message_type: 'inquiry',
        related_id: item_id
      });

      return inquiryMessage;
    } catch (error) {
      throw new Error(`Error sending inquiry: ${error.message}`);
    }
  }
}

module.exports = MessageService;
