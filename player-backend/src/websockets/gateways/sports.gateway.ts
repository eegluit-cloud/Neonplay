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
  namespace: '/sports',
})
export class SportsGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SportsGateway.name);

  @SubscribeMessage('subscribe:match')
  handleSubscribeMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    if (data?.matchId) {
      client.join(`match:${data.matchId}`);
      this.logger.debug(`Client ${client.id} subscribed to match ${data.matchId}`);
      return { subscribed: true, matchId: data.matchId };
    }
    return { subscribed: false, error: 'matchId required' };
  }

  @SubscribeMessage('unsubscribe:match')
  handleUnsubscribeMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ) {
    if (data?.matchId) {
      client.leave(`match:${data.matchId}`);
      return { unsubscribed: true };
    }
    return { unsubscribed: false };
  }

  @SubscribeMessage('subscribe:sport')
  handleSubscribeSport(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sportSlug: string },
  ) {
    if (data?.sportSlug) {
      client.join(`sport:${data.sportSlug}`);
      return { subscribed: true, sportSlug: data.sportSlug };
    }
    return { subscribed: false, error: 'sportSlug required' };
  }

  @SubscribeMessage('subscribe:league')
  handleSubscribeLeague(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { leagueSlug: string },
  ) {
    if (data?.leagueSlug) {
      client.join(`league:${data.leagueSlug}`);
      return { subscribed: true, leagueSlug: data.leagueSlug };
    }
    return { subscribed: false, error: 'leagueSlug required' };
  }

  @SubscribeMessage('subscribe:live')
  handleSubscribeLive(@ConnectedSocket() client: Socket) {
    client.join('live-matches');
    return { subscribed: true };
  }

  // Emit match score update
  emitScoreUpdate(matchId: string, data: {
    homeScore: number;
    awayScore: number;
    liveMinute?: number;
    livePeriod?: string;
    scorer?: string;
    eventType?: 'goal' | 'penalty' | 'own_goal' | 'var_review';
  }) {
    this.server.to(`match:${matchId}`).emit('match:score', data);
    this.server.to('live-matches').emit('match:score', { matchId, ...data });
  }

  // Emit odds update for a market
  emitOddsUpdate(matchId: string, data: {
    marketId: string;
    marketType: string;
    odds: Array<{
      oddId: string;
      selection: string;
      value: string;
      previousValue?: string;
      movement: 'up' | 'down' | 'stable';
    }>;
  }) {
    this.server.to(`match:${matchId}`).emit('match:odds', data);
  }

  // Emit match status change (upcoming -> live -> finished)
  emitMatchStatusChange(matchId: string, data: {
    previousStatus: string;
    newStatus: string;
    result?: string;
    homeScore?: number;
    awayScore?: number;
  }) {
    this.server.to(`match:${matchId}`).emit('match:status', data);
    this.server.to('live-matches').emit('match:status', { matchId, ...data });
    this.logger.log(`Match ${matchId} status changed: ${data.previousStatus} -> ${data.newStatus}`);
  }

  // Emit market suspension (odds locked for betting)
  emitMarketSuspended(matchId: string, data: {
    marketId: string;
    marketType: string;
    reason?: string;
  }) {
    this.server.to(`match:${matchId}`).emit('market:suspended', data);
  }

  // Emit market resumed (odds unlocked)
  emitMarketResumed(matchId: string, data: {
    marketId: string;
    marketType: string;
  }) {
    this.server.to(`match:${matchId}`).emit('market:resumed', data);
  }

  // Emit bet placed notification to user
  emitBetPlaced(userId: string, data: {
    betId: string;
    type: string;
    stake: string;
    coinType: string;
    potentialWin: string;
    totalOdds: string;
    selections: Array<{
      matchId: string;
      homeTeam: string;
      awayTeam: string;
      selection: string;
      odds: string;
    }>;
  }) {
    this.server.to(`user:${userId}`).emit('bet:placed', data);
  }

  // Emit bet settled notification to user
  emitBetSettled(userId: string, data: {
    betId: string;
    status: 'won' | 'lost' | 'void' | 'partial';
    stake: string;
    actualWin?: string;
    coinType: string;
    selections: Array<{
      matchId: string;
      selection: string;
      status: string;
      result?: string;
    }>;
  }) {
    this.server.to(`user:${userId}`).emit('bet:settled', data);
    this.logger.log(`Bet ${data.betId} settled for user ${userId}: ${data.status}`);
  }

  // Emit cashout offer update
  emitCashoutUpdate(userId: string, data: {
    betId: string;
    cashoutValue: string;
    previousValue?: string;
    expiresAt?: string;
  }) {
    this.server.to(`user:${userId}`).emit('bet:cashout_update', data);
  }

  // Emit live match event (corner, card, substitution, etc.)
  emitMatchEvent(matchId: string, data: {
    eventType: 'corner' | 'yellow_card' | 'red_card' | 'substitution' | 'injury' | 'var' | 'penalty_awarded';
    minute: number;
    team: 'home' | 'away';
    playerName?: string;
    description?: string;
  }) {
    this.server.to(`match:${matchId}`).emit('match:event', data);
  }

  // Broadcast new live match started
  emitMatchStarted(data: {
    matchId: string;
    sportSlug: string;
    leagueSlug: string;
    homeTeam: string;
    awayTeam: string;
    scheduledAt: string;
  }) {
    this.server.to('live-matches').emit('match:started', data);
    this.server.to(`sport:${data.sportSlug}`).emit('match:started', data);
    this.server.to(`league:${data.leagueSlug}`).emit('match:started', data);
  }
}
