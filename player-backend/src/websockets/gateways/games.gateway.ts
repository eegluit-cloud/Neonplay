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
  namespace: '/games',
})
export class GamesGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GamesGateway.name);

  @SubscribeMessage('subscribe:game')
  handleSubscribeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    if (data?.gameId) {
      client.join(`game:${data.gameId}`);
      this.logger.debug(`Client ${client.id} subscribed to game ${data.gameId}`);
      return { subscribed: true, gameId: data.gameId };
    }
    return { subscribed: false, error: 'gameId required' };
  }

  @SubscribeMessage('unsubscribe:game')
  handleUnsubscribeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    if (data?.gameId) {
      client.leave(`game:${data.gameId}`);
      return { unsubscribed: true };
    }
    return { unsubscribed: false };
  }

  @SubscribeMessage('subscribe:session')
  handleSubscribeSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    if (data?.sessionId) {
      client.join(`session:${data.sessionId}`);
      return { subscribed: true, sessionId: data.sessionId };
    }
    return { subscribed: false, error: 'sessionId required' };
  }

  // Emit when a game session starts
  emitSessionStarted(userId: string, data: {
    sessionId: string;
    gameId: string;
    gameName: string;
    coinType: string;
  }) {
    this.server.to(`user:${userId}`).emit('session:started', data);
  }

  // Emit game round result to the user
  emitRoundResult(userId: string, data: {
    sessionId: string;
    roundId: string;
    betAmount: string;
    winAmount: string;
    multiplier?: string;
    balanceAfter: string;
    resultData?: any;
  }) {
    this.server.to(`user:${userId}`).emit('round:result', data);
  }

  // Emit when a game session ends
  emitSessionEnded(userId: string, data: {
    sessionId: string;
    totalBet: string;
    totalWin: string;
    roundsPlayed: number;
    netResult: string;
  }) {
    this.server.to(`user:${userId}`).emit('session:ended', data);
  }

  // Emit live game activity (for spectators or activity feed)
  emitLiveGameActivity(gameId: string, data: {
    userId: string;
    displayName: string;
    action: 'bet' | 'win' | 'bigwin';
    amount: string;
    coinType: string;
    multiplier?: string;
    gameName: string;
  }) {
    this.server.to(`game:${gameId}`).emit('game:activity', data);
  }

  // Emit big win notification (broadcast to all)
  emitBigWin(data: {
    displayName: string;
    gameName: string;
    gameSlug: string;
    amount: string;
    coinType: string;
    multiplier: string;
  }) {
    this.server.emit('game:bigwin', data);
    this.logger.log(`Big win: ${data.displayName} won ${data.amount} ${data.coinType} on ${data.gameName}`);
  }

  // Emit free spins awarded
  emitFreeSpinsAwarded(userId: string, data: {
    sessionId: string;
    freeSpinsCount: number;
    multiplier?: string;
  }) {
    this.server.to(`user:${userId}`).emit('game:freespins', data);
  }

  // Emit bonus game triggered
  emitBonusTriggered(userId: string, data: {
    sessionId: string;
    bonusType: string;
    potentialWin?: string;
  }) {
    this.server.to(`user:${userId}`).emit('game:bonus', data);
  }
}
