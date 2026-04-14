/**
 * Notification Model
 * Handles notification data operations
 */

class Notification {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create notification
   */
  async createNotification(userId, type, title, message, data = null) {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [userId, type, title, message, data ? JSON.stringify(data) : null]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Get notifications for user
   */
  async getNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;
    
    const params = [userId];
    
    if (unreadOnly) {
      query += ' AND is_read = false';
    }
    
    query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3;';
    params.push(limit, offset);
    
    try {
      const result = await this.db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = $1 AND is_read = false;
    `;
    
    try {
      const result = await this.db.query(query, [userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1
      RETURNING *;
    `;
    
    try {
      const result = await this.db.query(query, [notificationId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false;
    `;
    
    try {
      await this.db.query(query, [userId]);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to mark all as read: ${error.message}`);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    const query = 'DELETE FROM notifications WHERE id = $1 RETURNING id;';
    
    try {
      const result = await this.db.query(query, [notificationId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  /**
   * Delete all notifications for user
   */
  async deleteAllNotifications(userId) {
    const query = 'DELETE FROM notifications WHERE user_id = $1;';
    
    try {
      await this.db.query(query, [userId]);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete all notifications: ${error.message}`);
    }
  }

  /**
   * Broadcast notification to multiple users
   */
  async broadcastNotification(userIds, type, title, message, data = null) {
    const query = `
      INSERT INTO notifications (user_id, type, title, message, data)
      SELECT unnest($1::int[]), $2, $3, $4, $5;
    `;
    
    try {
      await this.db.query(query, [userIds, type, title, message, data ? JSON.stringify(data) : null]);
      return { success: true, count: userIds.length };
    } catch (error) {
      throw new Error(`Failed to broadcast notification: ${error.message}`);
    }
  }

  /**
   * Get notifications by type
   */
  async getNotificationsByType(userId, type, limit = 10, offset = 0) {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1 AND type = $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4;
    `;
    
    try {
      const result = await this.db.query(query, [userId, type, limit, offset]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get notifications by type: ${error.message}`);
    }
  }

  /**
   * Create booking notification
   */
  async createBookingNotification(userId, bookingId, status) {
    const titles = {
      pending: 'Booking Request Received',
      accepted: 'Booking Accepted',
      in_progress: 'Booking In Progress',
      completed: 'Booking Completed',
      cancelled: 'Booking Cancelled'
    };
    
    const messages = {
      pending: 'You have a new booking request',
      accepted: 'Your booking has been accepted',
      in_progress: 'Your booking is now in progress',
      completed: 'Your booking has been completed',
      cancelled: 'Your booking has been cancelled'
    };
    
    return this.createNotification(
      userId,
      'booking',
      titles[status] || 'Booking Update',
      messages[status] || 'Your booking status has been updated',
      { bookingId, status }
    );
  }

  /**
   * Create payment notification
   */
  async createPaymentNotification(userId, paymentId, status) {
    const titles = {
      pending: 'Payment Awaiting Confirmation',
      completed: 'Payment Successful',
      failed: 'Payment Failed',
      refunded: 'Payment Refunded'
    };
    
    const messages = {
      pending: 'Your payment is being processed',
      completed: 'Your payment has been completed successfully',
      failed: 'Your payment could not be processed',
      refunded: 'Your payment has been refunded'
    };
    
    return this.createNotification(
      userId,
      'payment',
      titles[status] || 'Payment Update',
      messages[status] || 'Your payment status has been updated',
      { paymentId, status }
    );
  }

  /**
   * Create message notification
   */
  async createMessageNotification(userId, senderName, messagePreview) {
    return this.createNotification(
      userId,
      'message',
      `New message from ${senderName}`,
      messagePreview.substring(0, 100),
      { senderName }
    );
  }
}

module.exports = Notification;
