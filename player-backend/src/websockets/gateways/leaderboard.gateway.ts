import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/leaderboard',
})
export class LeaderboardGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(LeaderboardGateway.name);

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: string; period: string },
  ) {
    const room = `leaderboard:${data.type}:${data.period}`;
    client.join(room);
    return { subscribed: room };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: string; period: string },
  ) {
    const room = `leaderboard:${data.type}:${data.period}`;
    client.leave(room);
    return { unsubscribed: room };
  }

  // Emit leaderboard update to all subscribers
  emitLeaderboardUpdate(type: string, period: string, data: {
    entries: Array<{
      rank: number;
      userId: string;
      username: string;
      avatarUrl?: string;
      score: string;
    }>;
    updatedAt: string;
  }) {
    const room = `leaderboard:${type}:${period}`;
    this.server.to(room).emit('updated', data);
    this.logger.debug(`Leaderboard update emitted to ${room}`);
  }

  // Notify specific user about rank change
  emitUserRankChanged(userId: string, data: {
    type: string;
    period: string;
    oldRank: number;
    newRank: number;
    score: string;
  }) {
    this.server.to(`user:${userId}`).emit('user_rank_changed', data);
  }
}
