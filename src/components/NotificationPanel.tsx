'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

let socket;

export default function NotificationPanel() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // إعداد اتصال Socket.io
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      // تهيئة الاتصال بالسوكت
      const setupSocket = async () => {
        await fetch('/api/socket');
        socket = io();

        // الانضمام إلى غرفة المستخدم الخاصة
        socket.emit('join', session.user.id);

        // إذا كان المستخدم مدير، انضم إلى غرفة المديرين
        if (session.user.role === 'admin') {
          socket.emit('join-admin');
        }

        // استماع للإشعارات
        socket.on('notification', (data) => {
          setNotifications(prev => [data, ...prev]);
          setUnreadCount(prev => prev + 1);
        });

        // جلب الإشعارات السابقة
        fetchNotifications();
      };

      setupSocket();

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [status, session]);

  // جلب الإشعارات السابقة
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    }
  };

  // تحديث حالة الإشعار كمقروء
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
    }
  };

  // تحديد لون الإشعار
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      default:
        return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2 px-3 bg-gray-100 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">الإشعارات</h3>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    notifications.forEach(n => {
                      if (!n.read) markAsRead(n._id);
                    });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  تحديد الكل كمقروء
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-l-4 p-3 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-opacity-50' : 'bg-opacity-25'}`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification._id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{notification.message}</p>
                    {!notification.read && (
                      <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString('ar-SA')}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                لا توجد إشعارات
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
