import { NextApiRequest } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponseWithSocket } from '@/lib/socketClient';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (!res.socket.server.io) {
    console.log('إعداد خادم Socket.io');
    const io = new SocketIOServer(res.socket.server);
    
    io.on('connection', (socket) => {
      console.log('مستخدم جديد متصل:', socket.id);
      
      // الانضمام إلى غرفة المستخدم الخاصة
      socket.on('join', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`المستخدم ${userId} انضم إلى غرفته الخاصة`);
      });
      
      // الانضمام إلى غرفة المديرين
      socket.on('join-admin', () => {
        socket.join('admins');
        console.log('انضم مدير إلى غرفة المديرين');
      });
      
      // إرسال إشعار من الخادم
      socket.on('server-notification', ({ room, data }) => {
        console.log(`إرسال إشعار إلى ${room}:`, data);
        io.to(room).emit('notification', data);
      });
      
      socket.on('disconnect', () => {
        console.log('انقطع اتصال المستخدم:', socket.id);
      });
    });
    
    res.socket.server.io = io;
  }
  
  res.end();
}
