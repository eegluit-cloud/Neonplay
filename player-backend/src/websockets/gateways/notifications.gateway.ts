import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    return { subscribed: true };
  }

  // Send new notification to user
  emitNewNotification(userId: string, data: {
    id: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    imageUrl?: string;
    createdAt: string;
  }) {
    this.server.to(`user:${userId}`).emit('new', data);
    this.logger.debug(`Notification emitted to user ${userId}`);
  }

  // Update unread count
  emitCountUpdated(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('count_updated', { count });
  }

  // Broadcast system notification to all users
  emitSystemNotification(data: {
    type: string;
    title: string;
    message: string;
    priority: string;
  }) {
    this.server.emit('system', data);
  }
}
