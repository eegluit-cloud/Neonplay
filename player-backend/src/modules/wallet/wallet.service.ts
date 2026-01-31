import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { Decimal } from '@prisma/client/runtime/library';
import { createPaginatedResult, getPaginationParams, PaginationDto } from '../../common/utils/pagination.util';
import { CryptoUtil } from '../../common/utils/crypto.util';

type CoinType = 'GC' | 'SC';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        gcBalance: true,
        scBalance: true,
        gcLifetimePurchased: true,
        scLifetimeEarned: true,
        scLifetimeRedeemed: true,
      },
    });

    if (!wallet) {
      // Create wallet if doesn't exist
      return this.prisma.wallet.create({
        data: { userId },
        select: {
          id: true,
          gcBalance: true,
          scBalance: true,
          gcLifetimePurchased: true,
          scLifetimeEarned: true,
          scLifetimeRedeemed: true,
        },
      });
    }

    return wallet;
  }

  async getTransactions(userId: string, query: any) {
    const { skip, take } = getPaginationParams(query);

    const where: any = { userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.coinType) {
      where.coinType = query.coinType;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return createPaginatedResult(transactions, total, query.page || 1, query.limit || 20);
  }

  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getCoinPackages() {
    return this.prisma.coinPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCryptoOptions() {
    return this.prisma.cryptoPaymentOption.findMany({
      where: { isActive: true },
    });
  }

  async initiatePurchase(userId: string, packageId: string, paymentMethod: string, ipAddress: string) {
    const coinPackage = await this.prisma.coinPackage.findUnique({
      where: { id: packageId, isActive: true },
    });

    if (!coinPackage) {
      throw new NotFoundException('Coin package not found');
    }

    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        packageId,
        amountUsd: coinPackage.priceUsd,
        gcAmount: coinPackage.gcAmount,
        scBonusAmount: coinPackage.scBonusAmount,
        paymentProvider: paymentMethod,
        status: 'pending',
      },
    });

    // In production, integrate with payment provider (Stripe, etc.)
    // For now, return purchase details
    return {
      purchaseId: purchase.id,
      amount: coinPackage.priceUsd,
      currency: 'USD',
      gcAmount: coinPackage.gcAmount,
      scBonusAmount: coinPackage.scBonusAmount,
      // paymentIntent: would come from Stripe
    };
  }

  async confirmPurchase(userId: string, purchaseId: string, paymentIntentId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id: purchaseId, userId, status: 'pending' },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found or already processed');
    }

    // In production, verify payment with provider
    // For now, simulate successful payment

    return this.prisma.$transaction(async (tx) => {
      // Update purchase status
      await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: 'completed',
          paymentIntentId,
          completedAt: new Date(),
        },
      });

      // Get wallet with optimistic locking
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      const newGcBalance = new Decimal(wallet.gcBalance).plus(purchase.gcAmount);
      const newScBalance = new Decimal(wallet.scBalance).plus(purchase.scBonusAmount);

      // Create transactions
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'purchase',
          coinType: 'GC',
          amount: purchase.gcAmount,
          balanceBefore: wallet.gcBalance,
          balanceAfter: newGcBalance,
          referenceType: 'purchase',
          referenceId: purchaseId,
          status: 'completed',
        },
      });

      if (new Decimal(purchase.scBonusAmount).gt(0)) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'bonus',
            coinType: 'SC',
            amount: purchase.scBonusAmount,
            balanceBefore: wallet.scBalance,
            balanceAfter: newScBalance,
            referenceType: 'purchase',
            referenceId: purchaseId,
            status: 'completed',
          },
        });
      }

      // Update wallet balance with optimistic locking - verify version match
      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: {
          gcBalance: newGcBalance,
          scBalance: newScBalance,
          gcLifetimePurchased: new Decimal(wallet.gcLifetimePurchased).plus(purchase.gcAmount),
          scLifetimeEarned: new Decimal(wallet.scLifetimeEarned).plus(purchase.scBonusAmount),
          version: { increment: 1 },
        },
      });

      // Check if update succeeded (version matched)
      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for wallet ${wallet.id} - concurrent modification detected`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      // Fetch updated wallet for response
      const updatedWallet = await tx.wallet.findUnique({
        where: { id: wallet.id },
      });

      if (!updatedWallet) {
        throw new BadRequestException('Failed to retrieve updated wallet');
      }

      // Publish balance update event
      await this.redis.publish('wallet:balance_updated', {
        userId,
        gcBalance: updatedWallet.gcBalance.toString(),
        scBalance: updatedWallet.scBalance.toString(),
      });

      return {
        success: true,
        wallet: {
          gcBalance: updatedWallet.gcBalance,
          scBalance: updatedWallet.scBalance,
        },
      };
    });
  }

  async requestRedemption(userId: string, scAmount: number, method: string, payoutDetails: any) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const amount = new Decimal(scAmount);

    if (amount.gt(wallet.scBalance)) {
      throw new BadRequestException('Insufficient SC balance');
    }

    // Minimum redemption check
    const minRedemption = new Decimal(100); // 100 SC minimum
    if (amount.lt(minRedemption)) {
      throw new BadRequestException('Minimum redemption is 100 SC');
    }

    // Calculate USD value (1 SC = $1 typically)
    const usdValue = amount;

    return this.prisma.$transaction(async (tx) => {
      // Encrypt payout details for security (PII protection)
      const encryptedPayoutDetails = CryptoUtil.encrypt(JSON.stringify(payoutDetails));

      // Create redemption request
      const redemption = await tx.redemption.create({
        data: {
          userId,
          scAmount: amount,
          usdValue,
          method,
          payoutDetails: { encrypted: encryptedPayoutDetails },
          status: 'pending',
        },
      });

      // Deduct from wallet immediately (hold)
      const newScBalance = new Decimal(wallet.scBalance).minus(amount);

      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'redeem',
          coinType: 'SC',
          amount: amount.neg(),
          balanceBefore: wallet.scBalance,
          balanceAfter: newScBalance,
          referenceType: 'redemption',
          referenceId: redemption.id,
          status: 'pending',
        },
      });

      // Update wallet with optimistic locking check
      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: {
          scBalance: newScBalance,
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for redemption - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      return {
        redemptionId: redemption.id,
        scAmount: amount,
        usdValue,
        status: 'pending',
      };
    });
  }

  async getRedemptions(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [redemptions, total] = await Promise.all([
      this.prisma.redemption.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.redemption.count({ where: { userId } }),
    ]);

    return createPaginatedResult(redemptions, total, query.page || 1, query.limit || 20);
  }

  async getAvailableBonuses(userId: string) {
    // Get daily, weekly, monthly bonus status
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyClaim, weeklyClaim, monthlyClaim] = await Promise.all([
      this.prisma.bonusClaim.findFirst({
        where: {
          userId,
          bonusType: 'daily',
          claimedAt: { gte: startOfDay },
        },
      }),
      this.prisma.bonusClaim.findFirst({
        where: {
          userId,
          bonusType: 'weekly',
          claimedAt: { gte: startOfWeek },
        },
      }),
      this.prisma.bonusClaim.findFirst({
        where: {
          userId,
          bonusType: 'monthly',
          claimedAt: { gte: startOfMonth },
        },
      }),
    ]);

    return {
      daily: {
        available: !dailyClaim,
        gcAmount: 1000,
        scAmount: 0.5,
        nextAvailable: dailyClaim ? new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) : null,
      },
      weekly: {
        available: !weeklyClaim,
        gcAmount: 10000,
        scAmount: 5,
        nextAvailable: weeklyClaim ? new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
      },
      monthly: {
        available: !monthlyClaim,
        gcAmount: 50000,
        scAmount: 25,
        nextAvailable: monthlyClaim ? new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1) : null,
      },
    };
  }

  async claimBonus(userId: string, bonusType: 'daily' | 'weekly' | 'monthly') {
    const bonuses = await this.getAvailableBonuses(userId);
    const bonus = bonuses[bonusType];

    if (!bonus.available) {
      throw new BadRequestException(`${bonusType} bonus already claimed`);
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const newGcBalance = new Decimal(wallet.gcBalance).plus(bonus.gcAmount);
      const newScBalance = new Decimal(wallet.scBalance).plus(bonus.scAmount);

      // Create bonus claim record
      await tx.bonusClaim.create({
        data: {
          userId,
          bonusType,
          gcAmount: bonus.gcAmount,
          scAmount: bonus.scAmount,
        },
      });

      // Create transactions
      if (bonus.gcAmount > 0) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'bonus',
            coinType: 'GC',
            amount: bonus.gcAmount,
            balanceBefore: wallet.gcBalance,
            balanceAfter: newGcBalance,
            referenceType: 'bonus',
            status: 'completed',
            metadata: { bonusType },
          },
        });
      }

      if (bonus.scAmount > 0) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'bonus',
            coinType: 'SC',
            amount: bonus.scAmount,
            balanceBefore: wallet.scBalance,
            balanceAfter: newScBalance,
            referenceType: 'bonus',
            status: 'completed',
            metadata: { bonusType },
          },
        });
      }

      // Update wallet with optimistic locking check
      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: {
          gcBalance: newGcBalance,
          scBalance: newScBalance,
          scLifetimeEarned: new Decimal(wallet.scLifetimeEarned).plus(bonus.scAmount),
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for bonus claim - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      return {
        success: true,
        bonusType,
        gcAmount: bonus.gcAmount,
        scAmount: bonus.scAmount,
        wallet: {
          gcBalance: newGcBalance,
          scBalance: newScBalance,
        },
      };
    });
  }

  // Internal method for game transactions
  async processGameTransaction(
    userId: string,
    coinType: CoinType,
    amount: Decimal,
    type: 'stake' | 'game_win' | 'game_loss',
    referenceId: string,
    metadata?: any,
  ) {
    // Validate amount is positive
    if (amount.lte(0)) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const currentBalance = coinType === 'GC' ? wallet.gcBalance : wallet.scBalance;

    if (type === 'stake' && amount.gt(currentBalance)) {
      throw new BadRequestException('Insufficient balance');
    }

    const newBalance = type === 'stake'
      ? new Decimal(currentBalance).minus(amount)
      : new Decimal(currentBalance).plus(amount);

    // Ensure balance doesn't go negative
    if (newBalance.lt(0)) {
      throw new BadRequestException('Transaction would result in negative balance');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type,
          coinType,
          amount: type === 'stake' ? amount.neg() : amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'game_round',
          referenceId,
          status: 'completed',
          metadata,
        },
      });

      const updateData: any = { version: { increment: 1 } };
      if (coinType === 'GC') {
        updateData.gcBalance = newBalance;
      } else {
        updateData.scBalance = newBalance;
        if (type === 'game_win') {
          updateData.scLifetimeEarned = new Decimal(wallet.scLifetimeEarned).plus(amount);
        }
      }

      // Use updateMany for proper optimistic locking check
      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: updateData,
      });

      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for game transaction - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      // Fetch updated wallet
      const updatedWallet = await tx.wallet.findUnique({
        where: { id: wallet.id },
      });

      return updatedWallet;
    });
  }
}
