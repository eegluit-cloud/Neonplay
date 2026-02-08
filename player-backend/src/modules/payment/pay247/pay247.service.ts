import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { WalletService } from '../../wallet/wallet.service';
import { Pay247ApiUtil } from './utils/pay247-api.util';
import { SignatureUtil } from './utils/signature.util';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Decimal } from '@prisma/client/runtime/library';
import {
  Pay247DepositResponse,
  Pay247WithdrawalResponse,
  Pay247TransactionStatus,
} from './interfaces/pay247.interface';

const CURRENCY_BALANCE_FIELDS: Record<string, string> = {
  USD: 'usdBalance',
  EUR: 'eurBalance',
  GBP: 'gbpBalance',
  CAD: 'cadBalance',
  AUD: 'audBalance',
  PHP: 'phpBalance',
  INR: 'inrBalance',
  THB: 'thbBalance',
  CNY: 'cnyBalance',
  JPY: 'jpyBalance',
  USDC: 'usdcBalance',
  USDT: 'usdtBalance',
  BTC: 'btcBalance',
  ETH: 'ethBalance',
  SOL: 'solBalance',
  DOGE: 'dogeBalance',
};

@Injectable()
export class Pay247Service {
  private readonly logger = new Logger(Pay247Service.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly pay247Api: Pay247ApiUtil,
    private readonly configService: ConfigService,
  ) {}

  // ==========================================
  // DEPOSIT OPERATIONS
  // ==========================================

