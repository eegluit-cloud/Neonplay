import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

export interface JackpotContributionResult {
  contributions: Array<{
    jackpotId: string;
    jackpotType: string;
    amount: string;
    newTotal: string;
  }>;
  totalContributed: string;
}

export interface JackpotWinResult {
  won: boolean;
  jackpot?: {
    id: string;
    type: string;
    name: string;
    amount: string;
  };
}

export interface RecentWinsQueryDto extends PaginationDto {
  jackpotId?: string;
  gameId?: string;
}

@Injectable()
export class JackpotService {
  private readonly logger = new Logger(JackpotService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all active jackpots with their current values
   */
  async getJackpots() {
    const jackpots = await this.prisma.jackpot.findMany({
      where: { isActive: true },
      orderBy: { type: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        currentAmountUsdc: true,
        seedAmountUsdc: true,
        contributionPercent: true,
        triggerMinUsdc: true,
        triggerMaxUsdc: true,
        lastWonAt: true,
        lastWonBy: true,
        lastWonAmountUsdc: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return jackpots.map((jackpot) => ({
      id: jackpot.id,
      name: jackpot.name,
      type: jackpot.type,
      currentAmount: jackpot.currentAmountUsdc.toString(),
      seedAmount: jackpot.seedAmountUsdc.toString(),
      contributionPercent: jackpot.contributionPercent.toString(),
      triggerMin: jackpot.triggerMinUsdc.toString(),
      triggerMax: jackpot.triggerMaxUsdc.toString(),
      lastWonAt: jackpot.lastWonAt,
      lastWonBy: jackpot.lastWonBy,
      lastWonAmount: jackpot.lastWonAmountUsdc?.toString() || null,
      formattedValue: this.formatJackpotValue(jackpot.currentAmountUsdc),
      isAtMax: jackpot.currentAmountUsdc.gte(jackpot.triggerMaxUsdc),
      updatedAt: jackpot.updatedAt,
    }));
  }

  /**
   * Get recent jackpot wins with pagination and filtering
   */
  async getRecentWins(query: RecentWinsQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};

    if (query.jackpotId) {
      where.jackpotId = query.jackpotId;
    }

    if (query.gameId) {
      where.gameId = query.gameId;
    }

    const [wins, total] = await Promise.all([
      this.prisma.jackpotWin.findMany({
        where,
        orderBy: { wonAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          amount: true,
          wonAt: true,
          jackpot: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnailUrl: true,
            },
          },
        },
      }),
      this.prisma.jackpotWin.count({ where }),
    ]);

    const items = wins.map((win) => ({
      id: win.id,
      amount: win.amount.toString(),
      formattedAmount: this.formatJackpotValue(win.amount),
      wonAt: win.wonAt,
      jackpot: win.jackpot,
      user: {
        id: win.user.id,
        username: this.maskUsername(win.user.username),
        avatarUrl: win.user.avatarUrl,
      },
      game: win.game,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get a specific jackpot by ID
   */
  async getJackpotById(id: string) {
    const jackpot = await this.prisma.jackpot.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        currentAmountUsdc: true,
        seedAmountUsdc: true,
        contributionPercent: true,
        triggerMinUsdc: true,
        triggerMaxUsdc: true,
        lastWonAt: true,
        lastWonBy: true,
        lastWonAmountUsdc: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (!jackpot) {
      throw new NotFoundException('Jackpot not found');
    }

    return {
      id: jackpot.id,
      name: jackpot.name,
      type: jackpot.type,
      currentAmount: jackpot.currentAmountUsdc.toString(),
      seedAmount: jackpot.seedAmountUsdc.toString(),
      contributionPercent: jackpot.contributionPercent.toString(),
      triggerMin: jackpot.triggerMinUsdc.toString(),
      triggerMax: jackpot.triggerMaxUsdc.toString(),
      lastWonAt: jackpot.lastWonAt,
      lastWonBy: jackpot.lastWonBy,
      lastWonAmount: jackpot.lastWonAmountUsdc?.toString() || null,
      formattedValue: this.formatJackpotValue(jackpot.currentAmountUsdc),
      isAtMax: jackpot.currentAmountUsdc.gte(jackpot.triggerMaxUsdc),
      updatedAt: jackpot.updatedAt,
    };
  }

  /**
   * Get a specific jackpot by type (mini, minor, major, grand)
   */
  async getJackpotByType(type: string) {
    const jackpot = await this.prisma.jackpot.findFirst({
      where: { type, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        currentAmountUsdc: true,
        seedAmountUsdc: true,
        contributionPercent: true,
        triggerMinUsdc: true,
        triggerMaxUsdc: true,
        lastWonAt: true,
        lastWonBy: true,
        lastWonAmountUsdc: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (!jackpot) {
      throw new NotFoundException('Jackpot not found');
    }

    return {
      id: jackpot.id,
      name: jackpot.name,
      type: jackpot.type,
      currentAmount: jackpot.currentAmountUsdc.toString(),
      seedAmount: jackpot.seedAmountUsdc.toString(),
      contributionPercent: jackpot.contributionPercent.toString(),
      triggerMin: jackpot.triggerMinUsdc.toString(),
      triggerMax: jackpot.triggerMaxUsdc.toString(),
      lastWonAt: jackpot.lastWonAt,
      lastWonBy: jackpot.lastWonBy,
      lastWonAmount: jackpot.lastWonAmountUsdc?.toString() || null,
      formattedValue: this.formatJackpotValue(jackpot.currentAmountUsdc),
      isAtMax: jackpot.currentAmountUsdc.gte(jackpot.triggerMaxUsdc),
      updatedAt: jackpot.updatedAt,
    };
  }

  /**
   * Format jackpot value
   */
  private formatJackpotValue(value: any): string {
    const numValue = typeof value === 'object' ? Number(value) : value;
    return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Mask username for privacy (show first 2 and last 2 characters)
   */
  private maskUsername(username: string): string {
    if (!username || username.length <= 4) {
      return username ? username[0] + '***' : 'Anonymous';
    }

    return username.slice(0, 2) + '***' + username.slice(-2);
  }

  // ============================================================================
  // JACKPOT CONTRIBUTION SYSTEM
  // ============================================================================

  /**
   * Contribute to all active jackpots based on bet amount (in USDC)
   * Called when a player places a bet (game round or sports bet)
   * Each jackpot has a contributionPercent that determines how much of the bet goes to it
   */
  async contributeToJackpots(
    betAmountUsdc: number | string | Decimal,
  ): Promise<JackpotContributionResult> {
    const bet = new Decimal(betAmountUsdc);
    const activeJackpots = await this.prisma.jackpot.findMany({
      where: { isActive: true },
    });

    const contributions: JackpotContributionResult['contributions'] = [];
    let totalContributed = new Decimal(0);

    for (const jackpot of activeJackpots) {
      // Calculate contribution: bet * contributionPercent / 100
      const contribution = bet.mul(jackpot.contributionPercent).div(100);

      if (contribution.gt(0)) {
        // Cap the jackpot at triggerMax
        const newAmount = Decimal.min(
          jackpot.currentAmountUsdc.add(contribution),
          jackpot.triggerMaxUsdc,
        );

        await this.prisma.jackpot.update({
          where: { id: jackpot.id },
          data: { currentAmountUsdc: newAmount },
        });

        contributions.push({
          jackpotId: jackpot.id,
          jackpotType: jackpot.type,
          amount: contribution.toFixed(4),
          newTotal: newAmount.toFixed(4),
        });

        totalContributed = totalContributed.add(contribution);
      }
    }

    this.logger.debug(
      `Jackpot contributions from ${bet.toFixed(4)} USDC bet: ${totalContributed.toFixed(4)} USDC total`,
    );

    return {
      contributions,
      totalContributed: totalContributed.toFixed(4),
    };
  }

  // ============================================================================
  // JACKPOT TRIGGER SYSTEM
  // ============================================================================

  /**
   * Check if a jackpot should be triggered for this game round
   * Uses a weighted random selection based on jackpot type and current amount
   * Called after each game round completes
   */
  async checkAndTriggerWin(
    userId: string,
    gameId: string,
    gameSessionId: string,
    betAmountUsdc: number | string | Decimal,
  ): Promise<JackpotWinResult> {
    const bet = new Decimal(betAmountUsdc);

    // Minimum bet threshold to be eligible for jackpot (0.10 USDC)
    const minBetForJackpot = new Decimal('0.10');
    if (bet.lt(minBetForJackpot)) {
      return { won: false };
    }

    const activeJackpots = await this.prisma.jackpot.findMany({
      where: {
        isActive: true,
      },
    });

    // Filter jackpots that have reached their minimum trigger threshold
    const eligibleJackpots = activeJackpots.filter((j) =>
      j.currentAmountUsdc.gte(j.triggerMinUsdc),
    );

    if (eligibleJackpots.length === 0) {
      return { won: false };
    }

    // Check each jackpot for a win (from smallest to largest)
    // Jackpot types in order: mini, minor, major, grand
    const jackpotOrder = ['mini', 'minor', 'major', 'grand'];
    const sortedJackpots = eligibleJackpots.sort(
      (a, b) => jackpotOrder.indexOf(a.type) - jackpotOrder.indexOf(b.type),
    );

    for (const jackpot of sortedJackpots) {
      const won = this.calculateJackpotWin(jackpot, bet);

      if (won) {
        const winAmount = jackpot.currentAmountUsdc;

        // Record the win and reset jackpot
        await this.recordJackpotWin(
          userId,
          jackpot.id,
          gameId,
          gameSessionId,
          winAmount,
        );

        this.logger.log(
          `JACKPOT WIN! User ${userId} won ${jackpot.type} jackpot: ${winAmount.toFixed(4)} USDC`,
        );

        return {
          won: true,
          jackpot: {
            id: jackpot.id,
            type: jackpot.type,
            name: jackpot.name,
            amount: winAmount.toFixed(4),
          },
        };
      }
    }

    return { won: false };
  }

  /**
   * Calculate if a jackpot is won based on odds
   * Odds are based on jackpot type and how close it is to triggerMax
   *
   * Base odds per jackpot type (1 in X):
   * - Mini: 1 in 5,000
   * - Minor: 1 in 25,000
   * - Major: 1 in 100,000
   * - Grand: 1 in 500,000
   *
   * Odds increase as jackpot approaches triggerMax (must trigger)
   */
  private calculateJackpotWin(
    jackpot: {
      type: string;
      currentAmountUsdc: Decimal;
      triggerMinUsdc: Decimal;
      triggerMaxUsdc: Decimal;
    },
    betAmountUsdc: Decimal,
  ): boolean {
    // Base odds (1 in X)
    const baseOdds: Record<string, number> = {
      mini: 5000,
      minor: 25000,
      major: 100000,
      grand: 500000,
    };

    const base = baseOdds[jackpot.type] || 50000;

    // Calculate progress towards triggerMax (0 to 1)
    const range = jackpot.triggerMaxUsdc.sub(jackpot.triggerMinUsdc);
    const progress = jackpot.currentAmountUsdc.sub(jackpot.triggerMinUsdc).div(range);
    const progressNum = Math.min(1, Math.max(0, progress.toNumber()));

    // Increase odds as jackpot approaches max
    // At triggerMin: base odds
    // At triggerMax: guaranteed win (odds = 1)
    // Uses exponential curve for smoother progression
    const oddsMultiplier = Math.pow(1 - progressNum, 3);
    const effectiveOdds = Math.max(1, Math.floor(base * oddsMultiplier));

    // Higher bets have slightly better odds (up to 2x bonus)
    const betBonus = Math.min(2, 1 + betAmountUsdc.toNumber() / 10);
    const finalOdds = Math.floor(effectiveOdds / betBonus);

    // Random check
    const roll = Math.floor(Math.random() * finalOdds) + 1;
    return roll === 1;
  }

  /**
   * Record a jackpot win and reset the jackpot
   */
  private async recordJackpotWin(
    userId: string,
    jackpotId: string,
    gameId: string,
    gameRoundId: string,
    amountUsdc: Decimal,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Get user info for the win record
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { username: true, avatarUrl: true },
      });

      // Get the jackpot to reset it
      const jackpot = await tx.jackpot.findUnique({
        where: { id: jackpotId },
      });

      if (!jackpot) {
        throw new NotFoundException('Jackpot not found');
      }

      // Create jackpot win record
      await tx.jackpotWin.create({
        data: {
          jackpotId,
          userId,
          gameId,
          gameRoundId,
          currency: 'USDC',
          amount: amountUsdc,
          amountUsdc,
          exchangeRate: 1,
          jackpotType: jackpot.type,
        },
      });

      // Reset jackpot to seed amount and record last win
      await tx.jackpot.update({
        where: { id: jackpotId },
        data: {
          currentAmountUsdc: jackpot.seedAmountUsdc,
          lastWonAt: new Date(),
          lastWonBy: user?.username || 'Anonymous',
          lastWonAmountUsdc: amountUsdc,
        },
      });

      // Credit the user's wallet
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (wallet) {
        const newBalance = wallet.usdcBalance.add(amountUsdc);

        await tx.wallet.update({
          where: { userId },
          data: {
            usdcBalance: newBalance,
            lifetimeWon: wallet.lifetimeWon.add(amountUsdc),
            version: { increment: 1 },
          },
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'jackpot_win',
            currency: 'USDC',
            amount: amountUsdc,
            usdcAmount: amountUsdc,
            exchangeRate: 1,
            balanceBefore: wallet.usdcBalance,
            balanceAfter: newBalance,
            referenceType: 'jackpot_win',
            referenceId: jackpotId,
            status: 'completed',
            metadata: {
              jackpotType: jackpot.type,
              jackpotName: jackpot.name,
              gameId,
              gameRoundId,
            },
          },
        });
      }

      // Create notification for the winner
      await tx.notification.create({
        data: {
          userId,
          type: 'jackpot',
          title: `${jackpot.name} Jackpot Won!`,
          message: `Congratulations! You've won the ${jackpot.name} jackpot worth ${this.formatJackpotValue(amountUsdc)}!`,
          data: {
            jackpotId,
            jackpotType: jackpot.type,
            amount: amountUsdc.toString(),
          },
        },
      });

      // Create social proof event
      await tx.socialProofEvent.create({
        data: {
          userId,
          displayName: user?.username ? this.maskUsername(user.username) : 'Player',
          avatarUrl: user?.avatarUrl,
          eventType: 'jackpot_win',
          actionText: `won the ${jackpot.name} jackpot!`,
          currency: 'USDC',
          amount: amountUsdc,
          amountUsdc,
        },
      });
    });
  }

  /**
   * Get jackpot contribution rates for display
   */
  async getContributionRates() {
    const jackpots = await this.prisma.jackpot.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        contributionPercent: true,
      },
      orderBy: { type: 'asc' },
    });

    return jackpots.map((j) => ({
      id: j.id,
      name: j.name,
      type: j.type,
      contributionPercent: j.contributionPercent.toString(),
    }));
  }

  /**
   * Admin: Manually seed/reset a jackpot
   */
  async resetJackpot(jackpotId: string, newSeedAmount?: number): Promise<void> {
    const jackpot = await this.prisma.jackpot.findUnique({
      where: { id: jackpotId },
    });

    if (!jackpot) {
      throw new NotFoundException('Jackpot not found');
    }

    const seedAmount = newSeedAmount
      ? new Decimal(newSeedAmount)
      : jackpot.seedAmountUsdc;

    await this.prisma.jackpot.update({
      where: { id: jackpotId },
      data: {
        currentAmountUsdc: seedAmount,
        seedAmountUsdc: seedAmount,
      },
    });

    this.logger.log(
      `Jackpot ${jackpot.name} reset to ${seedAmount.toFixed(4)} USDC`,
    );
  }
}
