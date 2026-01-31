import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

type XpSource = 'game_play' | 'purchase' | 'bonus' | 'referral' | 'promotion' | 'adjustment';

@Injectable()
export class VipService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTiers() {
    const tiers = await this.prisma.vipTier.findMany({
      orderBy: { level: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
        minXp: true,
        iconUrl: true,
        color: true,
        benefits: true,
        cashbackPercent: true,
        redemptionBonusPercent: true,
        exclusivePromotions: true,
      },
    });

    return tiers.map((tier, index) => {
      const nextTier = tiers[index + 1];
      return {
        ...tier,
        minXp: tier.minXp.toString(),
        nextTierXp: nextTier ? nextTier.minXp.toString() : null,
        cashbackPercent: Number(tier.cashbackPercent),
        redemptionBonusPercent: Number(tier.redemptionBonusPercent),
      };
    });
  }

  async getUserVipStatus(userId: string) {
    let userVip = await this.prisma.userVip.findUnique({
      where: { userId },
      include: {
        tier: {
          select: {
            id: true,
            name: true,
            slug: true,
            level: true,
            minXp: true,
            iconUrl: true,
            color: true,
            benefits: true,
            cashbackPercent: true,
            redemptionBonusPercent: true,
            exclusivePromotions: true,
          },
        },
      },
    });

    // If user doesn't have VIP record, create one with the lowest tier
    if (!userVip) {
      const lowestTier = await this.prisma.vipTier.findFirst({
        orderBy: { level: 'asc' },
      });

      if (!lowestTier) {
        throw new NotFoundException('VIP tiers not configured');
      }

      userVip = await this.prisma.userVip.create({
        data: {
          userId,
          tierId: lowestTier.id,
          xpCurrent: BigInt(0),
          xpLifetime: BigInt(0),
          nextTierXp: lowestTier.minXp,
        },
        include: {
          tier: {
            select: {
              id: true,
              name: true,
              slug: true,
              level: true,
              minXp: true,
              iconUrl: true,
              color: true,
              benefits: true,
              cashbackPercent: true,
              redemptionBonusPercent: true,
              exclusivePromotions: true,
            },
          },
        },
      });
    }

    // Get next tier for progress calculation
    const nextTier = await this.prisma.vipTier.findFirst({
      where: { level: userVip.tier.level + 1 },
      orderBy: { level: 'asc' },
    });

    // Calculate progress to next tier
    const currentTierMinXp = BigInt(userVip.tier.minXp);
    const nextTierMinXp = nextTier ? BigInt(nextTier.minXp) : null;
    const xpCurrent = BigInt(userVip.xpCurrent);

    let progressPercent = 100;
    let xpToNextTier: bigint | null = null;

    if (nextTierMinXp !== null) {
      const xpNeeded = nextTierMinXp - currentTierMinXp;
      const xpProgress = xpCurrent - currentTierMinXp;
      progressPercent = xpNeeded > 0 ? Math.min(100, Number((xpProgress * BigInt(100)) / xpNeeded)) : 100;
      xpToNextTier = nextTierMinXp - xpCurrent;
      if (xpToNextTier < BigInt(0)) {
        xpToNextTier = BigInt(0);
      }
    }

    return {
      userId: userVip.userId,
      tier: {
        ...userVip.tier,
        minXp: userVip.tier.minXp.toString(),
        cashbackPercent: Number(userVip.tier.cashbackPercent),
        redemptionBonusPercent: Number(userVip.tier.redemptionBonusPercent),
      },
      xpCurrent: userVip.xpCurrent.toString(),
      xpLifetime: userVip.xpLifetime.toString(),
      cashbackAvailable: userVip.cashbackAvailable,
      tierUpgradedAt: userVip.tierUpgradedAt,
      nextTier: nextTier
        ? {
            id: nextTier.id,
            name: nextTier.name,
            slug: nextTier.slug,
            level: nextTier.level,
            minXp: nextTier.minXp.toString(),
          }
        : null,
      progress: {
        percent: progressPercent,
        xpToNextTier: xpToNextTier !== null ? xpToNextTier.toString() : null,
      },
    };
  }

  async getUserXpHistory(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [history, total] = await Promise.all([
      this.prisma.vipXpHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          xpAmount: true,
          source: true,
          referenceId: true,
          createdAt: true,
        },
      }),
      this.prisma.vipXpHistory.count({ where: { userId } }),
    ]);

    const items = history.map((h) => ({
      ...h,
      xpAmount: h.xpAmount.toString(),
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  async claimCashback(userId: string) {
    const userVip = await this.prisma.userVip.findUnique({
      where: { userId },
      include: {
        tier: true,
      },
    });

    if (!userVip) {
      throw new NotFoundException('VIP status not found');
    }

    const cashbackAmount = new Decimal(userVip.cashbackAvailable);

    if (cashbackAmount.lte(0)) {
      throw new BadRequestException('No cashback available to claim');
    }

    // Get user's wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const newScBalance = new Decimal(wallet.scBalance).plus(cashbackAmount);

    return this.prisma.$transaction(async (tx) => {
      // Reset cashback to 0
      await tx.userVip.update({
        where: { userId },
        data: {
          cashbackAvailable: new Decimal(0),
        },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'bonus',
          coinType: 'SC',
          amount: cashbackAmount,
          balanceBefore: wallet.scBalance,
          balanceAfter: newScBalance,
          referenceType: 'vip_cashback',
          referenceId: userVip.id,
          status: 'completed',
          metadata: {
            tierName: userVip.tier.name,
            cashbackPercent: Number(userVip.tier.cashbackPercent),
          },
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id, version: wallet.version },
        data: {
          scBalance: newScBalance,
          scLifetimeEarned: new Decimal(wallet.scLifetimeEarned).plus(cashbackAmount),
          version: { increment: 1 },
        },
      });

      return {
        success: true,
        cashbackClaimed: cashbackAmount,
        wallet: {
          scBalance: updatedWallet.scBalance,
        },
      };
    });
  }

  async getUserBenefits(userId: string) {
    const userVip = await this.prisma.userVip.findUnique({
      where: { userId },
      include: {
        tier: true,
      },
    });

    if (!userVip) {
      // Return default benefits for non-VIP users
      const lowestTier = await this.prisma.vipTier.findFirst({
        orderBy: { level: 'asc' },
      });

      if (!lowestTier) {
        throw new NotFoundException('VIP tiers not configured');
      }

      return {
        tierName: lowestTier.name,
        tierLevel: lowestTier.level,
        benefits: lowestTier.benefits || [],
        cashbackPercent: Number(lowestTier.cashbackPercent),
        redemptionBonusPercent: Number(lowestTier.redemptionBonusPercent),
        exclusivePromotions: lowestTier.exclusivePromotions || [],
        cashbackAvailable: '0',
      };
    }

    return {
      tierName: userVip.tier.name,
      tierLevel: userVip.tier.level,
      benefits: userVip.tier.benefits || [],
      cashbackPercent: Number(userVip.tier.cashbackPercent),
      redemptionBonusPercent: Number(userVip.tier.redemptionBonusPercent),
      exclusivePromotions: userVip.tier.exclusivePromotions || [],
      cashbackAvailable: userVip.cashbackAvailable.toString(),
    };
  }

  /**
   * Internal method to award XP to a user
   * This method should be called from other services (games, wallet, etc.)
   */
  async awardXp(
    userId: string,
    amount: number | bigint,
    source: XpSource,
    referenceId?: string,
  ) {
    const xpAmount = BigInt(amount);

    if (xpAmount <= 0) {
      throw new BadRequestException('XP amount must be positive');
    }

    // Get or create user VIP record
    let userVip = await this.prisma.userVip.findUnique({
      where: { userId },
      include: { tier: true },
    });

    if (!userVip) {
      const lowestTier = await this.prisma.vipTier.findFirst({
        orderBy: { level: 'asc' },
      });

      if (!lowestTier) {
        throw new NotFoundException('VIP tiers not configured');
      }

      userVip = await this.prisma.userVip.create({
        data: {
          userId,
          tierId: lowestTier.id,
          xpCurrent: BigInt(0),
          xpLifetime: BigInt(0),
          nextTierXp: lowestTier.minXp,
        },
        include: { tier: true },
      });
    }

    const newXpCurrent = BigInt(userVip.xpCurrent) + xpAmount;
    const newXpLifetime = BigInt(userVip.xpLifetime) + xpAmount;

    // Check if user qualifies for tier upgrade
    const nextTier = await this.prisma.vipTier.findFirst({
      where: {
        minXp: { lte: newXpCurrent },
        level: { gt: userVip.tier.level },
      },
      orderBy: { level: 'desc' },
    });

    return this.prisma.$transaction(async (tx) => {
      // Record XP history
      await tx.vipXpHistory.create({
        data: {
          userId,
          xpAmount,
          source,
          referenceId,
        },
      });

      // Update user VIP record
      const updateData: any = {
        xpCurrent: newXpCurrent,
        xpLifetime: newXpLifetime,
      };

      let tierUpgraded = false;
      let newTierName: string | null = null;

      if (nextTier) {
        updateData.tierId = nextTier.id;
        updateData.tierUpgradedAt = new Date();
        tierUpgraded = true;
        newTierName = nextTier.name;

        // Find the tier after the new tier to set nextTierXp
        const tierAfterNew = await tx.vipTier.findFirst({
          where: { level: nextTier.level + 1 },
          orderBy: { level: 'asc' },
        });
        updateData.nextTierXp = tierAfterNew ? tierAfterNew.minXp : null;
      }

      const updatedUserVip = await tx.userVip.update({
        where: { userId },
        data: updateData,
        include: { tier: true },
      });

      return {
        success: true,
        xpAwarded: xpAmount.toString(),
        xpCurrent: updatedUserVip.xpCurrent.toString(),
        xpLifetime: updatedUserVip.xpLifetime.toString(),
        tierUpgraded,
        currentTier: {
          name: updatedUserVip.tier.name,
          level: updatedUserVip.tier.level,
        },
        newTierName,
      };
    });
  }

  /**
   * Internal method to accumulate cashback for a user
   * Called after game losses or at specified intervals
   */
  async accumulateCashback(userId: string, lossAmount: Decimal) {
    const userVip = await this.prisma.userVip.findUnique({
      where: { userId },
      include: { tier: true },
    });

    if (!userVip) {
      return; // No VIP status, no cashback
    }

    const cashbackPercent = new Decimal(userVip.tier.cashbackPercent);
    const cashbackAmount = lossAmount.times(cashbackPercent).dividedBy(100);

    if (cashbackAmount.lte(0)) {
      return;
    }

    await this.prisma.userVip.update({
      where: { userId },
      data: {
        cashbackAvailable: new Decimal(userVip.cashbackAvailable).plus(cashbackAmount),
      },
    });
  }

  /**
   * Get VIP tier requirements summary
   */
  async getTierRequirements() {
    const tiers = await this.prisma.vipTier.findMany({
      orderBy: { level: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
        minXp: true,
        iconUrl: true,
        color: true,
        cashbackPercent: true,
        redemptionBonusPercent: true,
      },
    });

    return tiers.map((tier) => ({
      ...tier,
      minXp: tier.minXp.toString(),
      cashbackPercent: Number(tier.cashbackPercent),
      redemptionBonusPercent: Number(tier.redemptionBonusPercent),
    }));
  }
}
