import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';
import { Decimal } from '@prisma/client/runtime/library';

export type LeaderboardType = 'biggest_win' | 'most_wagered' | 'most_played';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  prizeAmount: number | null;
}

export interface LeaderboardDto {
  id: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
  periodStart: Date;
  periodEnd: Date;
  prizePool: number;
  coinType: string;
  status: string;
  entries: LeaderboardEntryDto[];
  totalEntries: number;
}

export interface UserPositionDto {
  rank: number | null;
  score: number;
  prizeAmount: number | null;
  totalParticipants: number;
  leaderboardId: string;
  type: LeaderboardType;
  period: LeaderboardPeriod;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  // Cache keys
  private readonly CACHE_PREFIX = 'leaderboard';
  private readonly ACTIVE_LEADERBOARDS_KEY = `${this.CACHE_PREFIX}:active`;
  private readonly LEADERBOARD_CACHE_TTL = 60; // 1 minute
  private readonly ACTIVE_CACHE_TTL = 300; // 5 minutes
  private readonly HISTORY_CACHE_TTL = 600; // 10 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get all active leaderboards
   */
  async getActiveLeaderboards(): Promise<LeaderboardDto[]> {
    // Try cache first
    const cached = await this.redis.get<LeaderboardDto[]>(this.ACTIVE_LEADERBOARDS_KEY);
    if (cached) {
      return cached;
    }

    const activeLeaderboards = await this.prisma.leaderboard.findMany({
      where: {
        status: 'active',
      },
      orderBy: [
        { period: 'asc' },
        { type: 'asc' },
      ],
      include: {
        entries: {
          orderBy: { score: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: { entries: true },
        },
      },
    });

    const result: LeaderboardDto[] = activeLeaderboards.map((lb) => ({
      id: lb.id,
      type: lb.type as LeaderboardType,
      period: lb.period as LeaderboardPeriod,
      periodStart: lb.periodStart,
      periodEnd: lb.periodEnd,
      prizePool: Number(lb.prizePool),
      coinType: lb.coinType,
      status: lb.status,
      entries: lb.entries.map((entry, index) => ({
        rank: entry.rank ?? index + 1,
        userId: entry.userId,
        username: entry.user.username,
        avatarUrl: entry.user.avatarUrl,
        score: Number(entry.score),
        prizeAmount: entry.prizeAmount ? Number(entry.prizeAmount) : null,
      })),
      totalEntries: lb._count.entries,
    }));

    // Cache the result
    await this.redis.set(this.ACTIVE_LEADERBOARDS_KEY, result, this.ACTIVE_CACHE_TTL);

    return result;
  }

  /**
   * Get a specific leaderboard with entries
   */
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    query?: PaginationDto,
  ): Promise<LeaderboardDto> {
    const cacheKey = `${this.CACHE_PREFIX}:${type}:${period}`;
    const page = query?.page || 1;
    const limit = query?.limit || 100;

    // Try cache first (only for first page with default limit)
    if (page === 1 && limit === 100) {
      const cached = await this.redis.get<LeaderboardDto>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Find the active leaderboard for this type and period
    const leaderboard = await this.prisma.leaderboard.findFirst({
      where: {
        type,
        period,
        status: 'active',
      },
    });

    if (!leaderboard) {
      throw new NotFoundException(
        `No active leaderboard found for type '${type}' and period '${period}'`,
      );
    }

    const { skip, take } = getPaginationParams({ page, limit });

    // Get entries with pagination
    const [entries, totalEntries] = await Promise.all([
      this.prisma.leaderboardEntry.findMany({
        where: { leaderboardId: leaderboard.id },
        orderBy: { score: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.leaderboardEntry.count({
        where: { leaderboardId: leaderboard.id },
      }),
    ]);

    const result: LeaderboardDto = {
      id: leaderboard.id,
      type: leaderboard.type as LeaderboardType,
      period: leaderboard.period as LeaderboardPeriod,
      periodStart: leaderboard.periodStart,
      periodEnd: leaderboard.periodEnd,
      prizePool: Number(leaderboard.prizePool),
      coinType: leaderboard.coinType,
      status: leaderboard.status,
      entries: entries.map((entry, index) => ({
        rank: entry.rank ?? skip + index + 1,
        userId: entry.userId,
        username: entry.user.username,
        avatarUrl: entry.user.avatarUrl,
        score: Number(entry.score),
        prizeAmount: entry.prizeAmount ? Number(entry.prizeAmount) : null,
      })),
      totalEntries,
    };

    // Cache the result for first page
    if (page === 1 && limit === 100) {
      await this.redis.set(cacheKey, result, this.LEADERBOARD_CACHE_TTL);
    }

    return result;
  }

  /**
   * Get user's position on a specific leaderboard
   */
  async getUserPosition(
    userId: string,
    type: LeaderboardType,
    period: LeaderboardPeriod,
  ): Promise<UserPositionDto> {
    const cacheKey = `${this.CACHE_PREFIX}:position:${userId}:${type}:${period}`;

    // Try cache first
    const cached = await this.redis.get<UserPositionDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Find the active leaderboard
    const leaderboard = await this.prisma.leaderboard.findFirst({
      where: {
        type,
        period,
        status: 'active',
      },
    });

    if (!leaderboard) {
      throw new NotFoundException(
        `No active leaderboard found for type '${type}' and period '${period}'`,
      );
    }

    // Get user's entry
    const userEntry = await this.prisma.leaderboardEntry.findUnique({
      where: {
        leaderboardId_userId: {
          leaderboardId: leaderboard.id,
          userId,
        },
      },
    });

    // Get total participants
    const totalParticipants = await this.prisma.leaderboardEntry.count({
      where: { leaderboardId: leaderboard.id },
    });

    let rank: number | null = null;
    let score = 0;
    let prizeAmount: number | null = null;

    if (userEntry) {
      score = Number(userEntry.score);
      prizeAmount = userEntry.prizeAmount ? Number(userEntry.prizeAmount) : null;

      // Calculate rank if not already set
      if (userEntry.rank) {
        rank = userEntry.rank;
      } else {
        // Count entries with higher score
        const higherScoreCount = await this.prisma.leaderboardEntry.count({
          where: {
            leaderboardId: leaderboard.id,
            score: { gt: userEntry.score },
          },
        });
        rank = higherScoreCount + 1;
      }
    }

    const result: UserPositionDto = {
      rank,
      score,
      prizeAmount,
      totalParticipants,
      leaderboardId: leaderboard.id,
      type: leaderboard.type as LeaderboardType,
      period: leaderboard.period as LeaderboardPeriod,
    };

    // Cache with shorter TTL since position can change
    await this.redis.set(cacheKey, result, 30);

    return result;
  }

  /**
   * Get historical (completed) leaderboards
   */
  async getLeaderboardHistory(query?: PaginationDto) {
    const cacheKey = `${this.CACHE_PREFIX}:history:${query?.page || 1}:${query?.limit || 20}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { skip, take } = getPaginationParams(query || {});

    const [leaderboards, total] = await Promise.all([
      this.prisma.leaderboard.findMany({
        where: {
          status: { in: ['completed', 'paid_out'] },
        },
        orderBy: { periodEnd: 'desc' },
        skip,
        take,
        include: {
          entries: {
            orderBy: { rank: 'asc' },
            take: 3,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: { entries: true },
          },
        },
      }),
      this.prisma.leaderboard.count({
        where: {
          status: { in: ['completed', 'paid_out'] },
        },
      }),
    ]);

    const items = leaderboards.map((lb) => ({
      id: lb.id,
      type: lb.type,
      period: lb.period,
      periodStart: lb.periodStart,
      periodEnd: lb.periodEnd,
      prizePool: Number(lb.prizePool),
      coinType: lb.coinType,
      status: lb.status,
      totalParticipants: lb._count.entries,
      topWinners: lb.entries.map((entry) => ({
        rank: entry.rank,
        userId: entry.userId,
        username: entry.user.username,
        avatarUrl: entry.user.avatarUrl,
        score: Number(entry.score),
        prizeAmount: entry.prizeAmount ? Number(entry.prizeAmount) : null,
      })),
    }));

    const result = createPaginatedResult(items, total, query?.page || 1, query?.limit || 20);

    // Cache for longer since historical data doesn't change
    await this.redis.set(cacheKey, result, this.HISTORY_CACHE_TTL);

    return result;
  }

  /**
   * Update a user's score on a leaderboard (internal method)
   * This should be called when game rounds complete or other scoring events occur
   */
  async updateLeaderboardEntry(
    userId: string,
    type: LeaderboardType,
    score: number,
  ): Promise<void> {
    // Find active leaderboard for this type
    // We update all period types (daily, weekly, monthly) simultaneously
    const activeLeaderboards = await this.prisma.leaderboard.findMany({
      where: {
        type,
        status: 'active',
      },
    });

    if (activeLeaderboards.length === 0) {
      this.logger.warn(`No active leaderboards found for type: ${type}`);
      return;
    }

    // Update entries for each period
    for (const leaderboard of activeLeaderboards) {
      await this.upsertLeaderboardEntry(leaderboard.id, userId, score, type);

      // Invalidate cache for this leaderboard
      await this.invalidateLeaderboardCache(type, leaderboard.period as LeaderboardPeriod);
    }

    // Invalidate active leaderboards cache
    await this.redis.del(this.ACTIVE_LEADERBOARDS_KEY);
  }

  /**
   * Upsert leaderboard entry based on type logic
   */
  private async upsertLeaderboardEntry(
    leaderboardId: string,
    userId: string,
    score: number,
    type: LeaderboardType,
  ): Promise<void> {
    const existingEntry = await this.prisma.leaderboardEntry.findUnique({
      where: {
        leaderboardId_userId: {
          leaderboardId,
          userId,
        },
      },
    });

    if (existingEntry) {
      let newScore = score;

      // Different update logic based on leaderboard type
      switch (type) {
        case 'biggest_win':
          // Only update if new win is bigger
          if (score > Number(existingEntry.score)) {
            newScore = score;
          } else {
            return; // No update needed
          }
          break;
        case 'most_wagered':
        case 'most_played':
          // Accumulate scores
          newScore = Number(existingEntry.score) + score;
          break;
      }

      await this.prisma.leaderboardEntry.update({
        where: { id: existingEntry.id },
        data: {
          score: newScore,
          lastUpdatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.leaderboardEntry.create({
        data: {
          leaderboardId,
          userId,
          score,
          lastUpdatedAt: new Date(),
        },
      });
    }

    // Update Redis sorted set for real-time ranking
    const sortedSetKey = `${this.CACHE_PREFIX}:rankings:${leaderboardId}`;

    if (type === 'biggest_win') {
      // For biggest win, only update if score is higher
      const currentScore = await this.redis.getClient().zscore(sortedSetKey, userId);
      if (!currentScore || score > parseFloat(currentScore)) {
        await this.redis.zadd(sortedSetKey, score, userId);
      }
    } else {
      // For accumulated types, use ZINCRBY
      await this.redis.zincrby(sortedSetKey, score, userId);
    }
  }

  /**
   * Invalidate cache for a specific leaderboard
   */
  private async invalidateLeaderboardCache(
    type: LeaderboardType,
    period: LeaderboardPeriod,
  ): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}:${type}:${period}`;
    await this.redis.del(cacheKey);
  }

  /**
   * Get leaderboard prizes configuration for a specific period
   */
  async getLeaderboardPrizes(period: LeaderboardPeriod) {
    const cacheKey = `${this.CACHE_PREFIX}:prizes:${period}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const prizeTiers = await this.prisma.prizeTier.findMany({
      where: {
        leaderboardType: period,
      },
      orderBy: { position: 'asc' },
      include: {
        prize: {
          select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            valueUsd: true,
          },
        },
      },
    });

    const result = prizeTiers.map((tier) => ({
      position: tier.position,
      scAmount: Number(tier.scAmount),
      prize: tier.prize
        ? {
            id: tier.prize.id,
            name: tier.prize.name,
            description: tier.prize.description,
            imageUrl: tier.prize.imageUrl,
            valueUsd: Number(tier.prize.valueUsd),
          }
        : null,
    }));

    await this.redis.set(cacheKey, result, this.HISTORY_CACHE_TTL);

    return result;
  }

  /**
   * Get real-time top players from Redis sorted set
   */
  async getRealtimeTopPlayers(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    limit: number = 10,
  ): Promise<LeaderboardEntryDto[]> {
    // Find the active leaderboard
    const leaderboard = await this.prisma.leaderboard.findFirst({
      where: {
        type,
        period,
        status: 'active',
      },
    });

    if (!leaderboard) {
      return [];
    }

    const sortedSetKey = `${this.CACHE_PREFIX}:rankings:${leaderboard.id}`;

    // Get top players from Redis sorted set (descending order)
    const topUserIds = await this.redis.zrevrange(sortedSetKey, 0, limit - 1);

    if (topUserIds.length === 0) {
      return [];
    }

    // Fetch user details
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: topUserIds },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // Get scores from Redis
    const results: LeaderboardEntryDto[] = [];
    for (let i = 0; i < topUserIds.length; i++) {
      const userId = topUserIds[i];
      const user = userMap.get(userId);
      const scoreStr = await this.redis.getClient().zscore(sortedSetKey, userId);

      if (user && scoreStr) {
        results.push({
          rank: i + 1,
          userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          score: parseFloat(scoreStr),
          prizeAmount: null,
        });
      }
    }

    return results;
  }

  /**
   * Finalize a leaderboard and distribute prizes to winners
   * This should be called by a scheduled job when a leaderboard period ends
   */
  async finalizeLeaderboardAndDistributePrizes(leaderboardId: string): Promise<{
    leaderboardId: string;
    winnersCount: number;
    totalPrizeDistributed: number;
  }> {
    const leaderboard = await this.prisma.leaderboard.findUnique({
      where: { id: leaderboardId },
    });

    if (!leaderboard) {
      throw new NotFoundException('Leaderboard not found');
    }

    if (leaderboard.status !== 'active') {
      throw new BadRequestException(`Leaderboard is not active. Current status: ${leaderboard.status}`);
    }

    // Check if period has ended
    if (new Date() < leaderboard.periodEnd) {
      throw new BadRequestException('Leaderboard period has not ended yet');
    }

    this.logger.log(`Finalizing leaderboard ${leaderboardId} (${leaderboard.type} - ${leaderboard.period})`);

    // Get prize tiers for this leaderboard period
    const prizeTiers = await this.prisma.prizeTier.findMany({
      where: {
        leaderboardType: leaderboard.period,
      },
      orderBy: { position: 'asc' },
    });

    // Get all entries ordered by score
    const entries = await this.prisma.leaderboardEntry.findMany({
      where: { leaderboardId },
      orderBy: { score: 'desc' },
    });

    let winnersCount = 0;
    let totalPrizeDistributed = 0;

    // Distribute prizes in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Update ranks and distribute prizes
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const rank = i + 1;
        const prizeTier = prizeTiers.find(pt => pt.position === rank);
        const prizeAmount = prizeTier ? new Decimal(prizeTier.scAmount) : new Decimal(0);

        // Update entry with final rank and prize amount
        await tx.leaderboardEntry.update({
          where: { id: entry.id },
          data: {
            rank,
            prizeAmount: prizeAmount.gt(0) ? prizeAmount : null,
          },
        });

        // If there's a prize, credit to user's wallet
        if (prizeAmount.gt(0)) {
          const wallet = await tx.wallet.findUnique({
            where: { userId: entry.userId },
          });

          if (wallet) {
            const newScBalance = new Decimal(wallet.scBalance).plus(prizeAmount);

            // Update wallet with optimistic locking
            const updateResult = await tx.wallet.updateMany({
              where: { id: wallet.id, version: wallet.version },
              data: {
                scBalance: newScBalance,
                scLifetimeEarned: new Decimal(wallet.scLifetimeEarned).plus(prizeAmount),
                version: { increment: 1 },
              },
            });

            if (updateResult.count > 0) {
              // Create transaction record
              await tx.transaction.create({
                data: {
                  userId: entry.userId,
                  walletId: wallet.id,
                  type: 'bonus',
                  coinType: 'SC',
                  amount: prizeAmount,
                  balanceBefore: wallet.scBalance,
                  balanceAfter: newScBalance,
                  referenceType: 'leaderboard',
                  referenceId: leaderboardId,
                  status: 'completed',
                  metadata: {
                    leaderboardType: leaderboard.type,
                    leaderboardPeriod: leaderboard.period,
                    rank,
                    score: entry.score.toString(),
                  },
                },
              });

              // Create notification for the winner
              await tx.notification.create({
                data: {
                  userId: entry.userId,
                  type: 'leaderboard_prize',
                  title: `Leaderboard Prize Won!`,
                  message: `Congratulations! You placed #${rank} on the ${leaderboard.period} ${leaderboard.type.replace('_', ' ')} leaderboard and won ${prizeAmount.toFixed(2)} SC!`,
                  data: {
                    leaderboardId,
                    rank,
                    prizeAmount: prizeAmount.toNumber(),
                  },
                },
              });

              winnersCount++;
              totalPrizeDistributed += prizeAmount.toNumber();

              this.logger.log(`Distributed ${prizeAmount} SC to user ${entry.userId} for rank ${rank}`);
            } else {
              this.logger.error(`Failed to update wallet for user ${entry.userId} - concurrent modification`);
            }
          }
        }
      }

      // Create leaderboard snapshot for history
      await tx.leaderboardSnapshot.create({
        data: {
          leaderboardId,
          snapshotData: {
            snapshotAt: new Date().toISOString(),
            totalParticipants: entries.length,
            topEntries: entries.slice(0, 100).map((e, i) => ({
              rank: i + 1,
              userId: e.userId,
              score: e.score.toString(),
            })),
          },
        },
      });

      // Update leaderboard status to completed
      await tx.leaderboard.update({
        where: { id: leaderboardId },
        data: {
          status: 'paid_out',
        },
      });
    });

    // Publish prize distribution events
    for (let i = 0; i < Math.min(entries.length, prizeTiers.length); i++) {
      const entry = entries[i];
      const prizeTier = prizeTiers.find(pt => pt.position === i + 1);
      if (prizeTier && new Decimal(prizeTier.scAmount).gt(0)) {
        await this.redis.publish('wallet:balance_updated', {
          userId: entry.userId,
        });
        await this.redis.publish('notification:new', {
          userId: entry.userId,
        });
      }
    }

    // Clear caches
    await this.redis.del(this.ACTIVE_LEADERBOARDS_KEY);
    await this.invalidateLeaderboardCache(leaderboard.type as LeaderboardType, leaderboard.period as LeaderboardPeriod);

    this.logger.log(`Leaderboard ${leaderboardId} finalized. ${winnersCount} winners, ${totalPrizeDistributed} SC distributed.`);

    return {
      leaderboardId,
      winnersCount,
      totalPrizeDistributed,
    };
  }

  /**
   * Create a new leaderboard for the next period
   * This should be called by a scheduled job when a new period starts
   */
  async createNextPeriodLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    prizePool: number,
  ): Promise<string> {
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date;

    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'weekly':
        // Start from Monday
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    const leaderboard = await this.prisma.leaderboard.create({
      data: {
        type,
        period,
        periodStart,
        periodEnd,
        prizePool,
        coinType: 'SC',
        status: 'active',
      },
    });

    this.logger.log(`Created new ${period} ${type} leaderboard: ${leaderboard.id}`);

    // Clear caches
    await this.redis.del(this.ACTIVE_LEADERBOARDS_KEY);

    return leaderboard.id;
  }
}
