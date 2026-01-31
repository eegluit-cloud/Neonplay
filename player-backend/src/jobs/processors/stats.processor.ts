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
        currency: true,
        betAmount: true,
        winAmount: true,
        betAmountUsdc: true,
        winAmountUsdc: true,
      },
    });

    // Group by user and currency
    const userStatsMap = new Map<string, {
      totalWagered: Decimal;
      totalWon: Decimal;
      totalWageredUsdc: Decimal;
      totalWonUsdc: Decimal;
      gamesPlayed: number;
      biggestWinUsdc: Decimal;
    }>();

    for (const round of gameRounds) {
      const key = `${round.userId}:${round.currency}`;
      const existing = userStatsMap.get(key) || {
        totalWagered: new Decimal(0),
        totalWon: new Decimal(0),
        totalWageredUsdc: new Decimal(0),
        totalWonUsdc: new Decimal(0),
        gamesPlayed: 0,
        biggestWinUsdc: new Decimal(0),
      };

      existing.totalWagered = existing.totalWagered.add(round.betAmount);
      existing.totalWon = existing.totalWon.add(round.winAmount);
      existing.totalWageredUsdc = existing.totalWageredUsdc.add(round.betAmountUsdc);
      existing.totalWonUsdc = existing.totalWonUsdc.add(round.winAmountUsdc);
      existing.gamesPlayed += 1;

      if (round.winAmountUsdc.gt(existing.biggestWinUsdc)) {
        existing.biggestWinUsdc = round.winAmountUsdc;
      }

      userStatsMap.set(key, existing);
    }

    // Upsert stats for each user
    for (const [key, stats] of userStatsMap) {
      const [userId, currency] = key.split(':');
      const netResultUsdc = stats.totalWonUsdc.sub(stats.totalWageredUsdc);

      await this.prisma.userDailyStats.upsert({
        where: {
          userId_date_currency: {
            userId,
            date: startDate,
            currency,
          },
        },
        update: {
          totalWagered: stats.totalWagered,
          totalWon: stats.totalWon,
          totalWageredUsdc: stats.totalWageredUsdc,
          totalWonUsdc: stats.totalWonUsdc,
          gamesPlayed: stats.gamesPlayed,
          biggestWinUsdc: stats.biggestWinUsdc,
          netResultUsdc,
        },
        create: {
          userId,
          date: startDate,
          currency,
          totalWagered: stats.totalWagered,
          totalWon: stats.totalWon,
          totalWageredUsdc: stats.totalWageredUsdc,
          totalWonUsdc: stats.totalWonUsdc,
          gamesPlayed: stats.gamesPlayed,
          biggestWinUsdc: stats.biggestWinUsdc,
          netResultUsdc,
        },
      });
    }

    this.logger.log(`Aggregated stats for ${userStatsMap.size} user-currency combinations`);
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

    // Total deposits
    const deposits = await this.prisma.deposit.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { usdcAmount: true },
    });
    const totalDepositsUsdc = deposits._sum.usdcAmount || new Decimal(0);

    // Total withdrawals
    const withdrawals = await this.prisma.withdrawal.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { usdcAmount: true },
    });
    const totalWithdrawalsUsdc = withdrawals._sum.usdcAmount || new Decimal(0);

    // Wagering stats (all currencies combined via USDC equivalent)
    const wageredStats = await this.prisma.gameRound.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { betAmountUsdc: true, winAmountUsdc: true },
    });

    const totalWageredUsdc = wageredStats._sum?.betAmountUsdc || new Decimal(0);
    const totalPayoutUsdc = wageredStats._sum?.winAmountUsdc || new Decimal(0);

    // New VIP members
    const newVipMembers = await this.prisma.userVip.count({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Total bonuses paid (in USDC)
    const bonusesPaid = await this.prisma.bonusClaim.aggregate({
      where: {
        claimedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _sum: { usdcAmount: true },
    });
    const totalBonusesPaidUsdc = bonusesPaid._sum?.usdcAmount || new Decimal(0);

    await this.prisma.platformDailyStats.upsert({
      where: { date: startDate },
      update: {
        newUsers,
        activeUsers,
        totalDepositsUsdc,
        totalWithdrawalsUsdc,
        totalWageredUsdc,
        totalPayoutUsdc,
        newVipMembers,
        totalBonusesPaidUsdc,
      },
      create: {
        date: startDate,
        newUsers,
        activeUsers,
        totalDepositsUsdc,
        totalWithdrawalsUsdc,
        totalWageredUsdc,
        totalPayoutUsdc,
        newVipMembers,
        totalBonusesPaidUsdc,
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
