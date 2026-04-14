'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthManager } from '@/lib/auth';

export interface Message {
  id: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface BookingUpdate {
  bookingId: number;
  status: string;
  updatedAt: string;
  details?: any;
}

export interface Notification {
  id: string;
  type: 'booking' | 'payment' | 'message' | 'review' | 'dispute' | 'verification';
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  notifications: Notification[];
  onlineUsers: Set<number>;
  isTyping: boolean;
  typingUser: string | null;
  
  // Message methods
  sendMessage: (receiverId: number, message: string) => void;
  markMessageAsRead: (messageId: string) => void;
  getMessages: (userId: number, limit?: number) => void;
  
  // Typing indicators
  emitTyping: (receiverId: number, senderName: string) => void;
  stopTyping: (receiverId: number) => void;
  
  // Booking updates
  subscribeToBooking: (bookingId: number) => void;
  unsubscribeFromBooking: (bookingId: number) => void;
  
  // Notification methods
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const user = AuthManager.getCurrentUser();
    const token = AuthManager.getToken();

    if (!user || !token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      auth: {
        token,
        userId: user.userId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      setSocket(newSocket);
      newSocket.emit('user_online', user.userId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Message events
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('message_sent', (message: Message) => {
      setMessages(prev =>
        prev.map(m => (m.id === message.id ? message : m))
      );
    });

    newSocket.on('message_read', (data: { messageId: string }) => {
      setMessages(prev =>
        prev.map(m => (m.id === data.messageId ? { ...m, read: true } : m))
      );
    });

    newSocket.on('messages_history', (history: Message[]) => {
      setMessages(history);
    });

    // Typing indicators
    newSocket.on('typing_indicator', (data: { senderName: string }) => {
      setIsTyping(true);
      setTypingUser(data.senderName);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingUser(null);
      }, 3000);
    });

    // Notifications
    newSocket.on('new_notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    newSocket.on('notification_list', (notificationList: Notification[]) => {
      setNotifications(notificationList);
    });

    // Booking updates
    newSocket.on('booking_status_changed', (update: BookingUpdate) => {
      // Trigger callback or update UI
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('bookingUpdated', { detail: update })
        );
      }
    });

    // Payment updates
    newSocket.on('payment_status_changed', (update: any) => {
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('paymentUpdated', { detail: update })
        );
      }
    });

    // User status
    newSocket.on('user_status_change', (data: { userId: number; status: 'online' | 'offline' }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (data.status === 'online') {
          updated.add(data.userId);
        } else {
          updated.delete(data.userId);
        }
        return updated;
      });
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = useCallback((receiverId: number, message: string) => {
    if (!socketRef.current) return;

    const user = AuthManager.getCurrentUser();
    if (!user) return;

    socketRef.current.emit('send_message', {
      receiverId,
      message,
      senderName: user.email,
    });
  }, []);

  const markMessageAsRead = useCallback((messageId: string) => {
    if (!socketRef.current) return;

    const user = AuthManager.getCurrentUser();
    if (!user) return;

    socketRef.current.emit('mark_message_read', {
      messageId,
      readBy: user.userId,
    });
  }, []);

  const getMessages = useCallback((userId: number, limit = 50) => {
    if (!socketRef.current) return;

    socketRef.current.emit('get_messages', {
      userId,
      limit,
    });
  }, []);

  const emitTyping = useCallback((receiverId: number, senderName: string) => {
    if (!socketRef.current) return;

    const user = AuthManager.getCurrentUser();
    if (!user) return;

    socketRef.current.emit('user_typing', {
      receiverId,
      sender: user.userId,
      senderName,
    });
  }, []);

  const stopTyping = useCallback((receiverId: number) => {
    if (!socketRef.current) return;

    const user = AuthManager.getCurrentUser();
    if (!user) return;

    socketRef.current.emit('user_stopped_typing', {
      receiverId,
      sender: user.userId,
    });
  }, []);

  const subscribeToBooking = useCallback((bookingId: number) => {
    if (!socketRef.current) return;

    socketRef.current.emit('subscribe_booking_updates', {
      bookingId,
    });
  }, []);

  const unsubscribeFromBooking = useCallback((bookingId: number) => {
    if (!socketRef.current) return;

    socketRef.current.emit('unsubscribe_booking_updates', {
      bookingId,
    });
  }, []);

  const subscribeToNotifications = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('subscribe_notifications');
  }, []);

  const unsubscribeFromNotifications = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.emit('unsubscribe_notifications');
  }, []);

  return {
    socket,
    isConnected,
    messages,
    notifications,
    onlineUsers,
    isTyping,
    typingUser,
    sendMessage,
    markMessageAsRead,
    getMessages,
    emitTyping,
    stopTyping,
    subscribeToBooking,
    unsubscribeFromBooking,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  };
};
