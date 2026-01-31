import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';

@Injectable()
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // Check for expiring promotions and notify users
  @Cron('0 9 * * *') // Every day at 9 AM
  async notifyExpiringPromotions() {
    this.logger.log('Checking for expiring user promotions...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find promotions expiring in the next 24 hours
      const expiringPromotions = await this.prisma.userPromotion.findMany({
        where: {
          status: 'claimed',
          expiresAt: {
            gte: today,
            lte: tomorrow,
          },
        },
        include: {
          promotion: true,
          user: true,
        },
      });

      for (const userPromo of expiringPromotions) {
        await this.prisma.notification.create({
          data: {
            userId: userPromo.userId,
            type: 'promotion',
            title: 'Promotion Expiring Soon!',
            message: `Your "${userPromo.promotion.name}" bonus expires in less than 24 hours. Don't forget to use it!`,
            actionUrl: '/promotions',
          },
        });

        // Publish to Redis for real-time delivery
        await this.redis.publish('notification:new', {
          userId: userPromo.userId,
          type: 'promotion',
          title: 'Promotion Expiring Soon!',
        });
      }

      this.logger.log(`Sent ${expiringPromotions.length} expiring promotion notifications`);
    } catch (error: any) {
      this.logger.error('Error notifying expiring promotions:', error);
    }
  }

  // Weekly engagement notification
  @Cron('0 18 * * 5') // Every Friday at 6 PM
  async sendWeeklyEngagement() {
    this.logger.log('Sending weekly engagement notifications...');

    try {
      // Get users who haven't played in 7 days but were active before
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const inactiveUsers = await this.prisma.user.findMany({
        where: {
          isActive: true,
          isSuspended: false,
          lastLoginAt: {
            lt: sevenDaysAgo,
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
          },
        },
        select: { id: true },
        take: 1000, // Batch size
      });

      for (const user of inactiveUsers) {
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            type: 'promotion',
            title: 'We Miss You! 🎰',
            message: 'Come back and check out our latest games and promotions. Your daily bonus is waiting!',
            actionUrl: '/',
          },
        });
      }

      this.logger.log(`Sent ${inactiveUsers.length} weekly engagement notifications`);
    } catch (error: any) {
      this.logger.error('Error sending weekly engagement:', error);
    }
  }

  // Notify VIP tier upgrades
  @Cron(CronExpression.EVERY_HOUR)
  async checkVipUpgrades() {
    this.logger.log('Checking for pending VIP tier upgrades...');

    try {
      // Get all VIP tiers
      const tiers = await this.prisma.vipTier.findMany({
        orderBy: { level: 'asc' },
      });

      // Find users who qualify for upgrades
      for (let i = 1; i < tiers.length; i++) {
        const currentTier = tiers[i - 1];
        const nextTier = tiers[i];

        const usersToUpgrade = await this.prisma.userVip.findMany({
          where: {
            tierId: currentTier.id,
            xpLifetime: { gte: nextTier.minXp },
          },
          include: { user: true },
        });

        for (const userVip of usersToUpgrade) {
          // Upgrade the user
          await this.prisma.userVip.update({
            where: { id: userVip.id },
            data: {
              tierId: nextTier.id,
              tierUpgradedAt: new Date(),
              nextTierXp: i + 1 < tiers.length ? tiers[i + 1].minXp : null,
            },
          });

          // Send notification
          await this.prisma.notification.create({
            data: {
              userId: userVip.userId,
              type: 'system',
              title: `Congratulations! You've reached ${nextTier.name}! 🎉`,
              message: `You've been upgraded to ${nextTier.name} VIP tier. Enjoy your new benefits including ${nextTier.cashbackPercent}% cashback!`,
              actionUrl: '/vip',
            },
          });

          // Publish for real-time
          await this.redis.publish('notification:new', {
            userId: userVip.userId,
            type: 'system',
            title: `VIP Upgrade: ${nextTier.name}`,
          });

          this.logger.log(`Upgraded user ${userVip.userId} to ${nextTier.name}`);
        }
      }
    } catch (error: any) {
      this.logger.error('Error checking VIP upgrades:', error);
    }
  }

  // Daily bonus reminder
  @Cron('0 12 * * *') // Every day at noon
  async sendDailyBonusReminder() {
    this.logger.log('Sending daily bonus reminders...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get active users who haven't claimed daily bonus today
      const usersWithoutDailyBonus = await this.prisma.user.findMany({
        where: {
          isActive: true,
          isSuspended: false,
          lastLoginAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // Active in last 3 days
          bonusClaims: {
            none: {
              bonusType: 'daily',
              claimedAt: { gte: today },
            },
          },
        },
        select: { id: true },
        take: 500, // Batch size
      });

      for (const user of usersWithoutDailyBonus) {
        await this.prisma.notification.create({
          data: {
            userId: user.id,
            type: 'promotion',
            title: 'Daily Bonus Available! 🎁',
            message: 'Don\'t forget to claim your free daily bonus of 1,000 GC and 0.5 SC!',
            actionUrl: '/wallet',
          },
        });
      }

      this.logger.log(`Sent ${usersWithoutDailyBonus.length} daily bonus reminders`);
    } catch (error: any) {
      this.logger.error('Error sending daily bonus reminders:', error);
    }
  }
}
