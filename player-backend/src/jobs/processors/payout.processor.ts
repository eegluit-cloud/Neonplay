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
      // Get processing withdrawals that need payout
      const processingWithdrawals = await this.prisma.withdrawal.findMany({
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

      if (processingWithdrawals.length === 0) return;

      this.logger.log(`Processing ${processingWithdrawals.length} payouts`);

      for (const withdrawal of processingWithdrawals) {
        await this.processPayout(withdrawal);
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

      const stuckPayouts = await this.prisma.withdrawal.findMany({
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

      const dailyStats = await this.prisma.withdrawal.groupBy({
        by: ['status', 'method'],
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
        _count: true,
        _sum: {
          usdcAmount: true,
        },
      });

      const report = {
        date: yesterday.toISOString().split('T')[0],
        stats: dailyStats.map((s: any) => ({
          status: s.status,
          method: s.method,
          count: s._count,
          totalValue: Number(s._sum.usdcAmount || 0),
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
  private async processPayout(withdrawal: any) {
    const lockKey = `payout:lock:${withdrawal.id}`;

    // Try to acquire lock
    const locked = await this.redis.getClient().set(lockKey, '1', 'EX', 300, 'NX');
    if (!locked) {
      this.logger.log(`Payout ${withdrawal.id} is already being processed`);
      return;
    }

    try {
      this.logger.log(`Processing payout: ${withdrawal.id} - $${withdrawal.usdcAmount} via ${withdrawal.method}`);

      let payoutSuccess = false;
      let externalRef: string | null = null;

      // Process based on payment method
      switch (withdrawal.method.toLowerCase()) {
        case 'bank_transfer':
        case 'ach':
          const bankResult = await this.processBankTransfer(withdrawal);
          payoutSuccess = bankResult.success;
          externalRef = bankResult.referenceId;
          break;

        case 'paypal':
          const paypalResult = await this.processPayPalPayout(withdrawal);
          payoutSuccess = paypalResult.success;
          externalRef = paypalResult.referenceId;
          break;

        case 'crypto':
        case 'bitcoin':
        case 'ethereum':
          const cryptoResult = await this.processCryptoPayout(withdrawal);
          payoutSuccess = cryptoResult.success;
          externalRef = cryptoResult.txHash;
          break;

        case 'check':
          const checkResult = await this.processCheckPayout(withdrawal);
          payoutSuccess = checkResult.success;
          externalRef = checkResult.checkNumber;
          break;

        default:
          this.logger.warn(`Unknown payout method: ${withdrawal.method}`);
          return;
      }

      if (payoutSuccess) {
        // Update withdrawal to completed
        await this.prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        });

        // Create a PayoutRequest record with the external reference
        await this.prisma.payoutRequest.create({
          data: {
            redemptionId: withdrawal.id,
            userId: withdrawal.userId,
            amount: withdrawal.usdcAmount,
            method: withdrawal.method,
            status: 'completed',
            processorRef: externalRef,
            completedAt: new Date(),
            metadata: { payoutProcessedAt: new Date() },
          },
        });

        // Update wallet lifetime withdrawn (stored in USDC equivalent)
        await this.prisma.wallet.update({
          where: { userId: withdrawal.userId },
          data: {
            lifetimeWithdrawn: { increment: withdrawal.usdcAmount },
          },
        });

        // Notify user
        await this.notifyPayoutCompleted(withdrawal);

        this.logger.log(`Payout completed: ${withdrawal.id}, ref: ${externalRef}`);
      } else {
        // Mark as failed for manual review
        await this.prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: 'rejected',
            rejectionReason: 'Payout processing failed - requires manual review',
          },
        });

        // Notify admins
        await this.notifyAdminsPayoutFailed(withdrawal);
      }
    } catch (error: any) {
      this.logger.error(`Error processing payout ${withdrawal.id}:`, error);
    } finally {
      // Release lock
      await this.redis.del(lockKey);
    }
  }

  /**
   * Process bank transfer/ACH payout
   */
  private async processBankTransfer(withdrawal: any): Promise<{ success: boolean; referenceId: string | null }> {
    // TODO: Integrate with payment processor (Stripe, PayPal Mass Payments, etc.)
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!isProduction) {
      // Simulate success in development
      this.logger.log(`[DEV] Bank transfer simulated for ${withdrawal.id}`);
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
  private async processPayPalPayout(withdrawal: any): Promise<{ success: boolean; referenceId: string | null }> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!isProduction) {
      this.logger.log(`[DEV] PayPal payout simulated for ${withdrawal.id}`);
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
  private async processCryptoPayout(withdrawal: any): Promise<{ success: boolean; txHash: string | null }> {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!isProduction) {
      this.logger.log(`[DEV] Crypto payout simulated for ${withdrawal.id}`);
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
  private async processCheckPayout(withdrawal: any): Promise<{ success: boolean; checkNumber: string | null }> {
    // Check payouts are typically processed manually
    // This creates a record for the fulfillment team

    const checkNumber = `CHK${Date.now()}`;

    await this.prisma.payoutRequest.create({
      data: {
        redemptionId: withdrawal.id,
        userId: withdrawal.userId,
        method: 'check',
        amount: withdrawal.usdcAmount,
        status: 'pending',
        processorRef: checkNumber,
        payoutDetails: withdrawal.payoutDetails,
        metadata: { checkNumber, shippingAddress: (withdrawal.payoutDetails as any)?.address },
      },
    });

    this.logger.log(`Check payout queued: ${checkNumber}`);

    return { success: true, checkNumber };
  }

  /**
   * Notify user of completed payout
   */
  private async notifyPayoutCompleted(withdrawal: any) {
    await this.prisma.notification.create({
      data: {
        userId: withdrawal.userId,
        type: 'withdrawal',
        title: 'Payout Completed! 💰',
        message: `Your withdrawal of $${withdrawal.usdcAmount} has been sent via ${withdrawal.method}.`,
        actionUrl: '/wallet/withdrawals',
      },
    });

    await this.redis.publish('notification:new', {
      userId: withdrawal.userId,
      type: 'withdrawal',
      title: 'Payout Completed!',
    });

    // Also queue email notification
    await this.redis.rpush('email:queue', {
      id: `email_payout_${withdrawal.id}`,
      to: withdrawal.user.email,
      subject: 'Your Withdrawal Has Been Completed',
      template: 'payout_completed',
      data: {
        amount: withdrawal.usdcAmount,
        method: withdrawal.method,
        date: new Date().toLocaleDateString(),
      },
    });
  }

  /**
   * Notify admins of stuck payout
   */
  private async notifyAdminsStuckPayout(withdrawal: any) {
    const admins = await this.prisma.adminUser.findMany({
      where: {
        isActive: true,
      },
    });

    for (const admin of admins) {
      await this.redis.rpush('email:queue', {
        id: `email_stuck_${withdrawal.id}_${admin.id}`,
        to: admin.email,
        subject: `⚠️ Stuck Payout Alert: ${withdrawal.id}`,
        template: 'admin_stuck_payout',
        data: {
          withdrawalId: withdrawal.id,
          userId: withdrawal.userId,
          amount: withdrawal.usdcAmount,
          method: withdrawal.method,
          processedAt: withdrawal.processedAt,
        },
        priority: 1,
      });
    }
  }

  /**
   * Notify admins of failed payout
   */
  private async notifyAdminsPayoutFailed(withdrawal: any) {
    const admins = await this.prisma.adminUser.findMany({
      where: {
        isActive: true,
      },
    });

    for (const admin of admins) {
      await this.redis.rpush('email:queue', {
        id: `email_failed_${withdrawal.id}_${admin.id}`,
        to: admin.email,
        subject: `❌ Payout Failed: ${withdrawal.id}`,
        template: 'admin_payout_failed',
        data: {
          withdrawalId: withdrawal.id,
          userId: withdrawal.userId,
          userEmail: withdrawal.user.email,
          amount: withdrawal.usdcAmount,
          method: withdrawal.method,
        },
        priority: 1,
      });
    }
  }

  /**
   * Queue a manual payout (admin triggered)
   */
  async queueManualPayout(withdrawalId: string): Promise<void> {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== 'processing') {
      throw new Error('Withdrawal must be in processing status');
    }

    await this.processPayout(withdrawal);
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
      this.prisma.withdrawal.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { usdcAmount: true },
        _count: true,
      }),
      this.prisma.withdrawal.aggregate({
        where: { status: 'pending' },
        _sum: { usdcAmount: true },
        _count: true,
      }),
      this.prisma.withdrawal.aggregate({
        where: { status: 'processing' },
        _sum: { usdcAmount: true },
        _count: true,
      }),
      this.prisma.withdrawal.aggregate({
        _sum: { usdcAmount: true },
        _count: true,
      }),
    ]);

    return {
      completed: {
        count: completed._count,
        value: Number(completed._sum.usdcAmount || 0),
      },
      pending: {
        count: pending._count,
        value: Number(pending._sum.usdcAmount || 0),
      },
      processing: {
        count: processing._count,
        value: Number(processing._sum.usdcAmount || 0),
      },
      total: {
        count: total._count,
        value: Number(total._sum.usdcAmount || 0),
      },
    };
  }
}
