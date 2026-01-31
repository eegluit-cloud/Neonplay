import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Jackpot Processor
 * Handles periodic jackpot-related tasks like:
 * - Publishing jackpot values to Redis for real-time display
 * - Checking for stale jackpots (no wins for too long)
 * - Seeding jackpots if they fall below minimums
 */
@Injectable()
export class JackpotProcessor {
  private readonly logger = new Logger(JackpotProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Update Redis cache with current jackpot values every 10 seconds
   * This allows real-time jackpot displays without hitting the database
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateJackpotCache() {
    try {
      const jackpots = await this.prisma.jackpot.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          type: true,
          currentAmount: true,
          seedAmount: true,
          triggerMin: true,
          triggerMax: true,
          lastWonAt: true,
          lastWonBy: true,
          lastWonAmount: true,
        },
      });

      // Store each jackpot value in Redis
      for (const jackpot of jackpots) {
        const cacheKey = `jackpot:${jackpot.type}`;
        await this.redis.set(cacheKey, {
          id: jackpot.id,
          name: jackpot.name,
          type: jackpot.type,
          currentAmount: jackpot.currentAmount.toString(),
          seedAmount: jackpot.seedAmount.toString(),
          triggerMin: jackpot.triggerMin.toString(),
          triggerMax: jackpot.triggerMax.toString(),
          lastWonAt: jackpot.lastWonAt?.toISOString() || null,
          lastWonBy: jackpot.lastWonBy,
          lastWonAmount: jackpot.lastWonAmount?.toString() || null,
          formattedValue: this.formatJackpotValue(jackpot.currentAmount),
          isAtMax: jackpot.currentAmount.gte(jackpot.triggerMax),
        }, 30); // 30 second TTL
      }

      // Store all jackpots as a list
      const jackpotList = jackpots.map((j) => ({
        id: j.id,
        name: j.name,
        type: j.type,
        currentAmount: j.currentAmount.toString(),
        formattedValue: this.formatJackpotValue(j.currentAmount),
      }));
      await this.redis.set('jackpots:all', jackpotList, 30);

      // Publish update event for real-time clients
      await this.redis.publish('jackpots:updated', {
        timestamp: new Date().toISOString(),
        jackpots: jackpotList,
      });
    } catch (error: any) {
      this.logger.error('Error updating jackpot cache:', error);
    }
  }

  /**
   * Check every hour for jackpots that haven't been won in a long time
   * Increase trigger probability for stale jackpots
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkStaleJackpots() {
    this.logger.log('Checking for stale jackpots...');

    try {
      const jackpots = await this.prisma.jackpot.findMany({
        where: { isActive: true },
      });

      const staleThreshold = new Date();
      staleThreshold.setDate(staleThreshold.getDate() - 7); // 7 days without a win

      for (const jackpot of jackpots) {
        const isStale = !jackpot.lastWonAt || jackpot.lastWonAt < staleThreshold;
        const isNearMax = jackpot.currentAmount.gte(
          jackpot.triggerMax.mul(0.9), // 90% of max
        );

        if (isStale || isNearMax) {
          this.logger.log(
            `Jackpot ${jackpot.name} is ${isStale ? 'stale' : 'near max'}. Current: ${jackpot.currentAmount}, Last won: ${jackpot.lastWonAt || 'never'}`,
          );

          // Could implement increased trigger rates here
          // For now, just log the status
        }
      }
    } catch (error: any) {
      this.logger.error('Error checking stale jackpots:', error);
    }
  }

  /**
   * Run at midnight to generate jackpot daily summary
   */
  @Cron('0 0 * * *')
  async generateDailySummary() {
    this.logger.log('Generating jackpot daily summary...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Get yesterday's jackpot wins
      const wins = await this.prisma.jackpotWin.findMany({
        where: {
          wonAt: {
            gte: yesterday,
            lt: today,
          },
        },
        include: {
          jackpot: { select: { name: true, type: true } },
          user: { select: { username: true } },
        },
      });

      if (wins.length > 0) {
        const totalWinnings = wins.reduce(
          (sum, win) => sum.add(win.amount),
          new Decimal(0),
        );

        this.logger.log(
          `Yesterday's jackpot summary: ${wins.length} wins, total ${totalWinnings.toString()} SC`,
        );

        // Group by jackpot type
        const byType = wins.reduce((acc, win) => {
          const type = win.jackpot.type;
          if (!acc[type]) {
            acc[type] = { count: 0, total: new Decimal(0) };
          }
          acc[type].count++;
          acc[type].total = acc[type].total.add(win.amount);
          return acc;
        }, {} as Record<string, { count: number; total: Decimal }>);

        for (const [type, stats] of Object.entries(byType)) {
          this.logger.log(
            `  ${type}: ${stats.count} wins, ${stats.total.toString()} SC`,
          );
        }
      } else {
        this.logger.log('No jackpot wins yesterday');
      }

      // Log current jackpot states
      const jackpots = await this.prisma.jackpot.findMany({
        where: { isActive: true },
        orderBy: { type: 'asc' },
      });

      this.logger.log('Current jackpot values:');
      for (const jackpot of jackpots) {
        const progress = jackpot.currentAmount
          .sub(jackpot.triggerMin)
          .div(jackpot.triggerMax.sub(jackpot.triggerMin))
          .mul(100);

        this.logger.log(
          `  ${jackpot.name}: ${this.formatJackpotValue(jackpot.currentAmount)} (${progress.toFixed(1)}% to max)`,
        );
      }
    } catch (error: any) {
      this.logger.error('Error generating jackpot summary:', error);
    }
  }

  /**
   * Run every minute to check if any jackpot hit its maximum trigger value
   * If so, the next bet MUST win the jackpot (guaranteed trigger)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkForcedTriggers() {
    try {
      const jackpotsAtMax = await this.prisma.jackpot.findMany({
        where: {
          isActive: true,
          currentAmount: { gte: this.prisma.jackpot.fields.triggerMax },
        },
      });

      for (const jackpot of jackpotsAtMax) {
        this.logger.warn(
          `ALERT: ${jackpot.name} jackpot has reached maximum (${jackpot.currentAmount}). Next eligible bet will trigger!`,
        );

        // Set Redis flag for forced trigger
        await this.redis.set(`jackpot:forced_trigger:${jackpot.id}`, true, 3600);
      }
    } catch (error: any) {
      this.logger.error('Error checking forced triggers:', error);
    }
  }

  /**
   * Format jackpot value for display
   */
  private formatJackpotValue(value: Decimal): string {
    const numValue = Number(value);
    return `${numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} SC`;
  }
}
