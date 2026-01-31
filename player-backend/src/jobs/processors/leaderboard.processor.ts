import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';

@Injectable()
export class LeaderboardProcessor {
  private readonly logger = new Logger(LeaderboardProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // Run every hour to update leaderboard rankings
  @Cron(CronExpression.EVERY_HOUR)
  async updateLeaderboardRankings() {
    this.logger.log('Starting leaderboard ranking update...');

    try {
      const activeLeaderboards = await this.prisma.leaderboard.findMany({
        where: { status: 'active' },
      });

      for (const leaderboard of activeLeaderboards) {
        // Get entries sorted by score
        const entries = await this.prisma.leaderboardEntry.findMany({
          where: { leaderboardId: leaderboard.id },
          orderBy: { scoreUsdc: 'desc' },
        });

        // Update ranks
        for (let i = 0; i < entries.length; i++) {
          await this.prisma.leaderboardEntry.update({
            where: { id: entries[i].id },
            data: { rank: i + 1 },
          });
        }

        // Take snapshot of top 100
        const top100 = entries.slice(0, 100).map((e, idx) => ({
          rank: idx + 1,
          userId: e.userId,
          score: e.scoreUsdc.toString(),
        }));

        await this.prisma.leaderboardSnapshot.create({
          data: {
            leaderboardId: leaderboard.id,
            snapshotData: top100,
          },
        });

        // Update Redis sorted set
        const redisKey = `leaderboard:${leaderboard.type}:${leaderboard.period}`;
        await this.redis.del(redisKey);
        for (const entry of entries) {
          await this.redis.zadd(redisKey, parseFloat(entry.scoreUsdc.toString()), entry.userId);
        }
      }

      this.logger.log('Leaderboard rankings updated successfully');
    } catch (error: any) {
      this.logger.error('Error updating leaderboard rankings:', error);
    }
  }

  // Run at midnight to create new daily leaderboards
  @Cron('0 0 * * *')
  async createDailyLeaderboard() {
    this.logger.log('Creating new daily leaderboards...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const types = ['biggest_win', 'most_wagered', 'most_played'];

      for (const type of types) {
        // Close previous daily leaderboard
        await this.prisma.leaderboard.updateMany({
          where: {
            type,
            period: 'daily',
            status: 'active',
          },
          data: { status: 'completed' },
        });

        // Create new daily leaderboard
        await this.prisma.leaderboard.create({
          data: {
            type,
            period: 'daily',
            periodStart: today,
            periodEnd: tomorrow,
            prizePoolUsdc: 1000, // Default prize pool in USDC
            status: 'active',
          },
        });
      }

      this.logger.log('Daily leaderboards created successfully');
    } catch (error: any) {
      this.logger.error('Error creating daily leaderboards:', error);
    }
  }

  // Run at midnight on Mondays to create weekly leaderboards
  @Cron('0 0 * * 1')
  async createWeeklyLeaderboard() {
    this.logger.log('Creating new weekly leaderboards...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const types = ['biggest_win', 'most_wagered', 'most_played'];

      for (const type of types) {
        // Close previous weekly leaderboard
        await this.prisma.leaderboard.updateMany({
          where: {
            type,
            period: 'weekly',
            status: 'active',
          },
          data: { status: 'completed' },
        });

        // Create new weekly leaderboard
        await this.prisma.leaderboard.create({
          data: {
            type,
            period: 'weekly',
            periodStart: today,
            periodEnd: nextWeek,
            prizePoolUsdc: 5000, // Default prize pool in USDC
            status: 'active',
          },
        });
      }

      this.logger.log('Weekly leaderboards created successfully');
    } catch (error: any) {
      this.logger.error('Error creating weekly leaderboards:', error);
    }
  }

  // Run on the 1st of each month to create monthly leaderboards
  @Cron('0 0 1 * *')
  async createMonthlyLeaderboard() {
    this.logger.log('Creating new monthly leaderboards...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      const types = ['biggest_win', 'most_wagered', 'most_played'];

      for (const type of types) {
        // Close previous monthly leaderboard
        await this.prisma.leaderboard.updateMany({
          where: {
            type,
            period: 'monthly',
            status: 'active',
          },
          data: { status: 'completed' },
        });

        // Create new monthly leaderboard
        await this.prisma.leaderboard.create({
          data: {
            type,
            period: 'monthly',
            periodStart: today,
            periodEnd: nextMonth,
            prizePoolUsdc: 25000, // Default prize pool in USDC
            status: 'active',
          },
        });
      }

      this.logger.log('Monthly leaderboards created successfully');
    } catch (error: any) {
      this.logger.error('Error creating monthly leaderboards:', error);
    }
  }
}
