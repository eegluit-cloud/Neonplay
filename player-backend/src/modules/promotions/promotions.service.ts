import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

// Currency balance field mapping
const CURRENCY_BALANCE_FIELDS: Record<string, string> = {
  USD: 'usdBalance',
  EUR: 'eurBalance',
  GBP: 'gbpBalance',
  CAD: 'cadBalance',
  AUD: 'audBalance',
  PHP: 'phpBalance',
  INR: 'inrBalance',
  THB: 'thbBalance',
  CNY: 'cnyBalance',
  JPY: 'jpyBalance',
  USDC: 'usdcBalance',
  USDT: 'usdtBalance',
  BTC: 'btcBalance',
  ETH: 'ethBalance',
  SOL: 'solBalance',
  DOGE: 'dogeBalance',
};

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivePromotions() {
    const now = new Date();

    const promotions = await this.prisma.promotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        isActive: true,
        bonusAmount: true,
        bonusAmountUsdc: true,
        bonusCurrency: true,
        percentageBonus: true,
        maxBonusUsdc: true,
        wageringRequirement: true,
        minDepositUsdc: true,
        imageUrl: true,
        terms: true,
        startsAt: true,
        endsAt: true,
      },
    });

    return promotions;
  }

  async getPromotionBySlug(slug: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        bonusAmount: true,
        bonusAmountUsdc: true,
        bonusCurrency: true,
        percentageBonus: true,
        maxBonusUsdc: true,
        wageringRequirement: true,
        minDepositUsdc: true,
        imageUrl: true,
        terms: true,
        startsAt: true,
        endsAt: true,
        maxClaims: true,
        maxClaimsPerUser: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Query total claims separately
    const totalClaims = await this.prisma.userPromotion.count({
      where: {
        promotionId: promotion.id,
        status: { in: ['claimed', 'completed'] },
      },
    });

    const now = new Date();
    const isActive =
      promotion.startsAt === null ||
      (promotion.startsAt <= now &&
        (promotion.endsAt === null || promotion.endsAt >= now));

    return {
      ...promotion,
      isActive,
      totalClaims,
    };
  }

  async claimPromotion(userId: string, slug: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { slug },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Check if promotion is active
    const now = new Date();
    if (!promotion.isActive) {
      throw new BadRequestException('This promotion is no longer active');
    }

    if (promotion.startsAt && promotion.startsAt > now) {
      throw new BadRequestException('This promotion has not started yet');
    }

    if (promotion.endsAt && promotion.endsAt < now) {
      throw new BadRequestException('This promotion has expired');
    }

    // Check max claims
    if (promotion.maxClaims) {
      const totalClaims = await this.prisma.userPromotion.count({
        where: {
          promotionId: promotion.id,
          status: { in: ['claimed', 'completed'] },
        },
      });

      if (totalClaims >= promotion.maxClaims) {
        throw new BadRequestException('This promotion has reached its maximum claims');
      }
    }

    // Check max claims per user
    const userClaims = await this.prisma.userPromotion.count({
      where: {
        userId,
        promotionId: promotion.id,
        status: { in: ['claimed', 'completed'] },
      },
    });

    const maxPerUser = promotion.maxClaimsPerUser || 1;
    if (userClaims >= maxPerUser) {
      throw new ConflictException('You have already claimed this promotion');
    }

    // Get user's wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Calculate bonus amounts
    const bonusAmount = promotion.bonusAmount || new Decimal(0);
    const bonusAmountUsdc = promotion.bonusAmountUsdc || new Decimal(0);
    const bonusCurrency = promotion.bonusCurrency || 'USDC';
    const wageringTarget = promotion.wageringRequirement
      ? new Decimal(bonusAmountUsdc).times(promotion.wageringRequirement)
      : null;

    // Calculate expiration (30 days by default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return this.prisma.$transaction(async (tx) => {
      // Create user promotion record
      const userPromotion = await tx.userPromotion.create({
        data: {
          userId,
          promotionId: promotion.id,
          status: 'claimed',
          bonusAmount: bonusAmountUsdc,
          wageredAmount: new Decimal(0),
          wageringTarget,
          claimedAt: now,
          expiresAt,
        },
      });

      // Get the balance field for the bonus currency
      const balanceField = CURRENCY_BALANCE_FIELDS[bonusCurrency] || 'usdcBalance';
      const currentBalance = new Decimal((wallet as any)[balanceField] || 0);
      const newBalance = currentBalance.plus(bonusAmount);

      // Create transaction if bonus amount is greater than 0
      if (new Decimal(bonusAmount).gt(0)) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'bonus',
            currency: bonusCurrency,
            amount: bonusAmount,
            usdcAmount: bonusAmountUsdc,
            exchangeRate: bonusAmount.gt(0) ? bonusAmountUsdc.div(bonusAmount) : new Decimal(1),
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            referenceType: 'promotion',
            referenceId: userPromotion.id,
            status: 'completed',
            metadata: { promotionSlug: slug },
          },
        });
      }

      // Update wallet
      await tx.wallet.update({
        where: { id: wallet.id, version: wallet.version },
        data: {
          [balanceField]: newBalance,
          lifetimeWon: new Decimal(wallet.lifetimeWon).plus(bonusAmountUsdc),
          lifetimeBonuses: new Decimal(wallet.lifetimeBonuses).plus(bonusAmountUsdc),
          version: { increment: 1 },
        },
      });

      return {
        success: true,
        promotion: {
          name: promotion.name,
          slug: promotion.slug,
        },
        bonusAwarded: {
          amount: bonusAmount,
          currency: bonusCurrency,
          usdcEquivalent: bonusAmountUsdc,
        },
        wageringRequirement: promotion.wageringRequirement,
        wageringTarget,
        expiresAt,
      };
    });
  }

  async applyPromoCode(userId: string, code: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Invalid promo code');
    }

    // Use the same claim logic
    return this.claimPromotion(userId, promotion.slug);
  }

  async getSpinWheelConfig() {
    const segments = await this.prisma.spinWheelSegment.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        label: true,
        currency: true,
        amount: true,
        amountUsdc: true,
        color: true,
        sortOrder: true,
      },
    });

    return {
      segments,
      spinCost: 0, // Free spin configuration
      maxSpinsPerDay: 1,
    };
  }

  async spinWheel(userId: string) {
    // Check if user has already spun today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSpinToday = await this.prisma.bonusClaim.findFirst({
      where: {
        userId,
        bonusType: 'spin_wheel',
        claimedAt: { gte: today },
      },
    });

    if (existingSpinToday) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      throw new BadRequestException({
        message: 'You have already spun the wheel today',
        nextSpinAvailable: tomorrow,
      });
    }

    // Get active wheel segments
    const segments = await this.prisma.spinWheelSegment.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (segments.length === 0) {
      throw new BadRequestException('Spin wheel is not available');
    }

    // Calculate total probability
    const totalProbability = segments.reduce(
      (sum, s) => sum + Number(s.probability),
      0,
    );

    // Generate random number and select winning segment
    const random = Math.random() * totalProbability;
    let cumulative = 0;
    let winningSegment = segments[0];

    for (const segment of segments) {
      cumulative += Number(segment.probability);
      if (random <= cumulative) {
        winningSegment = segment;
        break;
      }
    }

    // Get user's wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const currency = winningSegment.currency;
    const amount = new Decimal(winningSegment.amount);
    const amountUsdc = new Decimal(winningSegment.amountUsdc);
    const balanceField = CURRENCY_BALANCE_FIELDS[currency] || 'usdcBalance';
    const currentBalance = new Decimal((wallet as any)[balanceField] || 0);
    const newBalance = currentBalance.plus(amount);

    return this.prisma.$transaction(async (tx) => {
      // Record the spin
      const bonusClaim = await tx.bonusClaim.create({
        data: {
          userId,
          bonusType: 'spin_wheel',
          currency,
          amount,
          usdcAmount: amountUsdc,
        },
      });

      // Create transaction if amount is greater than 0
      if (amount.gt(0)) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'bonus',
            currency,
            amount,
            usdcAmount: amountUsdc,
            exchangeRate: amount.gt(0) ? amountUsdc.div(amount) : new Decimal(1),
            balanceBefore: currentBalance,
            balanceAfter: newBalance,
            referenceType: 'bonus',
            referenceId: bonusClaim.id,
            status: 'completed',
            metadata: { bonusType: 'spin_wheel', segmentId: winningSegment.id },
          },
        });
      }

      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id, version: wallet.version },
        data: {
          [balanceField]: newBalance,
          lifetimeWon: new Decimal(wallet.lifetimeWon).plus(amountUsdc),
          lifetimeBonuses: new Decimal(wallet.lifetimeBonuses).plus(amountUsdc),
          version: { increment: 1 },
        },
      });

      // Calculate next spin time
      const nextSpinAvailable = new Date(today);
      nextSpinAvailable.setDate(nextSpinAvailable.getDate() + 1);

      return {
        success: true,
        winningSegment: {
          id: winningSegment.id,
          label: winningSegment.label,
          currency,
          amount,
          amountUsdc,
          color: winningSegment.color,
        },
        wallet: {
          primaryCurrency: updatedWallet.primaryCurrency,
          [balanceField]: (updatedWallet as any)[balanceField],
        },
        nextSpinAvailable,
      };
    });
  }

  async getUserPromotions(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [userPromotions, total] = await Promise.all([
      this.prisma.userPromotion.findMany({
        where: { userId },
        orderBy: { claimedAt: 'desc' },
        skip,
        take,
        include: {
          promotion: {
            select: {
              name: true,
              slug: true,
              type: true,
              imageUrl: true,
              wageringRequirement: true,
            },
          },
        },
      }),
      this.prisma.userPromotion.count({ where: { userId } }),
    ]);

    const items = userPromotions.map((up) => ({
      id: up.id,
      promotionName: up.promotion.name,
      promotionSlug: up.promotion.slug,
      promotionType: up.promotion.type,
      imageUrl: up.promotion.imageUrl,
      status: up.status,
      bonusAmount: up.bonusAmount,
      wageredAmount: up.wageredAmount,
      wageringTarget: up.wageringTarget,
      wageringRequirement: up.promotion.wageringRequirement,
      wageringProgress: up.wageringTarget
        ? Math.min(
            100,
            Number(up.wageredAmount) / Number(up.wageringTarget) * 100,
          )
        : null,
      claimedAt: up.claimedAt,
      completedAt: up.completedAt,
      expiresAt: up.expiresAt,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  async getUserActivePromotions(userId: string) {
    const now = new Date();

    const activePromotions = await this.prisma.userPromotion.findMany({
      where: {
        userId,
        status: 'claimed',
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      orderBy: { claimedAt: 'desc' },
      include: {
        promotion: {
          select: {
            name: true,
            slug: true,
            type: true,
            imageUrl: true,
            wageringRequirement: true,
          },
        },
      },
    });

    return activePromotions.map((up) => {
      const wageringProgress = up.wageringTarget
        ? Math.min(100, Number(up.wageredAmount) / Number(up.wageringTarget) * 100)
        : null;

      const remainingWager = up.wageringTarget
        ? Math.max(0, Number(up.wageringTarget) - Number(up.wageredAmount))
        : null;

      return {
        id: up.id,
        promotionName: up.promotion.name,
        promotionSlug: up.promotion.slug,
        promotionType: up.promotion.type,
        imageUrl: up.promotion.imageUrl,
        bonusAmount: up.bonusAmount,
        wageredAmount: up.wageredAmount,
        wageringTarget: up.wageringTarget,
        wageringRequirement: up.promotion.wageringRequirement,
        wageringProgress,
        remainingWager,
        claimedAt: up.claimedAt,
        expiresAt: up.expiresAt,
        daysRemaining: up.expiresAt
          ? Math.max(0, Math.ceil((up.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : null,
      };
    });
  }
}
