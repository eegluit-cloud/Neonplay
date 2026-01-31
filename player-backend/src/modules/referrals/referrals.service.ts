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

// Default reward amounts (can be configured via settings)
const DEFAULT_REFERRER_REWARD = new Decimal(10); // USDC reward for referrer
const DEFAULT_REFERRED_REWARD = new Decimal(5); // USDC reward for referred user
const QUALIFICATION_PURCHASE_AMOUNT = new Decimal(10); // Minimum purchase to qualify
const EXCHANGE_RATE = new Decimal(1); // 1:1 for USDC

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's referral code, creating one if it doesn't exist
   */
  async getUserReferralCode(userId: string) {
    // Check if user already has a referral code
    let referralCode = await this.prisma.referralCode.findUnique({
      where: { userId },
      select: {
        id: true,
        code: true,
        createdAt: true,
      },
    });

    // If no code exists, generate one
    if (!referralCode) {
      const code = await this.generateUniqueCode();

      referralCode = await this.prisma.referralCode.create({
        data: {
          userId,
          code,
        },
        select: {
          id: true,
          code: true,
          createdAt: true,
        },
      });
    }

    // Get referral link base URL (could be from config)
    const referralLink = `https://wbc.com/join?ref=${referralCode.code}`;

    return {
      code: referralCode.code,
      referralLink,
      createdAt: referralCode.createdAt,
    };
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: string) {
    // Ensure user has a referral code
    await this.getUserReferralCode(userId);

    // Count referrals by status
    const [totalReferred, qualifiedCount, rewardedCount, totalEarned] = await Promise.all([
      this.prisma.referral.count({
        where: { referrerId: userId },
      }),
      this.prisma.referral.count({
        where: {
          referrerId: userId,
          status: { in: ['qualified', 'rewarded'] },
        },
      }),
      this.prisma.referral.count({
        where: {
          referrerId: userId,
          status: 'rewarded',
        },
      }),
      this.prisma.referral.aggregate({
        where: {
          referrerId: userId,
          status: 'rewarded',
        },
        _sum: {
          referrerRewardUsdc: true,
        },
      }),
    ]);

    // Get pending referrals (signed up but not yet qualified)
    const pendingCount = await this.prisma.referral.count({
      where: {
        referrerId: userId,
        status: 'pending',
      },
    });

    return {
      totalReferred,
      qualified: qualifiedCount,
      pending: pendingCount,
      rewarded: rewardedCount,
      totalEarned: totalEarned._sum.referrerRewardUsdc || new Decimal(0),
      rewardPerReferral: DEFAULT_REFERRER_REWARD,
    };
  }

  /**
   * Get list of referred users with pagination
   */
  async getReferralsList(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [referrals, total] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          referred: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.referral.count({ where: { referrerId: userId } }),
    ]);

    const items = referrals.map((ref) => ({
      id: ref.id,
      referredUser: {
        id: ref.referred.id,
        username: this.maskUsername(ref.referred.username),
        avatarUrl: ref.referred.avatarUrl,
        joinedAt: ref.referred.createdAt,
      },
      status: ref.status,
      referrerRewardUsdc: ref.referrerRewardUsdc,
      qualifiedAt: ref.qualifiedAt,
      rewardedAt: ref.rewardedAt,
      createdAt: ref.createdAt,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Apply a referral code during registration
   */
  async applyReferralCode(userId: string, code: string) {
    // Check if user already has been referred
    const existingReferral = await this.prisma.referral.findUnique({
      where: { referredId: userId },
    });

    if (existingReferral) {
      throw new ConflictException('You have already been referred by another user');
    }

    // Find the referral code
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            isActive: true,
            isSuspended: true,
          },
        },
      },
    });

    if (!referralCode) {
      throw new NotFoundException('Invalid referral code');
    }

    // Check if user is trying to refer themselves
    if (referralCode.userId === userId) {
      throw new BadRequestException('You cannot use your own referral code');
    }

    // Check if referrer account is valid
    if (!referralCode.user.isActive || referralCode.user.isSuspended) {
      throw new BadRequestException('This referral code is no longer valid');
    }

    // Create the referral record
    const referral = await this.prisma.referral.create({
      data: {
        referrerId: referralCode.userId,
        referredId: userId,
        status: 'pending',
      },
      include: {
        referrer: {
          select: {
            username: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Referral code applied successfully',
      referredBy: this.maskUsername(referral.referrer.username),
      rewardInfo: {
        yourReward: DEFAULT_REFERRED_REWARD,
        qualificationRequirement: `Make a purchase of at least $${QUALIFICATION_PURCHASE_AMOUNT} to receive your reward`,
      },
    };
  }

  /**
   * Internal method to process referral rewards when a user qualifies
   * This should be called from the wallet/purchase service when a user makes their first qualifying purchase
   */
  async processReferralReward(referralId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        referrer: {
          include: {
            wallet: true,
          },
        },
        referred: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    if (referral.status === 'rewarded') {
      throw new BadRequestException('Referral has already been rewarded');
    }

    // Validate wallets exist
    if (!referral.referrer.wallet) {
      throw new NotFoundException('Referrer wallet not found');
    }

    if (!referral.referred.wallet) {
      throw new NotFoundException('Referred user wallet not found');
    }

    const now = new Date();
    const referrerWallet = referral.referrer.wallet;
    const referredWallet = referral.referred.wallet;

    const referrerRewardUsdc = DEFAULT_REFERRER_REWARD;
    const referredRewardUsdc = DEFAULT_REFERRED_REWARD;

    const newReferrerUsdcBalance = new Decimal(referrerWallet.usdcBalance).plus(referrerRewardUsdc);
    const newReferredUsdcBalance = new Decimal(referredWallet.usdcBalance).plus(referredRewardUsdc);

    return this.prisma.$transaction(async (tx) => {
      // Update referral status
      const updatedReferral = await tx.referral.update({
        where: { id: referralId },
        data: {
          status: 'rewarded',
          referrerRewardUsdc,
          referredRewardUsdc,
          rewardCurrency: 'USDC',
          qualifiedAt: now,
          rewardedAt: now,
        },
      });

      // Create referrer reward transaction
      await tx.transaction.create({
        data: {
          userId: referral.referrerId,
          walletId: referrerWallet.id,
          type: 'bonus',
          currency: 'USDC',
          amount: referrerRewardUsdc,
          usdcAmount: referrerRewardUsdc,
          exchangeRate: EXCHANGE_RATE,
          balanceBefore: referrerWallet.usdcBalance,
          balanceAfter: newReferrerUsdcBalance,
          referenceType: 'referral',
          referenceId: referralId,
          status: 'completed',
          metadata: {
            bonusType: 'referral_reward',
            referredUserId: referral.referredId,
          },
        },
      });

      // Update referrer wallet
      await tx.wallet.update({
        where: { id: referrerWallet.id, version: referrerWallet.version },
        data: {
          usdcBalance: newReferrerUsdcBalance,
          lifetimeWon: new Decimal(referrerWallet.lifetimeWon).plus(referrerRewardUsdc),
          version: { increment: 1 },
        },
      });

      // Create referred user reward transaction
      await tx.transaction.create({
        data: {
          userId: referral.referredId,
          walletId: referredWallet.id,
          type: 'bonus',
          currency: 'USDC',
          amount: referredRewardUsdc,
          usdcAmount: referredRewardUsdc,
          exchangeRate: EXCHANGE_RATE,
          balanceBefore: referredWallet.usdcBalance,
          balanceAfter: newReferredUsdcBalance,
          referenceType: 'referral',
          referenceId: referralId,
          status: 'completed',
          metadata: {
            bonusType: 'referral_welcome',
            referrerUserId: referral.referrerId,
          },
        },
      });

      // Update referred user wallet
      await tx.wallet.update({
        where: { id: referredWallet.id, version: referredWallet.version },
        data: {
          usdcBalance: newReferredUsdcBalance,
          lifetimeWon: new Decimal(referredWallet.lifetimeWon).plus(referredRewardUsdc),
          version: { increment: 1 },
        },
      });

      // Record bonus claims
      await tx.bonusClaim.createMany({
        data: [
          {
            userId: referral.referrerId,
            bonusType: 'referral',
            bonusId: referralId,
            currency: 'USDC',
            amount: referrerRewardUsdc,
            usdcAmount: referrerRewardUsdc,
            exchangeRate: 1,
          },
          {
            userId: referral.referredId,
            bonusType: 'referral',
            bonusId: referralId,
            currency: 'USDC',
            amount: referredRewardUsdc,
            usdcAmount: referredRewardUsdc,
            exchangeRate: 1,
          },
        ],
      });

      return {
        success: true,
        referralId: updatedReferral.id,
        rewards: {
          referrer: {
            userId: referral.referrerId,
            amount: referrerRewardUsdc,
          },
          referred: {
            userId: referral.referredId,
            amount: referredRewardUsdc,
          },
        },
      };
    });
  }

  /**
   * Check if a user was referred and qualify them if they meet requirements
   * Called from wallet service after a qualifying purchase
   */
  async checkAndProcessReferralQualification(userId: string, purchaseAmount: Decimal) {
    // Find pending referral for this user
    const referral = await this.prisma.referral.findUnique({
      where: { referredId: userId },
    });

    if (!referral || referral.status !== 'pending') {
      return null; // User was not referred or already processed
    }

    // Check if purchase amount qualifies
    if (purchaseAmount.lt(QUALIFICATION_PURCHASE_AMOUNT)) {
      return null; // Purchase amount not sufficient
    }

    // Process the referral reward
    return this.processReferralReward(referral.id);
  }

  /**
   * Get referral status for a user (whether they were referred)
   */
  async getReferralStatus(userId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { referredId: userId },
      include: {
        referrer: {
          select: {
            username: true,
          },
        },
      },
    });

    if (!referral) {
      return {
        wasReferred: false,
        referrer: null,
        status: null,
        reward: null,
      };
    }

    return {
      wasReferred: true,
      referrer: this.maskUsername(referral.referrer.username),
      status: referral.status,
      reward: referral.status === 'rewarded' ? referral.referredRewardUsdc : null,
      qualifiedAt: referral.qualifiedAt,
      rewardedAt: referral.rewardedAt,
    };
  }

  /**
   * Generate a unique referral code
   */
  private async generateUniqueCode(): Promise<string> {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing characters
    const codeLength = 8;

    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = '';
      for (let i = 0; i < codeLength; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Check if code already exists
      const existing = await this.prisma.referralCode.findUnique({
        where: { code },
      });

      isUnique = !existing;
    }

    return code!;
  }

  /**
   * Mask username for privacy (show first 2 chars and last char)
   */
  private maskUsername(username: string): string {
    if (username.length <= 4) {
      return username[0] + '***';
    }
    return username.slice(0, 2) + '***' + username.slice(-1);
  }
}
