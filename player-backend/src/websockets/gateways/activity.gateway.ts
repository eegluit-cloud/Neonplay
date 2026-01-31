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
  namespace: '/activity',
})
export class ActivityGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ActivityGateway.name);

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { feed: string },
  ) {
    const room = `activity:${data.feed}`;
    client.join(room);
    return { subscribed: room };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { feed: string },
  ) {
    const room = `activity:${data.feed}`;
    client.leave(room);
    return { unsubscribed: room };
  }

  // Emit new big win
  emitNewBigWin(data: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    gameName: string;
    gameSlug: string;
    amount: string;
    coinType: string;
    multiplier?: string;
    createdAt: string;
  }) {
    this.server.to('activity:recent-wins').emit('new_big_win', data);
    this.server.emit('new_big_win', data); // Also emit to all
    this.logger.debug(`Big win emitted: ${data.displayName} won ${data.amount}`);
  }

  // Emit batch of recent wins
  emitWinsBatch(wins: Array<{
    id: string;
    displayName: string;
    avatarUrl?: string;
    gameName: string;
    amount: string;
    coinType: string;
    multiplier?: string;
  }>) {
    this.server.to('activity:recent-wins').emit('wins_batch', { wins });
  }

  // Emit new bet
  emitNewBet(data: {
    displayName: string;
    gameName: string;
    betAmount: string;
    coinType: string;
    profit: string;
    multiplier?: string;
    isWin: boolean;
  }) {
    this.server.to('activity:live-bets').emit('new_bet', data);
  }

  // Emit high roller bet
  emitHighRollerBet(data: {
    displayName: string;
    gameName: string;
    betAmount: string;
    coinType: string;
    profit: string;
    isWin: boolean;
  }) {
    this.server.to('activity:high-rollers').emit('high_roller_bet', data);
    this.server.emit('high_roller_bet', data);
  }

  // Emit social proof toast for landing page
  emitSocialProofToast(data: {
    displayName: string;
    avatarUrl?: string;
    actionText: string;
    amount?: string;
    coinType?: string;
    eventType: string;
  }) {
    this.server.emit('social_proof_toast', data);
    this.logger.debug(`Social proof toast: ${data.displayName} ${data.actionText}`);
  }
}
