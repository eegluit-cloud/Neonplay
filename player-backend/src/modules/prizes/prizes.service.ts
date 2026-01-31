import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

export interface PrizesQueryDto extends PaginationDto {
  category?: string;
  prizeType?: string;
  minValue?: number;
  maxValue?: number;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

@Injectable()
export class PrizesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available prizes with filtering and pagination
   */
  async getPrizes(query: PrizesQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = { isActive: true };

    if (query.category) {
      where.category = query.category;
    }

    if (query.prizeType) {
      where.prizeType = query.prizeType;
    }

    if (query.minValue !== undefined || query.maxValue !== undefined) {
      where.valueUsdc = {};
      if (query.minValue !== undefined) {
        where.valueUsdc.gte = query.minValue;
      }
      if (query.maxValue !== undefined) {
        where.valueUsdc.lte = query.maxValue;
      }
    }

    const [prizes, total] = await Promise.all([
      this.prisma.prize.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          prizeType: true,
          valueUsdc: true,
          costUsdc: true,
          imageUrl: true,
          stockQuantity: true,
          isPopular: true,
          createdAt: true,
        },
      }),
      this.prisma.prize.count({ where }),
    ]);

    const items = prizes.map((prize) => ({
      id: prize.id,
      name: prize.name,
      description: prize.description,
      category: prize.category,
      prizeType: prize.prizeType,
      valueUsdc: prize.valueUsdc.toString(),
      costUsdc: prize.costUsdc?.toString() || null,
      imageUrl: prize.imageUrl,
      stockQuantity: prize.stockQuantity,
      isPopular: prize.isPopular,
      isAvailable: prize.stockQuantity === null || prize.stockQuantity > 0,
      createdAt: prize.createdAt,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get store prizes (purchasable with USDC)
   */
  async getStorePrizes(query: PrizesQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {
      isActive: true,
      prizeType: { in: ['redemption_store', 'both'] },
      costUsdc: { not: null },
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.minValue !== undefined || query.maxValue !== undefined) {
      where.costUsdc = where.costUsdc || {};
      if (query.minValue !== undefined) {
        where.costUsdc.gte = query.minValue;
      }
      if (query.maxValue !== undefined) {
        where.costUsdc.lte = query.maxValue;
      }
    }

    const [prizes, total] = await Promise.all([
      this.prisma.prize.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          valueUsdc: true,
          costUsdc: true,
          imageUrl: true,
          stockQuantity: true,
          isPopular: true,
          createdAt: true,
        },
      }),
      this.prisma.prize.count({ where }),
    ]);

    const items = prizes.map((prize) => ({
      id: prize.id,
      name: prize.name,
      description: prize.description,
      category: prize.category,
      valueUsdc: prize.valueUsdc.toString(),
      costUsdc: prize.costUsdc?.toString() || null,
      imageUrl: prize.imageUrl,
      stockQuantity: prize.stockQuantity,
      isPopular: prize.isPopular,
      isAvailable: prize.stockQuantity === null || prize.stockQuantity > 0,
      createdAt: prize.createdAt,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get prize categories
   */
  async getPrizeCategories() {
    // Get distinct categories from prizes
    const prizes = await this.prisma.prize.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return prizes.map((p) => p.category);
  }

  /**
   * Get prize tiers (leaderboard prizes)
   */
  async getPrizeTiers() {
    const tiers = await this.prisma.prizeTier.findMany({
      orderBy: [{ leaderboardType: 'asc' }, { position: 'asc' }],
      include: {
        prize: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            valueUsdc: true,
          },
        },
      },
    });

    return tiers.map((tier) => ({
      id: tier.id,
      leaderboardType: tier.leaderboardType,
      position: tier.position,
      amountUsdc: tier.amountUsdc.toString(),
      prize: tier.prize
        ? {
            id: tier.prize.id,
            name: tier.prize.name,
            description: tier.prize.description,
            imageUrl: tier.prize.imageUrl,
            valueUsdc: tier.prize.valueUsdc.toString(),
          }
        : null,
    }));
  }

  /**
   * Get user's prize redemptions
   */
  async getUserRedemptions(userId: string) {
    const redemptions = await this.prisma.prizeRedemption.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        prize: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            valueUsdc: true,
            imageUrl: true,
          },
        },
      },
    });

    return redemptions.map((redemption) => ({
      id: redemption.id,
      prize: {
        id: redemption.prize.id,
        name: redemption.prize.name,
        description: redemption.prize.description,
        category: redemption.prize.category,
        valueUsdc: redemption.prize.valueUsdc.toString(),
        imageUrl: redemption.prize.imageUrl,
      },
      status: redemption.status,
      shippingAddress: redemption.shippingAddress,
      trackingNumber: redemption.trackingNumber,
      carrier: redemption.carrier,
      notes: redemption.notes,
      processedAt: redemption.processedAt,
      shippedAt: redemption.shippedAt,
      deliveredAt: redemption.deliveredAt,
      createdAt: redemption.createdAt,
      trackingUrl: redemption.carrier && redemption.trackingNumber
        ? this.getTrackingUrl(redemption.carrier, redemption.trackingNumber)
        : null,
    }));
  }

  /**
   * Redeem a prize from the store
   */
  async redeemPrize(
    userId: string,
    prizeId: string,
    shippingAddress: ShippingAddress,
  ) {
    const prize = await this.prisma.prize.findFirst({
      where: {
        id: prizeId,
        isActive: true,
        prizeType: { in: ['redemption_store', 'both'] },
        costUsdc: { not: null },
      },
    });

    if (!prize) {
      throw new NotFoundException('Prize not found or not available for redemption');
    }

    if (prize.stockQuantity !== null && prize.stockQuantity <= 0) {
      throw new BadRequestException('This prize is out of stock');
    }

    // Check user's USDC balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.usdcBalance.lt(prize.costUsdc!)) {
      throw new BadRequestException('Insufficient USDC balance');
    }

    // Create redemption and deduct USDC
    return this.prisma.$transaction(async (tx) => {
      // Deduct USDC from wallet
      const newBalance = wallet.usdcBalance.minus(prize.costUsdc!);
      await tx.wallet.update({
        where: { userId },
        data: {
          usdcBalance: newBalance,
          version: { increment: 1 },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'prize_redemption',
          currency: 'USDC',
          amount: prize.costUsdc!.negated(),
          usdcAmount: prize.costUsdc!.negated(),
          exchangeRate: 1,
          balanceBefore: wallet.usdcBalance,
          balanceAfter: newBalance,
          referenceType: 'prize',
          referenceId: prizeId,
          status: 'completed',
          metadata: { prizeName: prize.name },
        },
      });

      // Decrement stock if applicable
      if (prize.stockQuantity !== null) {
        await tx.prize.update({
          where: { id: prizeId },
          data: { stockQuantity: { decrement: 1 } },
        });
      }

      // Create redemption record
      const redemption = await tx.prizeRedemption.create({
        data: {
          userId,
          prizeId,
          shippingAddress: shippingAddress as any,
          status: 'pending',
        },
        include: {
          prize: {
            select: {
              name: true,
              imageUrl: true,
              valueUsdc: true,
            },
          },
        },
      });

      return {
        success: true,
        redemption: {
          id: redemption.id,
          status: redemption.status,
          prize: {
            name: redemption.prize.name,
            imageUrl: redemption.prize.imageUrl,
            valueUsdc: redemption.prize.valueUsdc.toString(),
          },
          shippingAddress: redemption.shippingAddress,
          createdAt: redemption.createdAt,
          estimatedDelivery: this.getEstimatedDelivery(),
        },
        newBalance: newBalance.toString(),
      };
    });
  }

  /**
   * Get estimated delivery date (2-4 weeks from now)
   */
  private getEstimatedDelivery(): { from: Date; to: Date } {
    const from = new Date();
    from.setDate(from.getDate() + 14);

    const to = new Date();
    to.setDate(to.getDate() + 28);

    return { from, to };
  }

  /**
   * Generate tracking URL based on carrier
   */
  private getTrackingUrl(carrier: string, trackingNumber: string): string {
    const carriers: Record<string, string> = {
      ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
      fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
      usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
      dhl: `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
    };

    return carriers[carrier.toLowerCase()] || '';
  }
}
