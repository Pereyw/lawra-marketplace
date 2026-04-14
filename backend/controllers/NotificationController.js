/**
 * Notification Controller
 * Handles notifications
 */

class NotificationController {
  constructor(notificationModel) {
    this.notificationModel = notificationModel;
  }

  /**
   * Get notifications
   * GET /api/notifications
   */
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0, unreadOnly = false } = req.query;

      const notifications = await this.notificationModel.getNotifications(
        userId,
        parseInt(limit),
        parseInt(offset),
        unreadOnly === 'true'
      );

      res.status(200).json({
        notifications,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  /**
   * Get unread count
   * GET /api/notifications/unread/count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await this.notificationModel.getUnreadCount(userId);

      res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;

      const notification = await this.notificationModel.markAsRead(id);

      res.status(200).json({
        message: 'Notification marked as read',
        notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  /**
   * Mark all as read
   * PUT /api/notifications/mark-all-read
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await this.notificationModel.markAllAsRead(userId);

      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const deleted = await this.notificationModel.deleteNotification(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }

  /**
   * Delete all notifications
   * DELETE /api/notifications/all
   */
  async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;

      await this.notificationModel.deleteAllNotifications(userId);

      res.status(200).json({ message: 'All notifications deleted' });
    } catch (error) {
      console.error('Delete all notifications error:', error);
      res.status(500).json({ error: 'Failed to delete notifications' });
    }
  }

  /**
   * Get notifications by type
   * GET /api/notifications/type/:type
   */
  async getNotificationsByType(req, res) {
    try {
      const userId = req.user.id;
      const { type } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const notifications = await this.notificationModel.getNotificationsByType(
        userId,
        type,
        parseInt(limit),
        parseInt(offset)
      );

      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Get notifications by type error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }
}

module.exports = NotificationController;
