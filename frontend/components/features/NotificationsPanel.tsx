'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { notificationsApi } from '@/lib/api';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Trash2,
} from 'lucide-react';

export function NotificationsPanel() {
  const { notifications, isConnected } = useSocket();
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // React to socket notifications
  useEffect(() => {
    if (notifications.length > 0) {
      setAllNotifications((prev) => [
        ...notifications,
        ...prev.filter((n) => !notifications.find((sn) => sn.id === n.id)),
      ]);
    }
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll(50, 0);
      setAllNotifications(response.data.data.notifications || []);

      const unreadResponse = await notificationsApi.getUnreadCount();
      setUnreadCount(unreadResponse.data.data.count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(parseInt(notificationId));
      setAllNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsApi.delete(parseInt(notificationId));
      setAllNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      booking: <CheckCircle2 className="text-blue-600" />,
      payment: <DollarSign className="text-green-600" />,
      message: <MessageSquare className="text-purple-600" />,
      review: <MessageSquare className="text-orange-600" />,
      dispute: <AlertCircle className="text-red-600" />,
      verification: <CheckCircle2 className="text-cyan-600" />,
    };
    return icons[type] || icons['booking'];
  };

  const filteredNotifications = selectedType
    ? allNotifications.filter((n) => n.type === selectedType)
    : allNotifications;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {Math.min(unreadCount, 9)}+
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold">Notifications</h2>
        </div>
        <button
          onClick={loadNotifications}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold disabled:text-gray-400"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType(null)}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            selectedType === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {['booking', 'payment', 'message', 'review', 'dispute', 'verification'].map(
          (type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full whitespace-nowrap capitalize ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {type}
            </button>
          )
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border-l-4 flex items-start justify-between ${
                notification.read
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex gap-3 flex-1">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  {notification.data && (
                    <p className="text-sm text-gray-700 mt-2">
                      {JSON.stringify(notification.data).substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Mark as read"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status */}
      <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        ></div>
        {isConnected ? 'Connected for real-time updates' : 'Disconnected from server'}
      </div>
    </div>
  );
}