  /**
   * Create deposit - Step 1: Create deposit in our system + Get Pay247 payment URL
   * Uses existing walletService.initiateDeposit() + adds Pay247 API call
   */
  async createDeposit(
    userId: string,
    createDepositDto: CreateDepositDto,
    clientIp: string,
  ): Promise<Pay247DepositResponse> {
    const { amount, currency, paymentMethod, returnUrl, theme } = createDepositDto;

    // Normalize IPv6-mapped IPv4 addresses (::ffff:x.x.x.x -> x.x.x.x)
    const normalizedIp = clientIp.replace(/^::ffff:/, '');

    try {
      this.logger.log(`Creating deposit for user ${userId}, IP: ${normalizedIp}`);

      // 1. Create deposit record using EXISTING wallet service
      const deposit = await this.walletService.initiateDeposit(
        userId,
        currency as any,
        amount,
        'pay247',
        undefined, // No package
      );

      // 2. Generate unique merchant order ID
      const merchantOrderId = `PAY247_DEP_${deposit.depositId}`;

      // 3. Call Pay247 API to create payment (with all required parameters)
      const pay247Response = await this.pay247Api.createPayment({
        merchant_order_id: merchantOrderId,
        user_id: userId,
        amount,
        currency,
        payment_method: paymentMethod,
        callback_url: this.configService.get<string>('PAY247_DEPOSIT_WEBHOOK_URL') || '',
        client_ip: normalizedIp,
        return_url: returnUrl,
        theme: theme as 'link' | 'custom' | undefined,
      });

      // 4. Update deposit with Pay247-specific fields
      await this.prisma.deposit.update({
        where: { id: deposit.depositId },
        data: {
          merchantOrderId,
          pay247OrderId: pay247Response.order_id,
          paymentUrl: pay247Response.payment_url,
          pay247Metadata: pay247Response as any,
        },
      });

      this.logger.log(`Deposit created: ${merchantOrderId} for user ${userId}`);

      return {
        depositId: deposit.depositId,
        paymentUrl: pay247Response.payment_url,
        merchantOrderId,
        pay247OrderId: pay247Response.order_id,
      };
    } catch (error: unknown) {
      console.log(error)
      this.logger.error(`Failed to create deposit for user ${userId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Handle deposit webhook - Step 2: Process webhook from Pay247
   * SECURE implementation with all safety checks
   */
  async handleDepositWebhook(
    webhookData: any,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    // STEP 1: SIGNATURE VERIFICATION
    const isValid = SignatureUtil.verify(
      webhookData,
      this.configService.get<string>('PAY247_WEBHOOK_SECRET') || '',
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature', { webhookData, ipAddress });
      throw new UnauthorizedException('Invalid signature');
    }

    // STEP 2: IP WHITELIST VALIDATION (Optional)
    const allowedIPs = this.configService.get<string>('PAY247_WEBHOOK_IPS')?.split(',') || [];
    if (allowedIPs.length > 0 && !allowedIPs.includes(ipAddress)) {
      this.logger.error('Webhook from unauthorized IP', { ipAddress, webhookData });
      throw new ForbiddenException('Unauthorized IP address');
    }

    // STEP 3: IDEMPOTENCY CHECK
    const idempotencyKey = `deposit_${webhookData.order_no}_${webhookData.created_at || Date.now()}`;

    const existingWebhook = await this.prisma.pay247WebhookLog.findUnique({
      where: { idempotencyKey },
    });

    if (existingWebhook?.processed) {
      this.logger.warn('Duplicate webhook detected - already processed', { idempotencyKey });
      return { success: true, message: 'Already processed' };
    }

    // STEP 4: PROCESS IN DATABASE TRANSACTION
    return this.prisma.$transaction(
      async (tx) => {
        // Log webhook receipt
        const webhookLog = await tx.pay247WebhookLog.create({
          data: {
            webhookType: 'deposit',
            pay247OrderId: webhookData.order_no,
            webhookData,
            signature: webhookData.sign,
            ipAddress,
            userAgent,
            idempotencyKey,
            processed: false,
          },
        });

        try {
          // STEP 5: FIND DEPOSIT BY MERCHANT ORDER ID
          const deposit = await tx.deposit.findUnique({
            where: { merchantOrderId: webhookData.mch_order_no },
          });

          if (!deposit) {
            throw new NotFoundException(`Deposit not found for merchant order ${webhookData.mch_order_no}`);
          }

          // STEP 6: STATUS VALIDATION - Prevent processing if already completed
          if (deposit.status === 'completed') {
            this.logger.warn('Deposit already completed', {
              depositId: deposit.id,
              webhookOrderId: webhookData.order_no,
            });

            await tx.pay247WebhookLog.update({
              where: { id: webhookLog.id },
              data: { processed: true, processedAt: new Date() },
            });

            return { success: true, message: 'Deposit already completed' };
          }

          // STEP 7: UPDATE DEPOSIT METADATA
          const currentMetadata = (deposit.pay247Metadata as any) || {};
          await tx.deposit.update({
            where: { id: deposit.id },
            data: {
              pay247Metadata: {
                ...currentMetadata,
                webhooks: [...(currentMetadata.webhooks || []), {
                  receivedAt: new Date(),
                  data: webhookData,
                  ipAddress,
                }],
              } as any,
            },
          });

          // STEP 8: PROCESS BASED ON STATUS
          if (webhookData.status === 'SUCCESS') {
            // SUCCESSFUL PAYMENT - Credit wallet
            await this.walletService.confirmDeposit(
              deposit.userId,
              deposit.id,
              webhookData.order_no,
              undefined, // tx_hash not provided in webhook
            );

            // Update statistics
            await this.updateDepositStatistics(tx, deposit, true);

            this.logger.log('Deposit confirmed successfully', {
              depositId: deposit.id,
              userId: deposit.userId,
              amount: deposit.amount,
            });
          } else if (webhookData.status === 'failed' || webhookData.status === 'cancelled') {
            // FAILED PAYMENT - Update status only
            await tx.deposit.update({
              where: { id: deposit.id },
              data: {
                status: 'failed',
                pay247Metadata: {
                  ...currentMetadata,
                  failureReason: webhookData.reason || webhookData.error_message,
                } as any,
              },
            });

            // Update statistics
            await this.updateDepositStatistics(tx, deposit, false);

            this.logger.warn('Deposit failed', {
              depositId: deposit.id,
              reason: webhookData.reason,
            });
          }

          // STEP 9: MARK WEBHOOK AS PROCESSED
          await tx.pay247WebhookLog.update({
            where: { id: webhookLog.id },
            data: {
              processed: true,
              processedAt: new Date(),
            },
          });

          return { success: true, message: 'Webhook processed successfully' };
        } catch (error: unknown) {
          // STEP 10: ERROR HANDLING
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;

          this.logger.error('Error processing deposit webhook', {
            error: errorMessage,
            stack: errorStack,
            webhookData,
          });

          await tx.pay247WebhookLog.update({
            where: { id: webhookLog.id },
            data: { processingError: errorMessage },
          });

          throw error;
        }
      },
      {
        timeout: 10000,
        maxWait: 5000,
      },
    );
  }

  // ==========================================
  // WITHDRAWAL OPERATIONS
  // ==========================================

  /**
   * Create withdrawal - Step 1: Create withdrawal + Submit to Pay247
   */
  async createWithdrawal(
    userId: string,
    createWithdrawalDto: CreateWithdrawalDto,
  ): Promise<Pay247WithdrawalResponse> {
    const { amount, currency, paymentMethod, ...accountFields } = createWithdrawalDto;
    const accountDetails = {
      upiId: accountFields.upiId,
      accountHolder: accountFields.accountHolder,
      accountNumber: accountFields.accountNumber,
      ifscCode: accountFields.ifscCode,
      walletAddress: accountFields.walletAddress,
      mobileNumber: accountFields.mobileNumber,
      accountName: accountFields.accountName,
    };

    try {
      // 1. Create withdrawal using EXISTING wallet service
      const withdrawal = await this.walletService.requestWithdrawal(
        userId,
        currency as any,
        amount,
        'pay247',
        accountDetails,
        accountFields.walletAddress,
      );

      // 2. Generate unique merchant order ID
      const merchantOrderId = `PAY247_WTH_${withdrawal.withdrawalId}`;

      // 3. Call Pay247 API to create payout
      const pay247Response = await this.pay247Api.createPayout({
        merchant_order_id: merchantOrderId,
        amount,
        currency,
        payment_method: paymentMethod,
        account_details: accountDetails,
        callback_url: this.configService.get<string>('PAY247_WITHDRAWAL_WEBHOOK_URL') || '',
      });

      // 4. Update withdrawal with Pay247-specific fields
      await this.prisma.withdrawal.update({
        where: { id: withdrawal.withdrawalId },
        data: {
          merchantOrderId,
          pay247OrderId: pay247Response.payout_id,
          status: 'processing',
          pay247Metadata: pay247Response as any,
        },
      });

      this.logger.log(`Withdrawal created: ${merchantOrderId} for user ${userId}`);

      return {
        withdrawalId: withdrawal.withdrawalId,
        merchantOrderId,
        pay247OrderId: pay247Response.payout_id,
        status: 'processing',
      };
    } catch (error: unknown) {
      this.logger.error(`Failed to create withdrawal for user ${userId}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * Handle withdrawal webhook - Step 2: Process webhook from Pay247
   * SECURE implementation with refund logic for failed withdrawals
   */
  async handleWithdrawalWebhook(
    webhookData: any,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ success: boolean; message: string }> {
    // STEP 1: SIGNATURE VERIFICATION
    const isValid = SignatureUtil.verify(
      webhookData,
      this.configService.get<string>('PAY247_WEBHOOK_SECRET') || '',
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature', { webhookData, ipAddress });
      throw new UnauthorizedException('Invalid signature');
    }

    // STEP 2: IP WHITELIST VALIDATION
    const allowedIPs = this.configService.get<string>('PAY247_WEBHOOK_IPS')?.split(',') || [];
    if (allowedIPs.length > 0 && !allowedIPs.includes(ipAddress)) {
      this.logger.error('Webhook from unauthorized IP', { ipAddress });
      throw new ForbiddenException('Unauthorized IP address');
    }

    // STEP 3: IDEMPOTENCY CHECK
    const idempotencyKey = `withdrawal_${webhookData.payout_id}_${webhookData.timestamp || Date.now()}`;

    const existingWebhook = await this.prisma.pay247WebhookLog.findUnique({
      where: { idempotencyKey },
    });

    if (existingWebhook?.processed) {
      this.logger.warn('Duplicate webhook - already processed', { idempotencyKey });
      return { success: true, message: 'Already processed' };
    }

    // STEP 4: PROCESS IN DATABASE TRANSACTION
    return this.prisma.$transaction(
      async (tx) => {
        // Log webhook
        const webhookLog = await tx.pay247WebhookLog.create({
          data: {
            webhookType: 'withdrawal',
            pay247OrderId: webhookData.payout_id,
            webhookData,
            signature: webhookData.sign,
            ipAddress,
            userAgent,
            idempotencyKey,
            processed: false,
          },
        });

        try {
          // STEP 5: FIND WITHDRAWAL
          const withdrawal = await tx.withdrawal.findUnique({
            where: { pay247OrderId: webhookData.payout_id },
          });

          if (!withdrawal) {
            throw new NotFoundException(`Withdrawal not found for payout ${webhookData.payout_id}`);
          }

          // STEP 6: STATUS VALIDATION
          if (withdrawal.status === 'completed') {
            this.logger.warn('Withdrawal already completed', { withdrawalId: withdrawal.id });

            await tx.pay247WebhookLog.update({
              where: { id: webhookLog.id },
              data: { processed: true, processedAt: new Date() },
            });

            return { success: true, message: 'Withdrawal already completed' };
          }

          // STEP 7: UPDATE WITHDRAWAL METADATA
          const currentMetadata = (withdrawal.pay247Metadata as any) || {};
          await tx.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
              pay247Metadata: {
                ...currentMetadata,
                webhooks: [...(currentMetadata.webhooks || []), {
                  receivedAt: new Date(),
                  data: webhookData,
                  ipAddress,
                }],
              } as any,
            },
          });

          // STEP 8: PROCESS BASED ON STATUS
          if (webhookData.status === 'success' || webhookData.status === 'completed') {
            // SUCCESSFUL PAYOUT
            await tx.withdrawal.update({
              where: { id: withdrawal.id },
              data: {
                status: 'completed',
                completedAt: new Date(),
                txHash: webhookData.tx_hash,
              },
            });

            // Update statistics
            await this.updateWithdrawalStatistics(tx, withdrawal, true);

            this.logger.log('Withdrawal completed successfully', {
              withdrawalId: withdrawal.id,
              userId: withdrawal.userId,
              amount: withdrawal.amount,
            });
          } else if (webhookData.status === 'failed' || webhookData.status === 'cancelled') {
            // FAILED PAYOUT - REFUND TO WALLET
            await tx.withdrawal.update({
              where: { id: withdrawal.id },
              data: {
                status: 'failed',
                rejectionReason: webhookData.reason || webhookData.error_message || 'Payout failed',
                completedAt: new Date(),
              },
            });

            // Refund logic
            await this.refundFailedWithdrawal(tx, withdrawal);

            // Update statistics
            await this.updateWithdrawalStatistics(tx, withdrawal, false);

            this.logger.log('Withdrawal failed - refunded to wallet', {
              withdrawalId: withdrawal.id,
              userId: withdrawal.userId,
              refundAmount: withdrawal.amount.toString(),
              reason: webhookData.reason,
            });
          }

          // STEP 9: MARK WEBHOOK AS PROCESSED
          await tx.pay247WebhookLog.update({
            where: { id: webhookLog.id },
            data: {
              processed: true,
              processedAt: new Date(),
            },
          });

          return { success: true, message: 'Webhook processed successfully' };
        } catch (error: unknown) {
          // STEP 10: ERROR HANDLING
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : undefined;

          this.logger.error('Error processing withdrawal webhook', {
            error: errorMessage,
            stack: errorStack,
            webhookData,
          });

          await tx.pay247WebhookLog.update({
            where: { id: webhookLog.id },
            data: { processingError: errorMessage },
          });

          throw error;
        }
      },
      {
        timeout: 10000,
        maxWait: 5000,
      },
    );
  }

