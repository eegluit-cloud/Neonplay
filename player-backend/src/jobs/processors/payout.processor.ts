import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { Decimal } from '@prisma/client/runtime/library';

interface PayoutJob {
  redemptionId: string;
  userId: string;
  amount: number;
  method: string;
  details: any;
}

@Injectable()
export class PayoutProcessor {
  private readonly logger = new Logger(PayoutProcessor.name);
  private readonly QUEUE_KEY = 'payout:queue';
  private readonly PROCESSING_KEY = 'payout:processing';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Process approved redemptions automatically
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processPayoutQueue() {
    try {
      // Get processing redemptions that need payout
      const processingRedemptions = await this.prisma.redemption.findMany({
        where: {
          status: 'processing',
          processedAt: {
            lte: new Date(Date.now() - 60 * 1000), // At least 1 minute old
          },
        },
        include: {
          user: true,
        },
        take: 10,
      });

      if (processingRedemptions.length === 0) return;

      this.logger.log(`Processing ${processingRedemptions.length} payouts`);

      for (const redemption of processingRedemptions) {
        await this.processPayout(redemption);
      }
    } catch (error: any) {
      this.logger.error('Error processing payout queue:', error);
    }
  }

  /**
   * Check for stuck payouts hourly
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkStuckPayouts() {
    try {
      const stuckThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours

      const stuckPayouts = await this.prisma.redemption.findMany({
        where: {
          status: 'processing',
          processedAt: { lte: stuckThreshold },
        },
        include: { user: true },
      });

      if (stuckPayouts.length > 0) {
        this.logger.warn(`Found ${stuckPayouts.length} stuck payouts older than 24 hours`);

        // Notify admins
        for (const payout of stuckPayouts) {
          await this.notifyAdminsStuckPayout(payout);
        }
      }
    } catch (error: any) {
      this.logger.error('Error checking stuck payouts:', error);
    }
  }

  /**
   * Generate daily payout reports
   */
  @Cron('0 6 * * *') // 6 AM daily
  async generateDailyPayoutReport() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyStats = await this.prisma.redemption.groupBy({
        by: ['status', 'method'],
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
        _count: true,
        _sum: {
          usdValue: true,
        },
      });

      const report = {
        date: yesterday.toISOString().split('T')[0],
        stats: dailyStats.map((s) => ({
          status: s.status,
          method: s.method,
          count: s._count,
          totalValue: Number(s._sum.usdValue || 0),
        })),
        generatedAt: new Date(),
      };

      // Store report in Redis
      await this.redis.set(
        `payout:report:${report.date}`,
        report,
        7 * 24 * 60 * 60, // 7 days TTL
      );

