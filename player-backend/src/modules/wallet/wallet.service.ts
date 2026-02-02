import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { Decimal } from '@prisma/client/runtime/library';
import { createPaginatedResult, getPaginationParams, PaginationDto } from '../../common/utils/pagination.util';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { Currency, FiatCurrency, CryptoCurrency } from '../../shared/types';
import { ALL_CURRENCIES, FIAT_CURRENCIES, CRYPTO_CURRENCIES, DEFAULT_BONUSES, WITHDRAWAL_LIMITS } from '../../shared/constants';

// Currency balance field mapping
const CURRENCY_BALANCE_FIELDS: Record<Currency, string> = {
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
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get current exchange rate for a currency to USDC
   * In production, this would call an external price feed API
   */
  async getExchangeRate(currency: Currency): Promise<Decimal> {
    // Stablecoins are 1:1 with USDC
    if (currency === 'USDC' || currency === 'USDT') {
      return new Decimal(1);
    }
    // Fiat currencies - approximate rates (in production, use real-time rates)
    const fiatRates: Record<string, number> = {
      USD: 1,
      EUR: 1.08,
      GBP: 1.27,
      CAD: 0.74,
      AUD: 0.65,
    };
    if (fiatRates[currency]) {
      return new Decimal(fiatRates[currency]);
    }
    // Crypto rates - in production, fetch from price oracle
    const cryptoRates: Record<string, number> = {
      BTC: 43000,
      ETH: 2200,
      SOL: 100,
      DOGE: 0.08,
    };
    if (cryptoRates[currency]) {
      return new Decimal(cryptoRates[currency]);
    }
    return new Decimal(1);
  }

  /**
   * Convert amount from one currency to USDC equivalent
   */
  async toUsdcAmount(amount: Decimal, currency: Currency): Promise<Decimal> {
    const rate = await this.getExchangeRate(currency);
    return amount.times(rate);
  }

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        usdBalance: true,
        eurBalance: true,
        gbpBalance: true,
        cadBalance: true,
        audBalance: true,
        phpBalance: true,
        inrBalance: true,
        thbBalance: true,
        cnyBalance: true,
        jpyBalance: true,
        usdcBalance: true,
        usdtBalance: true,
        btcBalance: true,
        ethBalance: true,
        solBalance: true,
        dogeBalance: true,
        primaryCurrency: true,
        lifetimeDeposited: true,
        lifetimeWithdrawn: true,
        lifetimeWagered: true,
        lifetimeWon: true,
        lifetimeBonuses: true,
      },
    });

    let walletData = wallet;
    if (!wallet) {
      // Create wallet if doesn't exist
      walletData = await this.prisma.wallet.create({
        data: { userId },
        select: {
          id: true,
          usdBalance: true,
          eurBalance: true,
          gbpBalance: true,
          cadBalance: true,
          audBalance: true,
          phpBalance: true,
          inrBalance: true,
          thbBalance: true,
          cnyBalance: true,
          jpyBalance: true,
          usdcBalance: true,
          usdtBalance: true,
          btcBalance: true,
          ethBalance: true,
          solBalance: true,
          dogeBalance: true,
          primaryCurrency: true,
          lifetimeDeposited: true,
          lifetimeWithdrawn: true,
          lifetimeWagered: true,
          lifetimeWon: true,
          lifetimeBonuses: true,
        },
      });
    }

    // Transform to frontend-expected format
    // walletData is guaranteed to be non-null here
    return {
      balances: {
        USD: parseFloat(walletData!.usdBalance.toString()),
        EUR: parseFloat(walletData!.eurBalance.toString()),
        GBP: parseFloat(walletData!.gbpBalance.toString()),
        CAD: parseFloat(walletData!.cadBalance.toString()),
        AUD: parseFloat(walletData!.audBalance.toString()),
        PHP: parseFloat(walletData!.phpBalance.toString()),
        INR: parseFloat(walletData!.inrBalance.toString()),
        THB: parseFloat(walletData!.thbBalance.toString()),
        CNY: parseFloat(walletData!.cnyBalance.toString()),
        JPY: parseFloat(walletData!.jpyBalance.toString()),
        USDC: parseFloat(walletData!.usdcBalance.toString()),
        USDT: parseFloat(walletData!.usdtBalance.toString()),
        BTC: parseFloat(walletData!.btcBalance.toString()),
        ETH: parseFloat(walletData!.ethBalance.toString()),
        SOL: parseFloat(walletData!.solBalance.toString()),
        DOGE: parseFloat(walletData!.dogeBalance.toString()),
      },
      primaryCurrency: walletData!.primaryCurrency as Currency,
      lifetimeStats: {
        deposited: parseFloat(walletData!.lifetimeDeposited.toString()),
        withdrawn: parseFloat(walletData!.lifetimeWithdrawn.toString()),
        wagered: parseFloat(walletData!.lifetimeWagered.toString()),
        won: parseFloat(walletData!.lifetimeWon.toString()),
        bonuses: parseFloat(walletData!.lifetimeBonuses.toString()),
      },
    };
  }

  /**
   * Get balance for a specific currency
   */
  async getBalance(userId: string, currency: Currency): Promise<Decimal> {
    const wallet = await this.getWallet(userId);
    const field = CURRENCY_BALANCE_FIELDS[currency];
    return new Decimal((wallet as any)[field] || 0);
  }

  /**
   * Get all balances with USDC equivalents
   */
  async getAllBalances(userId: string) {
    const wallet = await this.getWallet(userId);
    const balances: Record<string, { balance: Decimal; usdcEquivalent: Decimal }> = {};

    for (const currency of Object.keys(CURRENCY_BALANCE_FIELDS) as Currency[]) {
      const field = CURRENCY_BALANCE_FIELDS[currency];
      const balance = new Decimal((wallet.balances as any)[currency] || 0);
      const rate = await this.getExchangeRate(currency);
      balances[currency] = {
        balance,
        usdcEquivalent: balance.times(rate),
      };
    }

    return {
      balances,
      primaryCurrency: wallet.primaryCurrency,
      lifetimeStats: wallet.lifetimeStats,
    };
  }

  async getTransactions(userId: string, query: any) {
    const { skip, take } = getPaginationParams(query);

    const where: any = { userId };

    if (query.type) {
      where.type = query.type;
    }

    if (query.currency) {
      where.currency = query.currency;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return createPaginatedResult(transactions, total, query.page || 1, query.limit || 20);
  }

  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getDepositPackages() {
    return this.prisma.depositPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getPaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCryptoOptions() {
    return this.prisma.cryptoPaymentOption.findMany({
      where: { isActive: true },
    });
  }

  async initiateDeposit(
    userId: string,
    currency: Currency,
    amount: number,
    paymentMethod: string,
    packageId?: string,
  ) {
    const amountDecimal = new Decimal(amount);
    const exchangeRate = await this.getExchangeRate(currency);
    const usdcAmount = amountDecimal.times(exchangeRate);

    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        packageId,
        currency,
        amount: amountDecimal,
        usdcAmount,
        exchangeRate,
        paymentProvider: paymentMethod,
        status: 'pending',
      },
    });

    // In production, integrate with payment provider
    return {
      depositId: deposit.id,
      currency,
      amount: amountDecimal,
      usdcAmount,
      exchangeRate,
    };
  }

  async confirmDeposit(userId: string, depositId: string, paymentIntentId: string, txHash?: string) {
    const deposit = await this.prisma.deposit.findFirst({
      where: { id: depositId, userId, status: 'pending' },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found or already processed');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update deposit status
      await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: 'completed',
          paymentIntentId,
          txHash,
          completedAt: new Date(),
        },
      });

      // Get wallet with optimistic locking
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      const currency = deposit.currency as Currency;
      const balanceField = CURRENCY_BALANCE_FIELDS[currency];
      const currentBalance = new Decimal((wallet as any)[balanceField] || 0);
      const newBalance = currentBalance.plus(deposit.amount);

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'deposit',
          currency: deposit.currency,
          amount: deposit.amount,
          usdcAmount: deposit.usdcAmount,
          exchangeRate: deposit.exchangeRate,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'deposit',
          referenceId: depositId,
          status: 'completed',
          txHash,
        },
      });

      // Process bonus if applicable
      if (deposit.bonusAmount && new Decimal(deposit.bonusAmount).gt(0)) {
        const bonusCurrency = deposit.bonusCurrency || 'USDC';
        const bonusField = CURRENCY_BALANCE_FIELDS[bonusCurrency as Currency];
        const currentBonusBalance = new Decimal((wallet as any)[bonusField] || 0);
        const newBonusBalance = currentBonusBalance.plus(deposit.bonusAmount);

        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'bonus',
            currency: bonusCurrency,
            amount: deposit.bonusAmount,
            usdcAmount: deposit.bonusAmount, // Bonus is already in USDC equivalent
            exchangeRate: new Decimal(1),
            balanceBefore: currentBonusBalance,
            balanceAfter: newBonusBalance,
            referenceType: 'deposit',
            referenceId: depositId,
            status: 'completed',
          },
        });
      }

      // Update wallet balance with optimistic locking
      const updateData: any = {
        version: { increment: 1 },
        lifetimeDeposited: new Decimal(wallet.lifetimeDeposited).plus(deposit.usdcAmount),
        [balanceField]: newBalance,
      };

      if (deposit.bonusAmount && new Decimal(deposit.bonusAmount).gt(0)) {
        const bonusCurrency = deposit.bonusCurrency || 'USDC';
        const bonusField = CURRENCY_BALANCE_FIELDS[bonusCurrency as Currency];
        const currentBonusBalance = new Decimal((wallet as any)[bonusField] || 0);
        updateData[bonusField] = currentBonusBalance.plus(deposit.bonusAmount);
        updateData.lifetimeBonuses = new Decimal(wallet.lifetimeBonuses).plus(deposit.bonusAmount);
      }

      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: updateData,
      });

      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      const updatedWallet = await tx.wallet.findUnique({
        where: { id: wallet.id },
      });

      // Publish balance update event
      await this.redis.publish('wallet:balance_updated', {
        userId,
        currency: deposit.currency,
        balance: newBalance.toString(),
      });

      return {
        success: true,
        deposit: {
          id: depositId,
          currency: deposit.currency,
          amount: deposit.amount,
          usdcAmount: deposit.usdcAmount,
        },
        wallet: updatedWallet,
      };
    });
  }

  async requestWithdrawal(
    userId: string,
    currency: Currency,
    amount: number,
    method: string,
    payoutDetails: any,
    toAddress?: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const amountDecimal = new Decimal(amount);
    const balanceField = CURRENCY_BALANCE_FIELDS[currency];
    const currentBalance = new Decimal((wallet as any)[balanceField] || 0);

    if (amountDecimal.gt(currentBalance)) {
      throw new BadRequestException(`Insufficient ${currency} balance`);
    }

    // Calculate USDC equivalent
    const exchangeRate = await this.getExchangeRate(currency);
    const usdcAmount = amountDecimal.times(exchangeRate);

    // Minimum withdrawal check
    const minWithdrawal = new Decimal(WITHDRAWAL_LIMITS.MIN_USDC);
    if (usdcAmount.lt(minWithdrawal)) {
      throw new BadRequestException(`Minimum withdrawal is ${WITHDRAWAL_LIMITS.MIN_USDC} USDC equivalent`);
    }

    // Calculate fee (example: 1% for fiat, 0.5% for crypto)
    const feePercent = FIAT_CURRENCIES[currency as FiatCurrency] ? 0.01 : 0.005;
    const feeAmount = amountDecimal.times(feePercent);
    const netAmount = amountDecimal.minus(feeAmount);

    return this.prisma.$transaction(async (tx) => {
      // Encrypt payout details for security
      const encryptedPayoutDetails = CryptoUtil.encrypt(JSON.stringify(payoutDetails));

      // Create withdrawal request
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          currency,
          amount: amountDecimal,
          usdcAmount,
          exchangeRate,
          feeAmount,
          feeCurrency: currency,
          netAmount,
          method,
          payoutDetails: { encrypted: encryptedPayoutDetails },
          toAddress,
          status: 'pending',
        },
      });

      // Deduct from wallet immediately (hold)
      const newBalance = currentBalance.minus(amountDecimal);

      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'withdrawal',
          currency,
          amount: amountDecimal.neg(),
          usdcAmount: usdcAmount.neg(),
          exchangeRate,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'withdrawal',
          referenceId: withdrawal.id,
          status: 'pending',
        },
      });

      // Update wallet with optimistic locking
      const updateData: any = {
        version: { increment: 1 },
        [balanceField]: newBalance,
      };

      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: updateData,
      });

      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for withdrawal - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      return {
        withdrawalId: withdrawal.id,
        currency,
        amount: amountDecimal,
        feeAmount,
        netAmount,
        usdcAmount,
        status: 'pending',
      };
    });
  }

  async getWithdrawals(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [withdrawals, total] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.withdrawal.count({ where: { userId } }),
    ]);

    return createPaginatedResult(withdrawals, total, query.page || 1, query.limit || 20);
  }

  async getAvailableBonuses(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [dailyClaim, weeklyClaim, monthlyClaim] = await Promise.all([
      this.prisma.bonusClaim.findFirst({
        where: {
          userId,
          bonusType: 'daily',
          claimedAt: { gte: startOfDay },
        },
      }),
      this.prisma.bonusClaim.findFirst({
        where: {
          userId,
          bonusType: 'weekly',
          claimedAt: { gte: startOfWeek },
        },
      }),
      this.prisma.bonusClaim.findFirst({
        where: {
          userId,
          bonusType: 'monthly',
          claimedAt: { gte: startOfMonth },
        },
      }),
    ]);

    return {
      daily: {
        available: !dailyClaim,
        amountUsdc: DEFAULT_BONUSES.DAILY.USDC,
        currency: 'USDC',
        nextAvailable: dailyClaim ? new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) : null,
      },
      weekly: {
        available: !weeklyClaim,
        amountUsdc: DEFAULT_BONUSES.WEEKLY.USDC,
        currency: 'USDC',
        nextAvailable: weeklyClaim ? new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
      },
      monthly: {
        available: !monthlyClaim,
        amountUsdc: DEFAULT_BONUSES.MONTHLY.USDC,
        currency: 'USDC',
        nextAvailable: monthlyClaim ? new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1) : null,
      },
    };
  }

  async claimBonus(userId: string, bonusType: 'daily' | 'weekly' | 'monthly') {
    const bonuses = await this.getAvailableBonuses(userId);
    const bonus = bonuses[bonusType];

    if (!bonus.available) {
      throw new BadRequestException(`${bonusType} bonus already claimed`);
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const amount = new Decimal(bonus.amountUsdc);
      const currency = bonus.currency as Currency;
      const balanceField = CURRENCY_BALANCE_FIELDS[currency];
      const currentBalance = new Decimal((wallet as any)[balanceField] || 0);
      const newBalance = currentBalance.plus(amount);

      // Create bonus claim record
      await tx.bonusClaim.create({
        data: {
          userId,
          bonusType,
          currency,
          amount,
          usdcAmount: amount, // USDC bonus, so 1:1
          exchangeRate: new Decimal(1),
        },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'bonus',
          currency,
          amount,
          usdcAmount: amount,
          exchangeRate: new Decimal(1),
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'bonus',
          status: 'completed',
          metadata: { bonusType },
        },
      });

      // Update wallet with optimistic locking
      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: {
          [balanceField]: newBalance,
          lifetimeBonuses: new Decimal(wallet.lifetimeBonuses).plus(amount),
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for bonus claim - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      return {
        success: true,
        bonusType,
        currency,
        amount,
        wallet: {
          [currency]: newBalance,
        },
      };
    });
  }

  // Internal method for game transactions
  async processGameTransaction(
    userId: string,
    currency: Currency,
    amount: Decimal,
    type: 'stake' | 'game_win' | 'game_loss',
    referenceId: string,
    metadata?: any,
  ) {
    if (amount.lte(0)) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balanceField = CURRENCY_BALANCE_FIELDS[currency];
    const currentBalance = new Decimal((wallet as any)[balanceField] || 0);

    if (type === 'stake' && amount.gt(currentBalance)) {
      throw new BadRequestException(`Insufficient ${currency} balance`);
    }

    const newBalance = type === 'stake'
      ? currentBalance.minus(amount)
      : currentBalance.plus(amount);

    if (newBalance.lt(0)) {
      throw new BadRequestException('Transaction would result in negative balance');
    }

    // Get exchange rate for USDC tracking
    const exchangeRate = await this.getExchangeRate(currency);
    const usdcAmount = amount.times(exchangeRate);

    return this.prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type,
          currency,
          amount: type === 'stake' ? amount.neg() : amount,
          usdcAmount: type === 'stake' ? usdcAmount.neg() : usdcAmount,
          exchangeRate,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'game_round',
          referenceId,
          status: 'completed',
          metadata,
        },
      });

      const updateData: any = {
        version: { increment: 1 },
        [balanceField]: newBalance,
      };

      if (type === 'stake') {
        updateData.lifetimeWagered = new Decimal(wallet.lifetimeWagered).plus(usdcAmount);
      } else if (type === 'game_win') {
        updateData.lifetimeWon = new Decimal(wallet.lifetimeWon).plus(usdcAmount);
      }

      const updateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: updateData,
      });

      if (updateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for game transaction - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      const updatedWallet = await tx.wallet.findUnique({
        where: { id: wallet.id },
      });

      return updatedWallet;
    });
  }

  /**
   * Set user's primary currency preference
   */
  async setPrimaryCurrency(userId: string, currency: Currency) {
    if (!ALL_CURRENCIES[currency]) {
      throw new BadRequestException(`Invalid currency: ${currency}`);
    }

    await this.prisma.wallet.update({
      where: { userId },
      data: { primaryCurrency: currency },
    });

    return { success: true, primaryCurrency: currency };
  }
}
