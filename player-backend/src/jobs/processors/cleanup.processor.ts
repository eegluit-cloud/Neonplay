import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class CleanupProcessor {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every day at 3 AM to clean up old data
  @Cron('0 3 * * *')
  async cleanupOldData() {
    this.logger.log('Starting daily cleanup...');

    try {
      // Clean up expired verification codes
      const expiredCodes = await this.prisma.verificationCode.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      this.logger.log(`Deleted ${expiredCodes.count} expired verification codes`);

      // Clean up old login attempts (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldAttempts = await this.prisma.loginAttempt.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
        },
      });
      this.logger.log(`Deleted ${oldAttempts.count} old login attempts`);

      // Clean up expired user sessions
      const expiredSessions = await this.prisma.userSession.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      this.logger.log(`Deleted ${expiredSessions.count} expired sessions`);

      // Clean up old read notifications (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const oldNotifications = await this.prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: { lt: ninetyDaysAgo },
        },
      });
      this.logger.log(`Deleted ${oldNotifications.count} old read notifications`);

      // Clean up old leaderboard snapshots (older than 180 days)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

      const oldSnapshots = await this.prisma.leaderboardSnapshot.deleteMany({
        where: {
          createdAt: { lt: sixMonthsAgo },
        },
      });
      this.logger.log(`Deleted ${oldSnapshots.count} old leaderboard snapshots`);

      // Clean up old admin audit logs (older than 365 days)
      const oneYearAgo = new Date();
      oneYearAgo.setDate(oneYearAgo.getDate() - 365);

      const oldAuditLogs = await this.prisma.adminAuditLog.deleteMany({
        where: {
          createdAt: { lt: oneYearAgo },
        },
      });
      this.logger.log(`Deleted ${oldAuditLogs.count} old audit logs`);

      this.logger.log('Daily cleanup completed successfully');
    } catch (error: any) {
      this.logger.error('Error during daily cleanup:', error);
    }
  }

  // Run every 6 hours to clean up old content views
  @Cron('0 */6 * * *')
  async cleanupContentViews() {
    this.logger.log('Cleaning up old content views...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Only delete anonymous views older than 30 days
      const deletedViews = await this.prisma.contentView.deleteMany({
        where: {
          userId: null,
          createdAt: { lt: thirtyDaysAgo },
        },
      });

      this.logger.log(`Deleted ${deletedViews.count} old anonymous content views`);
    } catch (error: any) {
      this.logger.error('Error cleaning up content views:', error);
    }
  }

  // Run every week to archive old live bets data
  @Cron('0 4 * * 0')
  async archiveLiveBets() {
    this.logger.log('Archiving old live bets data...');

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const deletedBets = await this.prisma.liveBet.deleteMany({
        where: {
          createdAt: { lt: sevenDaysAgo },
        },
      });

      this.logger.log(`Archived ${deletedBets.count} old live bets`);

      // Also clean up old social proof events
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const deletedEvents = await this.prisma.socialProofEvent.deleteMany({
        where: {
          createdAt: { lt: threeDaysAgo },
        },
      });

      this.logger.log(`Deleted ${deletedEvents.count} old social proof events`);
    } catch (error: any) {
      this.logger.error('Error archiving live bets:', error);
    }
  }
}