      this.logger.log(`Daily payout report generated for ${report.date}`);
    } catch (error: any) {
      this.logger.error('Error generating daily payout report:', error);
    }
  }

  /**
   * Process a single payout
   */
  private async processPayout(redemption: any) {
    const lockKey = `payout:lock:${redemption.id}`;

    // Try to acquire lock
    const locked = await this.redis.getClient().set(lockKey, '1', 'EX', 300, 'NX');
    if (!locked) {
      this.logger.log(`Payout ${redemption.id} is already being processed`);
      return;
    }

    try {
      this.logger.log(`Processing payout: ${redemption.id} - $${redemption.usdValue} via ${redemption.method}`);

      let payoutSuccess = false;
      let externalRef: string | null = null;

      // Process based on payment method
      switch (redemption.method.toLowerCase()) {
        case 'bank_transfer':
        case 'ach':
          const bankResult = await this.processBankTransfer(redemption);
          payoutSuccess = bankResult.success;
          externalRef = bankResult.referenceId;
          break;

        case 'paypal':
          const paypalResult = await this.processPayPalPayout(redemption);
          payoutSuccess = paypalResult.success;
          externalRef = paypalResult.referenceId;
          break;

        case 'crypto':
        case 'bitcoin':
        case 'ethereum':
          const cryptoResult = await this.processCryptoPayout(redemption);
          payoutSuccess = cryptoResult.success;
          externalRef = cryptoResult.txHash;
          break;

        case 'check':
          const checkResult = await this.processCheckPayout(redemption);
          payoutSuccess = checkResult.success;
          externalRef = checkResult.checkNumber;
          break;

        default:
          this.logger.warn(`Unknown payout method: ${redemption.method}`);
          return;
      }

      if (payoutSuccess) {
        // Update redemption to completed
        await this.prisma.redemption.update({
          where: { id: redemption.id },
          data: {
            status: 'completed',
            processedAt: new Date(),
          },
        });

        // Create a PayoutRequest record with the external reference
        await this.prisma.payoutRequest.create({
          data: {
            redemptionId: redemption.id,
            userId: redemption.userId,
            amount: redemption.usdValue,
            method: redemption.method,
            status: 'completed',
            processorRef: externalRef,
            completedAt: new Date(),
            metadata: { payoutProcessedAt: new Date() },
          },
        });

        // Update wallet lifetime redeemed
        await this.prisma.wallet.update({
          where: { userId: redemption.userId },
          data: {
            scLifetimeRedeemed: { increment: redemption.scAmount },
          },
        });

        // Notify user
        await this.notifyPayoutCompleted(redemption);

        this.logger.log(`Payout completed: ${redemption.id}, ref: ${externalRef}`);
      } else {
        // Mark as failed for manual review - update status since Redemption doesn't have metadata
        await this.prisma.redemption.update({
          where: { id: redemption.id },
          data: {
            status: 'rejected',
            rejectionReason: 'Payout processing failed - requires manual review',
          },
        });

        // Notify admins
        await this.notifyAdminsPayoutFailed(redemption);
      }
    } catch (error: any) {
      this.logger.error(`Error processing payout ${redemption.id}:`, error);
    } finally {
      // Release lock
      await this.redis.del(lockKey);
    }
  }

  /**
   * Process bank transfer/ACH payout
   */
  private async processBankTransfer(redemption: any): Promise<{ success: boolean; referenceId: string | null }> {
    // TODO: Integrate with payment processor (Stripe, PayPal Mass Payments, etc.)
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!isProduction) {
      // Simulate success in development
      this.logger.log(`[DEV] Bank transfer simulated for ${redemption.id}`);
      return {
        success: true,
        referenceId: `DEV_BANK_${Date.now()}`,
      };
    }

    // Production implementation would go here
    // const stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'));
    // const transfer = await stripe.transfers.create({ ... });

    return { success: false, referenceId: null };
  }

  /**
   * Process PayPal payout
   */
  private async processPayPalPayout(redemption: any): Promise<{ success: boolean; referenceId: string | null }> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!isProduction) {
      this.logger.log(`[DEV] PayPal payout simulated for ${redemption.id}`);
      return {
        success: true,
        referenceId: `DEV_PAYPAL_${Date.now()}`,
      };
    }

    // Production implementation
    // const paypal = require('@paypal/payouts-sdk');
    // const payout = await payoutClient.execute(new paypal.payouts.PayoutsPostRequest());

    return { success: false, referenceId: null };
  }

  /**
   * Process cryptocurrency payout
   */
  private async processCryptoPayout(redemption: any): Promise<{ success: boolean; txHash: string | null }> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!isProduction) {
      this.logger.log(`[DEV] Crypto payout simulated for ${redemption.id}`);
      return {
        success: true,
        txHash: `DEV_TX_${Math.random().toString(36).substr(2, 64)}`,
      };
    }

    // Production implementation would integrate with crypto payment processor
    // like BitPay, Coinbase Commerce, or direct blockchain integration

    return { success: false, txHash: null };
  }

  /**
   * Process check payout
   */
  private async processCheckPayout(redemption: any): Promise<{ success: boolean; checkNumber: string | null }> {
    // Check payouts are typically processed manually
    // This creates a record for the fulfillment team

    const checkNumber = `CHK${Date.now()}`;

    await this.prisma.payoutRequest.create({
      data: {
        redemptionId: redemption.id,
        userId: redemption.userId,
        method: 'check',
        amount: redemption.usdValue,
        status: 'pending',
        processorRef: checkNumber,
        payoutDetails: redemption.payoutDetails,
        metadata: { checkNumber, shippingAddress: (redemption.payoutDetails as any)?.address },
      },
    });

    this.logger.log(`Check payout queued: ${checkNumber}`);

    return { success: true, checkNumber };
  }

  /**
   * Notify user of completed payout
   */
  private async notifyPayoutCompleted(redemption: any) {
    await this.prisma.notification.create({
      data: {
        userId: redemption.userId,
        type: 'redemption',
        title: 'Payout Completed! 💰',
        message: `Your redemption of $${redemption.usdValue} has been sent via ${redemption.method}.`,
        actionUrl: '/wallet/redemptions',
      },
    });

    await this.redis.publish('notification:new', {
      userId: redemption.userId,
      type: 'redemption',
      title: 'Payout Completed!',
    });

    // Also queue email notification
    await this.redis.rpush('email:queue', {
      id: `email_payout_${redemption.id}`,
      to: redemption.user.email,
      subject: 'Your Redemption Has Been Completed',
      template: 'payout_completed',
      data: {
        amount: redemption.usdValue,
        method: redemption.method,
        date: new Date().toLocaleDateString(),
      },
    });
  }

  /**
   * Notify admins of stuck payout
   */
  private async notifyAdminsStuckPayout(redemption: any) {
    const admins = await this.prisma.adminUser.findMany({
      where: {
        isActive: true,
      },
    });

    for (const admin of admins) {
      await this.redis.rpush('email:queue', {
        id: `email_stuck_${redemption.id}_${admin.id}`,
        to: admin.email,
        subject: `⚠️ Stuck Payout Alert: ${redemption.id}`,
        template: 'admin_stuck_payout',
        data: {
          redemptionId: redemption.id,
          userId: redemption.userId,
          amount: redemption.usdValue,
          method: redemption.method,
          processedAt: redemption.processedAt,
        },
        priority: 1,
      });
    }
  }

  /**
   * Notify admins of failed payout
   */
  private async notifyAdminsPayoutFailed(redemption: any) {
    const admins = await this.prisma.adminUser.findMany({
      where: {
        isActive: true,
      },
    });

    for (const admin of admins) {
      await this.redis.rpush('email:queue', {
        id: `email_failed_${redemption.id}_${admin.id}`,
        to: admin.email,
        subject: `❌ Payout Failed: ${redemption.id}`,
        template: 'admin_payout_failed',
        data: {
          redemptionId: redemption.id,
          userId: redemption.userId,
          userEmail: redemption.user.email,
          amount: redemption.usdValue,
          method: redemption.method,
        },
        priority: 1,
      });
    }
  }

  /**
   * Queue a manual payout (admin triggered)
   */
  async queueManualPayout(redemptionId: string): Promise<void> {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
    });

    if (!redemption) {
      throw new Error('Redemption not found');
    }

    if (redemption.status !== 'processing') {
      throw new Error('Redemption must be in processing status');
    }

    await this.processPayout(redemption);
  }

  /**
   * Get payout statistics
   */
  async getPayoutStats(startDate?: Date, endDate?: Date): Promise<any> {
    const where: any = {};
    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) where.completedAt.gte = startDate;
      if (endDate) where.completedAt.lte = endDate;
    }

    const [completed, pending, processing, total] = await Promise.all([
      this.prisma.redemption.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { usdValue: true },
        _count: true,
      }),
      this.prisma.redemption.aggregate({
        where: { status: 'pending' },
        _sum: { usdValue: true },
        _count: true,
      }),
      this.prisma.redemption.aggregate({
        where: { status: 'processing' },
        _sum: { usdValue: true },
        _count: true,
      }),
      this.prisma.redemption.aggregate({
        _sum: { usdValue: true },
        _count: true,
      }),
    ]);

    return {
      completed: {
        count: completed._count,
        value: Number(completed._sum.usdValue || 0),
      },
      pending: {
        count: pending._count,
        value: Number(pending._sum.usdValue || 0),
      },
      processing: {
        count: processing._count,
        value: Number(processing._sum.usdValue || 0),
      },
      total: {
        count: total._count,
        value: Number(total._sum.usdValue || 0),
      },
    };
  }
}
