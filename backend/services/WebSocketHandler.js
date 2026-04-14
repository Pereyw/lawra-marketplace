/**
 * WebSocket Handler
 * Manages real-time chat and notifications using Socket.io
 */

class WebSocketHandler {
  constructor(io, messageModel, notificationModel) {
    this.io = io;
    this.messageModel = messageModel;
    this.notificationModel = notificationModel;
    this.userSockets = new Map(); // userId -> socket ID mapping
  }

  /**
   * Initialize socket event handlers
   */
  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`[WebSocket] User connected: ${socket.id}`);

      // ============ USER CONNECTION EVENTS ============

      socket.on('user_online', async (userId) => {
        console.log(`[WebSocket] User ${userId} came online`);
        this.userSockets.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user_${userId}`); // Join user-specific room

        // Notify others that user is online
        this.io.emit('user_status_change', {
          userId,
          status: 'online',
          timestamp: new Date()
        });
      });

      // ============ MESSAGING EVENTS ============

      /**
       * Send message
       * Event: send_message
       * Payload: { receiverId, message, bookingId (optional) }
       */
      socket.on('send_message', async (data) => {
        try {
          const senderId = socket.userId;
          const { receiverId, message, bookingId } = data;

          if (!receiverId || !message) {
            socket.emit('message_error', 'Invalid message data');
            return;
          }

          // Save message to database
          const savedMessage = await this.messageModel.createMessage(
            senderId,
            receiverId,
            message,
            bookingId || null
          );

          // Send message to receiver
          const receiverSocketId = this.userSockets.get(receiverId);
          if (receiverSocketId) {
            this.io.to(`user_${receiverId}`).emit('new_message', {
              id: savedMessage.id,
              senderId,
              message,
              senderName: data.senderName || 'User',
              timestamp: savedMessage.created_at,
              bookingId: bookingId || null
            });

            // Send notification
            await this.notificationModel.createMessageNotification(
              receiverId,
              data.senderName || 'User',
              message
            );
          } else {
            // User is offline, store offline notification
            await this.notificationModel.createNotification(
              receiverId,
              'message',
              `Message from ${data.senderName || 'User'}`,
              message,
              { senderId, bookingId }
            );
          }

          // Confirm delivery
          socket.emit('message_sent', {
            id: savedMessage.id,
            timestamp: savedMessage.created_at
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message_error', 'Failed to send message');
        }
      });

      /**
       * Mark message as read
       * Event: mark_message_read
       * Payload: { messageId }
       */
      socket.on('mark_message_read', async (data) => {
        try {
          const { messageId } = data;

          await this.messageModel.markAsRead(messageId);

          // Notify sender
          const message = await this.messageModel.getMessage(messageId);
          this.io.to(`user_${message.sender_id}`).emit('message_read', {
            messageId,
            readAt: new Date()
          });
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      /**
       * Get conversation history
       * Event: get_messages
       * Payload: { otherId, limit, offset }
       */
      socket.on('get_messages', async (data) => {
        try {
          const senderId = socket.userId;
          const { otherId, limit = 20, offset = 0 } = data;

          const messages = await this.messageModel.getConversation(
            senderId,
            otherId,
            limit,
            offset
          );

          socket.emit('messages_history', { messages });
        } catch (error) {
          console.error('Error fetching messages:', error);
          socket.emit('message_error', 'Failed to load messages');
        }
      });

      // ============ TYPING INDICATOR EVENTS ============

      /**
       * User is typing
       * Event: user_typing
       * Payload: { receiverId }
       */
      socket.on('user_typing', (data) => {
        const { receiverId } = data;
        const senderId = socket.userId;

        this.io.to(`user_${receiverId}`).emit('typing_indicator', {
          senderId,
          status: 'typing'
        });
      });

      /**
       * User stopped typing
       * Event: user_stopped_typing
       * Payload: { receiverId }
       */
      socket.on('user_stopped_typing', (data) => {
        const { receiverId } = data;
        const senderId = socket.userId;

        this.io.to(`user_${receiverId}`).emit('typing_indicator', {
          senderId,
          status: 'stopped'
        });
      });

      // ============ NOTIFICATION EVENTS ============

      /**
       * Subscribe to notifications for a booking
       * Event: subscribe_booking_updates
       * Payload: { bookingId }
       */
      socket.on('subscribe_booking_updates', (data) => {
        const { bookingId } = data;
        socket.join(`booking_${bookingId}`);
        console.log(`[WebSocket] User subscribed to booking ${bookingId}`);
      });

      /**
       * Unsubscribe from booking notifications
       * Event: unsubscribe_booking_updates
       * Payload: { bookingId }
       */
      socket.on('unsubscribe_booking_updates', (data) => {
        const { bookingId } = data;
        socket.leave(`booking_${bookingId}`);
      });

      // ============ BROADCAST NOTIFICATION (for backend) ============

      /**
       * Broadcast booking update
       * (Called from server/backend)
       */
      socket.on('booking_update', (data) => {
        const { bookingId, status, message } = data;
        this.io.to(`booking_${bookingId}`).emit('booking_status_changed', {
          bookingId,
          status,
          message,
          timestamp: new Date()
        });
      });

      /**
       * Broadcast payment update
       */
      socket.on('payment_update', (data) => {
        const { paymentId, bookingId, status, message } = data;
        this.io.to(`booking_${bookingId}`).emit('payment_status_changed', {
          paymentId,
          status,
          message,
          timestamp: new Date()
        });
      });

      // ============ DISCONNECT EVENT ============

      socket.on('disconnect', () => {
        const userId = socket.userId;
        if (userId) {
          this.userSockets.delete(userId);
          console.log(`[WebSocket] User ${userId} went offline`);

          // Notify others
          this.io.emit('user_status_change', {
            userId,
            status: 'offline',
            timestamp: new Date()
          });
        }
      });

      // ============ ERROR HANDLING ============

      socket.on('error', (error) => {
        console.error('[WebSocket] Socket error:', error);
      });
    });
  }

  /**
   * Broadcast notification to specific user
   */
  notifyUser(userId, type, data) {
    this.io.to(`user_${userId}`).emit('notification', {
      type,
      data,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast booking update to all subscribed users
   */
  broadcastBookingUpdate(bookingId, status, message) {
    this.io.to(`booking_${bookingId}`).emit('booking_status_changed', {
      bookingId,
      status,
      message,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast payment update
   */
  broadcastPaymentUpdate(bookingId, paymentId, status, message) {
    this.io.to(`booking_${bookingId}`).emit('payment_status_changed', {
      paymentId,
      bookingId,
      status,
      message,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast dispute update
   */
  broadcastDisputeUpdate(disputeId, bookingId, status, message) {
    this.io.to(`booking_${bookingId}`).emit('dispute_status_changed', {
      disputeId,
      bookingId,
      status,
      message,
      timestamp: new Date()
    });
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  /**
   * Get user's socket ID
   */
  getUserSocket(userId) {
    return this.userSockets.get(userId);
  }

  /**
   * Get total active connections
   */
  getActiveConnections() {
    return this.userSockets.size;
  }
}

module.exports = WebSocketHandler;
