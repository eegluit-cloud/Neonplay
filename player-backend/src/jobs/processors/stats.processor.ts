import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Stats Processor
 * Aggregates daily statistics for users, games, and platform
 * Pre-computes data to avoid expensive live aggregation queries
 */
@Injectable()
export class StatsProcessor {
  private readonly logger = new Logger(StatsProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Run at 1 AM daily to aggregate the previous day's stats
   * We run at 1 AM to ensure all previous day's data is captured
   */
  @Cron('0 1 * * *')
  async aggregateDailyStats() {
    this.logger.log('Starting daily stats aggregation...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      await Promise.all([
        this.aggregateUserDailyStats(yesterday, today),
        this.aggregateGameDailyStats(yesterday, today),
        this.aggregatePlatformDailyStats(yesterday, today),
      ]);

      this.logger.log('Daily stats aggregation completed successfully');
    } catch (error: any) {
      this.logger.error('Error during daily stats aggregation:', error);
    }
  }

  /**
   * Aggregate user stats for a specific day
   */
  private async aggregateUserDailyStats(startDate: Date, endDate: Date) {
    this.logger.log(`Aggregating user stats for ${startDate.toISOString().split('T')[0]}`);

    // Get all game rounds for the day
    const gameRounds = await this.prisma.gameRound.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        userId: true,
        coinType: true,
        betAmount: true,
        winAmount: true,
      },
    });

    // Group by user and coin type
    const userStatsMap = new Map<string, {
      totalWagered: Decimal;
      totalWon: Decimal;
      gamesPlayed: number;
      biggestWin: Decimal;
    }>();

    for (const round of gameRounds) {
      const key = `${round.userId}:${round.coinType}`;
      const existing = userStatsMap.get(key) || {
        totalWagered: new Decimal(0),
        totalWon: new Decimal(0),
        gamesPlayed: 0,
        biggestWin: new Decimal(0),
      };

      existing.totalWagered = existing.totalWagered.add(round.betAmount);
      existing.totalWon = existing.totalWon.add(round.winAmount);
      existing.gamesPlayed += 1;

      if (round.winAmount.gt(existing.biggestWin)) {
        existing.biggestWin = round.winAmount;
      }

      userStatsMap.set(key, existing);
    }

    // Upsert stats for each user
    for (const [key, stats] of userStatsMap) {
      const [userId, coinType] = key.split(':');
      const netResult = stats.totalWon.sub(stats.totalWagered);

      await this.prisma.userDailyStats.upsert({
        where: {
          userId_date_coinType: {
            userId,
            date: startDate,
            coinType,
          },
        },
        update: {
          totalWagered: stats.totalWagered,
          totalWon: stats.totalWon,
          gamesPlayed: stats.gamesPlayed,
          biggestWin: stats.biggestWin,
          netResult,
        },
        create: {
          userId,
          date: startDate,
          coinType,
          totalWagered: stats.totalWagered,
          totalWon: stats.totalWon,
          gamesPlayed: stats.gamesPlayed,
          biggestWin: stats.biggestWin,
          netResult,
        },
      });
    }

    this.logger.log(`Aggregated stats for ${userStatsMap.size} user-coinType combinations`);
  }

  /**
   * Aggregate game stats for a specific day
   */
  private async aggregateGameDailyStats(startDate: Date, endDate: Date) {
    this.logger.log(`Aggregating game stats for ${startDate.toISOString().split('T')[0]}`);

    // Get aggregated stats per game
    const gameStats = await this.prisma.gameRound.groupBy({
      by: ['gameId'],
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: { id: true },
      _sum: {
        betAmount: true,
        winAmount: true,
      },
    });

    for (const stat of gameStats) {
      // Get unique players for this game
      const uniquePlayers = await this.prisma.gameRound.groupBy({
        by: ['userId'],
        where: {
          gameId: stat.gameId,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const totalWagered = stat._sum.betAmount || new Decimal(0);
      const totalPayout = stat._sum.winAmount || new Decimal(0);

      // Calculate house edge: (wagered - payout) / wagered * 100
      let houseEdge = new Decimal(0);
      if (totalWagered.gt(0)) {
        houseEdge = totalWagered.sub(totalPayout).div(totalWagered).mul(100);
      }

      await this.prisma.gameDailyStats.upsert({
        where: {
          gameId_date: {
            gameId: stat.gameId,
            date: startDate,
          },
        },
        update: {
          totalPlays: stat._count.id,
          uniquePlayers: uniquePlayers.length,
          totalWagered,
          totalPayout,
          houseEdge,
        },
        create: {
          gameId: stat.gameId,
          date: startDate,
          totalPlays: stat._count.id,
          uniquePlayers: uniquePlayers.length,
          totalWagered,
          totalPayout,
          houseEdge,
        },
      });
    }

    this.logger.log(`Aggregated stats for ${gameStats.length} games`);
  }

  /**
   * Aggregate platform-wide stats for a specific day
   */
  private async aggregatePlatformDailyStats(startDate: Date, endDate: Date) {
    this.logger.log(`Aggregating platform stats for ${startDate.toISOString().split('T')[0]}`);

    // New users
    const newUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Active users (users who played at least one game)
    const activeUsersResult = await this.prisma.gameRound.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });
    const activeUsers = activeUsersResult.length;

    // Total deposits (purchases)
    const deposits = await this.prisma.purchase.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { amountUsd: true },
    });
    const totalDeposits = deposits._sum.amountUsd || new Decimal(0);

    // Total redemptions
    const redemptions = await this.prisma.redemption.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { usdValue: true },
    });
    const totalRedemptions = redemptions._sum.usdValue || new Decimal(0);

    // Wagering stats by coin type
    const gcWagered = await this.prisma.gameRound.aggregate({
      where: {
        coinType: 'GC',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { betAmount: true, winAmount: true },
    });

    const scWagered = await this.prisma.gameRound.aggregate({
      where: {
        coinType: 'SC',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { betAmount: true, winAmount: true },
    });

    // New VIP members
    const newVipMembers = await this.prisma.userVip.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Total bonuses paid
    const bonusesPaid = await this.prisma.bonusClaim.aggregate({
      where: {
        claimedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { scAmount: true },
    });

    await this.prisma.platformDailyStats.upsert({
      where: { date: startDate },
      update: {
        newUsers,
        activeUsers,
        totalDeposits,
        totalRedemptions,
        totalGcWagered: gcWagered._sum.betAmount || new Decimal(0),
        totalScWagered: scWagered._sum.betAmount || new Decimal(0),
        totalGcPayout: gcWagered._sum.winAmount || new Decimal(0),
        totalScPayout: scWagered._sum.winAmount || new Decimal(0),
        newVipMembers,
        totalBonusesPaid: bonusesPaid._sum.scAmount || new Decimal(0),
      },
      create: {
        date: startDate,
        newUsers,
        activeUsers,
        totalDeposits,
        totalRedemptions,
        totalGcWagered: gcWagered._sum.betAmount || new Decimal(0),
        totalScWagered: scWagered._sum.betAmount || new Decimal(0),
        totalGcPayout: gcWagered._sum.winAmount || new Decimal(0),
        totalScPayout: scWagered._sum.winAmount || new Decimal(0),
        newVipMembers,
        totalBonusesPaid: bonusesPaid._sum.scAmount || new Decimal(0),
      },
    });

    this.logger.log('Platform stats aggregated successfully');
  }

  /**
   * Run every 6 hours to recalculate today's stats (for real-time dashboards)
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async updateTodayStats() {
    this.logger.log('Updating today\'s stats...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      await this.aggregatePlatformDailyStats(today, tomorrow);
      this.logger.log('Today\'s stats updated successfully');
    } catch (error: any) {
      this.logger.error('Error updating today\'s stats:', error);
    }
  }
}