  // ==========================================
  // QUERY OPERATIONS
  // ==========================================

  async queryDepositStatus(userId: string, merchantOrderId: string): Promise<Pay247TransactionStatus> {
    const deposit = await this.prisma.deposit.findFirst({
      where: { merchantOrderId, userId },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    if (!deposit.pay247OrderId || !deposit.merchantOrderId) {
      throw new Error('Deposit missing Pay247 order IDs');
    }

    // Query Pay247 API for latest status
    const pay247Status = await this.pay247Api.queryOrder(deposit.pay247OrderId);

    return {
      orderId: deposit.id,
      merchantOrderId: deposit.merchantOrderId,
      status: deposit.status,
      amount: deposit.amount.toNumber(),
      currency: deposit.currency,
      pay247Status,
    };
  }

  async queryWithdrawalStatus(userId: string, merchantOrderId: string): Promise<Pay247TransactionStatus> {
    const withdrawal = await this.prisma.withdrawal.findFirst({
      where: { merchantOrderId, userId },
    });

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal not found');
    }

    if (!withdrawal.pay247OrderId || !withdrawal.merchantOrderId) {
      throw new Error('Withdrawal missing Pay247 order IDs');
    }

    // Query Pay247 API for latest status
    const pay247Status = await this.pay247Api.queryPayout(withdrawal.pay247OrderId);

    return {
      orderId: withdrawal.id,
      merchantOrderId: withdrawal.merchantOrderId,
      status: withdrawal.status,
      amount: withdrawal.amount.toNumber(),
      currency: withdrawal.currency,
      pay247Status,
    };
  }

  // ==========================================
  // STATISTICS UPDATE HELPERS
  // ==========================================

  private async updateDepositStatistics(tx: any, deposit: any, success: boolean) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Update User Stats
    await tx.userPaymentStats.upsert({
      where: { userId: deposit.userId },
      create: {
        userId: deposit.userId,
        pay247DepositCount: success ? 1 : 0,
        pay247DepositTotalUSDC: success ? deposit.usdcAmount : 0,
        pay247LastDepositAt: success ? new Date() : null,
      },
      update: {
        ...(success && {
          pay247DepositCount: { increment: 1 },
          pay247DepositTotalUSDC: { increment: deposit.usdcAmount },
          pay247LastDepositAt: new Date(),
        }),
      },
    });

    // 2. Update Daily Stats
    await tx.dailyPaymentStats.upsert({
      where: { date: today },
      create: {
        date: today,
        pay247DepositCount: 1,
        pay247DepositTotalUSDC: success ? deposit.usdcAmount : 0,
        pay247DepositSuccessCount: success ? 1 : 0,
        pay247DepositFailedCount: success ? 0 : 1,
      },
      update: {
        pay247DepositCount: { increment: 1 },
        ...(success && {
          pay247DepositTotalUSDC: { increment: deposit.usdcAmount },
          pay247DepositSuccessCount: { increment: 1 },
        }),
        ...(!success && {
          pay247DepositFailedCount: { increment: 1 },
        }),
      },
    });

    // 3. Update Global Stats
    await tx.globalPaymentStats.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        pay247DepositCountTotal: 1,
        pay247DepositAmountTotal: success ? deposit.usdcAmount : 0,
        pay247DepositSuccessTotal: success ? 1 : 0,
        pay247DepositFailedTotal: success ? 0 : 1,
      },
      update: {
        pay247DepositCountTotal: { increment: 1 },
        ...(success && {
          pay247DepositAmountTotal: { increment: deposit.usdcAmount },
          pay247DepositSuccessTotal: { increment: 1 },
        }),
        ...(!success && {
          pay247DepositFailedTotal: { increment: 1 },
        }),
      },
    });
  }

  private async updateWithdrawalStatistics(tx: any, withdrawal: any, success: boolean) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Update User Stats
    await tx.userPaymentStats.upsert({
      where: { userId: withdrawal.userId },
      create: {
        userId: withdrawal.userId,
        pay247WithdrawalCount: success ? 1 : 0,
        pay247WithdrawalTotalUSDC: success ? withdrawal.usdcAmount : 0,
        pay247LastWithdrawalAt: success ? new Date() : null,
      },
      update: {
        ...(success && {
          pay247WithdrawalCount: { increment: 1 },
          pay247WithdrawalTotalUSDC: { increment: withdrawal.usdcAmount },
          pay247LastWithdrawalAt: new Date(),
        }),
      },
    });

    // 2. Update Daily Stats
    await tx.dailyPaymentStats.upsert({
      where: { date: today },
      create: {
        date: today,
        pay247WithdrawalCount: 1,
        pay247WithdrawalTotalUSDC: success ? withdrawal.usdcAmount : 0,
        pay247WithdrawalSuccessCount: success ? 1 : 0,
        pay247WithdrawalFailedCount: success ? 0 : 1,
      },
      update: {
        pay247WithdrawalCount: { increment: 1 },
        ...(success && {
          pay247WithdrawalTotalUSDC: { increment: withdrawal.usdcAmount },
          pay247WithdrawalSuccessCount: { increment: 1 },
        }),
        ...(!success && {
          pay247WithdrawalFailedCount: { increment: 1 },
        }),
      },
    });

    // 3. Update Global Stats
    await tx.globalPaymentStats.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        pay247WithdrawalCountTotal: 1,
        pay247WithdrawalAmountTotal: success ? withdrawal.usdcAmount : 0,
        pay247WithdrawalSuccessTotal: success ? 1 : 0,
        pay247WithdrawalFailedTotal: success ? 0 : 1,
      },
      update: {
        pay247WithdrawalCountTotal: { increment: 1 },
        ...(success && {
          pay247WithdrawalAmountTotal: { increment: withdrawal.usdcAmount },
          pay247WithdrawalSuccessTotal: { increment: 1 },
        }),
        ...(!success && {
          pay247WithdrawalFailedTotal: { increment: 1 },
        }),
      },
    });
  }

  private async refundFailedWithdrawal(tx: any, withdrawal: any) {
    const wallet = await tx.wallet.findUnique({
      where: { userId: withdrawal.userId },
    });

    if (!wallet) {
      throw new Error('Wallet not found for refund');
    }

    const currency = withdrawal.currency;
    const balanceField = CURRENCY_BALANCE_FIELDS[currency];
    const currentBalance = new Decimal((wallet as any)[balanceField] || 0);
    const refundAmount = new Decimal(withdrawal.amount);
    const newBalance = currentBalance.plus(refundAmount);

    // Create refund transaction
    await tx.transaction.create({
      data: {
        userId: withdrawal.userId,
        walletId: wallet.id,
        type: 'refund',
        currency: withdrawal.currency,
        amount: refundAmount,
        usdcAmount: withdrawal.usdcAmount,
        exchangeRate: withdrawal.exchangeRate,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceType: 'withdrawal',
        referenceId: withdrawal.id,
        status: 'completed',
        metadata: {
          reason: 'Pay247 withdrawal failed',
          pay247OrderId: withdrawal.pay247OrderId,
        },
      },
    });

    // Update wallet balance with optimistic locking
    const updateResult = await tx.wallet.updateMany({
      where: {
        id: wallet.id,
        version: wallet.version,
      },
      data: {
        [balanceField]: newBalance,
        version: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      throw new ConflictException('Wallet was modified during refund. Please retry.');
    }
  }
}
