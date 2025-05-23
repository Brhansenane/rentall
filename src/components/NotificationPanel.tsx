import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from '@/lib/socketClient';
import Link from 'next/link';

export default function NotificationPanel() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // استخدام Socket.io للإشعارات الفورية
  const socket = useSocket(
    session?.user?.id || '', 
    session?.user?.role === 'admin'
  );
  
  // جلب الإشعارات من الخادم
  useEffect(() => {
    const fetchNotifications = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/notifications');
          const data = await response.json();
          
          if (data.success) {
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.isRead).length);
          }
        } catch (error) {
          console.error('خطأ في جلب الإشعارات:', error);
        }
      }
    };
    
    fetchNotifications();
  }, [session]);
  
  // الاستماع للإشعارات الجديدة
  useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      
      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);
  
  // تحديث حالة قراءة الإشعار
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة قراءة الإشعار:', error);
    }
  };
  
  // تحديد لون الإشعار حسب نوعه
  const getNotificationColor = (type) => {
    switch (type) {
      case 'property_pending':
        return 'bg-yellow-100 border-yellow-500';
      case 'property_approved':
        return 'bg-green-100 border-green-500';
      case 'property_rejected':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };
  
  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* عدد الإشعارات غير المقروءة */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* قائمة الإشعارات */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
          <div className="py-2 px-4 bg-gray-100 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">الإشعارات</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 ${getNotificationColor(notification.type)} ${!notification.isRead ? 'border-r-4' : ''}`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('ar-SA')}
                      </p>
                    </div>
                  </div>
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
