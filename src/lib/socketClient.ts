import { useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = (userId: string, isAdmin: boolean) => {
  useEffect(() => {
    const initSocket = async () => {
      // تأكد من تهيئة الخادم
      await fetch('/api/socket');
      
      // إنشاء اتصال Socket.io
      if (!socket) {
        socket = io();
        
        socket.on('connect', () => {
          console.log('تم الاتصال بنظام الإشعارات الفوري');
          
          // الانضمام إلى غرفة المستخدم الخاصة
          socket.emit('join', userId);
          
          // إذا كان المستخدم مديراً، الانضمام إلى غرفة المديرين
          if (isAdmin) {
            socket.emit('join-admin');
          }
        });
        
        socket.on('disconnect', () => {
          console.log('انقطع الاتصال بنظام الإشعارات الفوري');
        });
      }
    };
    
    if (userId) {
      initSocket();
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, isAdmin]);
  
  return socket;
};

// دالة لإرسال إشعار للمستخدم
export const sendNotificationToUser = (userId: string, notification: any) => {
  if (socket) {
    socket.emit('server-notification', {
      room: `user-${userId}`,
      data: notification
    });
  }
};

// دالة لإرسال إشعار لجميع المديرين
export const sendNotificationToAdmins = (notification: any) => {
  if (socket) {
    socket.emit('server-notification', {
      room: 'admins',
      data: notification
    });
  }
};
