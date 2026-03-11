import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocket(server: HTTPServer) {
  if (io) return io;

  io = new SocketIOServer(server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room for targeted notifications
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitNotification(userId: string, notification: any) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
}

export function emitPostUpdate(postId: string, update: any) {
  if (io) {
    io.emit('post:update', { postId, ...update });
  }
}
