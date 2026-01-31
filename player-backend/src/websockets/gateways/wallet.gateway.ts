import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/wallet',
})
export class WalletGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WalletGateway.name);

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: AuthenticatedSocket) {
    // Wallet subscriptions require authentication
    if (!client.userId) {
      this.logger.warn('Unauthenticated client attempted to subscribe to wallet');
      return { error: 'Authentication required for wallet subscriptions' };
    }

    // Join user's own wallet room (already handled by main gateway, but explicit is safer)
    client.join(`user:${client.userId}`);
    return { subscribed: true, userId: client.userId };
  }

  /**
   * Emit balance update to a specific user
   * INTERNAL USE ONLY - called from WalletService when balance changes
   * This method validates the userId format before emitting
   */
  emitBalanceUpdate(userId: string, data: {
    gcBalance: string;
    scBalance: string;
    transactionId?: string;
    transactionType?: string;
  }) {
    // Validate userId format (UUID)
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      this.logger.error(`Invalid userId format in emitBalanceUpdate: ${userId}`);
      return;
    }

    // Validate data fields are strings (prevent injection)
    if (typeof data.gcBalance !== 'string' || typeof data.scBalance !== 'string') {
      this.logger.error('Invalid data format in emitBalanceUpdate');
      return;
    }

    this.server.to(`user:${userId}`).emit('balance_updated', data);
    this.logger.debug(`Balance update emitted to user ${userId}`);
  }

  /**
   * Emit transaction completed event to a specific user
   * INTERNAL USE ONLY - called when a transaction is completed
   */
  emitTransactionCompleted(userId: string, data: {
    id: string;
    type: string;
    coinType: string;
    amount: string;
    balanceAfter: string;
    status: string;
    createdAt: string;
  }) {
    // Validate userId format (UUID)
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      this.logger.error(`Invalid userId format in emitTransactionCompleted: ${userId}`);
      return;
    }

    this.server.to(`user:${userId}`).emit('transaction_completed', data);
  }
}
