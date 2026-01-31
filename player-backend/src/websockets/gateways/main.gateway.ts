import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../database/redis/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/',
})
export class MainGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MainGateway.name);
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Subscribe to Redis channels for cross-instance communication
    this.subscribeToRedisEvents();
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);

      if (token) {
        const payload = await this.jwtService.verifyAsync(token);
        client.userId = payload.sub;
        client.username = payload.username;

        // Add to connected users
        if (!this.connectedUsers.has(payload.sub)) {
          this.connectedUsers.set(payload.sub, new Set());
        }
        this.connectedUsers.get(payload.sub)!.add(client.id);

        // Join user-specific room
        client.join(`user:${payload.sub}`);

        // Track online status in Redis
        await this.redis.sadd('online_users', payload.sub);

        this.logger.log(`User ${payload.username} connected (${client.id})`);
      } else {
        this.logger.log(`Anonymous client connected (${client.id})`);
      }

      // Everyone joins the public room
      client.join('public');
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      // Don't disconnect - allow anonymous connections
      client.join('public');
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
          // Remove from online users if no more connections
          await this.redis.srem('online_users', client.userId);
        }
      }
      this.logger.log(`User ${client.username} disconnected (${client.id})`);
    } else {
      this.logger.log(`Anonymous client disconnected (${client.id})`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    return 'pong';
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    // Validate room name format (prevent injection)
    if (!data.room || !/^[a-zA-Z0-9:_-]+$/.test(data.room)) {
      return { error: 'Invalid room name format' };
    }

    // Validate room subscription permissions
    if (data.room.startsWith('user:')) {
      // User rooms require authentication
      if (!client.userId) {
        return { error: 'Authentication required' };
      }

      // Users can only subscribe to their OWN user room
      const requestedUserId = data.room.replace('user:', '');
      if (requestedUserId !== client.userId) {
        this.logger.warn(`User ${client.userId} attempted to subscribe to another user's room: ${data.room}`);
        return { error: 'Unauthorized: Cannot subscribe to another user\'s room' };
      }
    }

    // Validate wallet room access (user-specific)
    if (data.room.startsWith('wallet:')) {
      if (!client.userId) {
        return { error: 'Authentication required' };
      }
      const requestedUserId = data.room.replace('wallet:', '');
      if (requestedUserId !== client.userId) {
        this.logger.warn(`User ${client.userId} attempted to subscribe to another user's wallet room: ${data.room}`);
        return { error: 'Unauthorized: Cannot subscribe to another user\'s wallet room' };
      }
    }

    client.join(data.room);
    return { subscribed: data.room };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    return { unsubscribed: data.room };
  }

  // Helper methods for broadcasting events
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.to('public').emit(event, data);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }

  private extractToken(client: Socket): string | null {
    // Try auth header first
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try query parameter
    const token = client.handshake.query.token as string;
    if (token) {
      return token;
    }

    // Try auth object
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    return null;
  }

  private async subscribeToRedisEvents() {
    // Subscribe to various Redis pub/sub channels
    const channels = [
      'wallet:balance_updated',
      'leaderboard:updated',
      'notification:new',
      'activity:new_win',
      'jackpot:updated',
      'jackpot:won',
    ];

    for (const channel of channels) {
      await this.redis.subscribe(channel, (message) => {
        try {
          const data = JSON.parse(message);
          this.handleRedisMessage(channel, data);
        } catch (error: any) {
          this.logger.error(`Error processing Redis message on ${channel}:`, error);
        }
      });
    }
  }

  private handleRedisMessage(channel: string, data: any) {
    switch (channel) {
      case 'wallet:balance_updated':
        if (data.userId) {
          this.emitToUser(data.userId, 'wallet:balance_updated', data);
        }
        break;

      case 'leaderboard:updated':
        this.emitToAll('leaderboard:updated', data);
        break;

      case 'notification:new':
        if (data.userId) {
          this.emitToUser(data.userId, 'notification:new', data);
        }
        break;

      case 'activity:new_win':
        this.emitToAll('activity:new_big_win', data);
        break;

      case 'jackpot:updated':
        this.emitToAll('jackpot:updated', data);
        break;

      case 'jackpot:won':
        this.emitToAll('jackpot:won', data);
        break;

      default:
        this.logger.warn(`Unknown Redis channel: ${channel}`);
    }
  }
}
