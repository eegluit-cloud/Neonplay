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
  namespace: '/jackpot',
})
export class JackpotGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(JackpotGateway.name);

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket) {
    client.join('jackpots');
    this.logger.debug(`Client ${client.id} subscribed to jackpots`);
    return { subscribed: true };
  }

  @SubscribeMessage('subscribe:jackpot')
  handleSubscribeJackpot(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jackpotId: string },
  ) {
    if (data?.jackpotId) {
      client.join(`jackpot:${data.jackpotId}`);
      return { subscribed: true, jackpotId: data.jackpotId };
    }
    return { subscribed: false, error: 'jackpotId required' };
  }

  @SubscribeMessage('subscribe:type')
  handleSubscribeType(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { type: 'mini' | 'minor' | 'major' | 'grand' },
  ) {
    if (data?.type) {
      client.join(`jackpot-type:${data.type}`);
      return { subscribed: true, type: data.type };
    }
    return { subscribed: false, error: 'type required' };
  }

  // Emit jackpot value update (called frequently as jackpot grows)
  emitValueUpdate(jackpotId: string, data: {
    type: string;
    name: string;
    currentAmount: string;
    previousAmount?: string;
    increment?: string;
  }) {
    this.server.to('jackpots').emit('jackpot:value', data);
    this.server.to(`jackpot:${jackpotId}`).emit('jackpot:value', data);
    this.server.to(`jackpot-type:${data.type}`).emit('jackpot:value', data);
  }

  // Emit all jackpot values (batch update)
  emitAllValues(data: Array<{
    id: string;
    type: string;
    name: string;
    currentAmount: string;
  }>) {
    this.server.to('jackpots').emit('jackpot:all_values', data);
  }

  // Emit jackpot won notification (broadcast to all)
  emitJackpotWon(data: {
    jackpotId: string;
    type: string;
    name: string;
    winnerDisplayName: string;
    winnerAvatarUrl?: string;
    amount: string;
    gameName: string;
    gameSlug: string;
    wonAt: string;
  }) {
    // Broadcast to everyone
    this.server.emit('jackpot:won', data);
    this.logger.log(`JACKPOT WON! ${data.winnerDisplayName} won ${data.amount} on ${data.name}`);
  }

  // Emit jackpot won to specific user (detailed)
  emitJackpotWonToUser(userId: string, data: {
    jackpotId: string;
    type: string;
    name: string;
    amount: string;
    gameRoundId: string;
    gameName: string;
    balanceAfter: string;
  }) {
    this.server.to(`user:${userId}`).emit('jackpot:you_won', data);
  }

  // Emit jackpot reset (after someone wins)
  emitJackpotReset(jackpotId: string, data: {
    type: string;
    name: string;
    newSeedAmount: string;
    previousWinner: string;
    previousAmount: string;
  }) {
    this.server.to('jackpots').emit('jackpot:reset', data);
    this.server.to(`jackpot:${jackpotId}`).emit('jackpot:reset', data);
    this.server.to(`jackpot-type:${data.type}`).emit('jackpot:reset', data);
  }

  // Emit near-miss notification (close to jackpot trigger)
  emitNearMiss(userId: string, data: {
    jackpotType: string;
    jackpotName: string;
    currentAmount: string;
    missedBy?: string;
  }) {
    this.server.to(`user:${userId}`).emit('jackpot:near_miss', data);
  }

  // Emit recent wins update
  emitRecentWins(data: Array<{
    id: string;
    type: string;
    displayName: string;
    amount: string;
    gameName: string;
    wonAt: string;
  }>) {
    this.server.to('jackpots').emit('jackpot:recent_wins', data);
  }

  // Emit milestone reached (jackpot hits certain threshold)
  emitMilestoneReached(jackpotId: string, data: {
    type: string;
    name: string;
    currentAmount: string;
    milestone: string;
    message: string;
  }) {
    this.server.emit('jackpot:milestone', data);
    this.logger.log(`Jackpot milestone: ${data.name} reached ${data.milestone}`);
  }
}
