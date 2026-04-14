/**
 * Message Controller
 * HTTP request handlers for messaging operations
 */

class MessageController {
  constructor(messageService) {
    this.messageService = messageService;
  }

  /**
   * Send a message
   * POST /api/messages
   */
  async sendMessage(req, res) {
    try {
      const { receiver_id, subject, message, message_type, related_id } = req.body;

      const sentMessage = await this.messageService.sendMessage(req.user.id, {
        receiver_id,
        subject,
        message,
        message_type,
        related_id
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: sentMessage
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Send inquiry message
   * POST /api/messages/inquiry
   */
  async sendInquiry(req, res) {
    try {
      const { receiver_id, inquiry_type, item_id, custom_message } = req.body;

      if (!inquiry_type || !item_id) {
        return res.status(400).json({
          success: false,
          message: 'inquiry_type and item_id are required'
        });
      }

      const inquiryMessage = await this.messageService.sendInquiry(
        req.user.id,
        receiver_id,
        inquiry_type,
        item_id,
        custom_message
      );

      res.status(201).json({
        success: true,
        message: 'Inquiry sent successfully',
        data: inquiryMessage
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get conversation with another user
   * GET /api/messages/conversation/:user_id
   */
  async getConversation(req, res) {
    try {
      const { user_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await this.messageService.getConversation(
        req.user.id,
        parseInt(user_id),
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user's conversations overview
   * GET /api/messages/conversations
   */
  async getConversations(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.messageService.getUserConversations(req.user.id, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get inbox messages
   * GET /api/messages/inbox
   */
  async getInbox(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await this.messageService.getInbox(req.user.id, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get sent messages
   * GET /api/messages/sent
   */
  async getSentMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await this.messageService.getSentMessages(req.user.id, page, limit);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Mark message as read
   * PATCH /api/messages/:id/read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const message = await this.messageService.markAsRead(parseInt(id), req.user.id);

      res.status(200).json({
        success: true,
        message: 'Message marked as read',
        data: message
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Mark conversation as read
   * PATCH /api/messages/conversation/:user_id/read
   */
  async markConversationAsRead(req, res) {
    try {
      const { user_id } = req.params;

      const result = await this.messageService.markConversationAsRead(
        req.user.id,
        parseInt(user_id)
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get unread message count
   * GET /api/messages/unread/count
   */
  async getUnreadCount(req, res) {
    try {
      const result = await this.messageService.getUnreadCount(req.user.id);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get messages related to an entity
   * GET /api/messages/related/:type/:id
   */
  async getRelatedMessages(req, res) {
    try {
      const { type, id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await this.messageService.getRelatedMessages(
        parseInt(id),
        type,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete message
   * DELETE /api/messages/:id
   */
  async deleteMessage(req, res) {
    try {
      const { id } = req.params;

      const result = await this.messageService.deleteMessage(parseInt(id), req.user.id);

      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get message statistics
   * GET /api/messages/stats
   */
  async getStats(req, res) {
    try {
      const result = await this.messageService.getStats(req.user.id);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search messages
   * GET /api/messages/search
   */
  async searchMessages(req, res) {
    try {
      const { q: search_term } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      if (!search_term) {
        return res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required'
        });
      }

      const result = await this.messageService.searchMessages(
        req.user.id,
        search_term,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = MessageController;
