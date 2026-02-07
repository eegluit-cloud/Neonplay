import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SettlementProcessor {
  private readonly logger = new Logger(SettlementProcessor.name);
  private readonly SETTLEMENT_QUEUE = 'settlement:queue';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Process bet settlements every 30 seconds
   */
  @Cron('*/30 * * * * *')
  async processSettlements() {
    try {
      // Get matches that have finished but have unsettled bets
      const finishedMatches = await this.prisma.match.findMany({
        where: {
          status: 'finished',
          result: { not: null },
          betSelections: {
            some: {
              status: 'pending',
            },
          },
        },
        include: {
          markets: {
            include: {
              odds: true,
            },
          },
        },
        take: 10,
      });

      if (finishedMatches.length === 0) return;

      this.logger.log(`Processing settlements for ${finishedMatches.length} matches`);

      for (const match of finishedMatches) {
        await this.settleMatch(match);
      }
    } catch (error: any) {
      this.logger.error('Error processing settlements:', error);
    }
  }

  /**
   * Settle all bets for a match
   */
  private async settleMatch(match: any) {
    this.logger.log(`Settling match: ${match.id}`);

    try {
      // Get all pending selections for this match
      const pendingSelections = await this.prisma.betSelection.findMany({
        where: {
          matchId: match.id,
          status: 'pending',
        },
        include: {
          bet: {
            include: {
              user: true,
              selections: true,
            },
          },
        },
      });

      for (const selection of pendingSelections) {
        // Get the market for evaluation
        const market = await this.prisma.market.findUnique({
          where: { id: selection.marketId },
        });

        // Determine if selection won or lost
        const isWinner = this.evaluateSelection({ ...selection, market }, match);

        // Update selection status
        await this.prisma.betSelection.update({
          where: { id: selection.id },
          data: {
            status: isWinner ? 'won' : 'lost',
            settledAt: new Date(),
          },
        });

        // Check if we need to settle the parent bet
        await this.checkAndSettleBet(selection.bet);
      }

      this.logger.log(`Settled ${pendingSelections.length} selections for match ${match.id}`);
    } catch (error: any) {
      this.logger.error(`Error settling match ${match.id}:`, error);
    }
  }

  /**
   * Evaluate if a selection won
   */
  private evaluateSelection(selection: any, match: any): boolean {
    const market = selection.market;
    const result = match.result as any;

    if (!result) return false;

    switch (market.type) {
      case 'match_winner':
      case '1x2':
        return this.evaluateMatchWinner(selection.selection, result, match);
      case 'over_under':
        return this.evaluateOverUnder(selection.selection, market.line, result);
      case 'handicap':
        return this.evaluateHandicap(selection.selection, market.line, result, match);
      case 'both_teams_score':
        return this.evaluateBothTeamsScore(selection.selection, match);
      case 'correct_score':
        return this.evaluateCorrectScore(selection.selection, match);
      default:
        this.logger.warn(`Unknown market type: ${market.type}`);
        return false;
    }
  }

  private evaluateMatchWinner(selection: string, result: any, match: any): boolean {
    const homeWin = match.homeScore > match.awayScore;
    const awayWin = match.awayScore > match.homeScore;
    const draw = match.homeScore === match.awayScore;

    switch (selection.toLowerCase()) {
      case 'home':
      case '1':
        return homeWin;
      case 'away':
      case '2':
        return awayWin;
      case 'draw':
      case 'x':
        return draw;
      default:
        return false;
    }
  }

  private evaluateOverUnder(selection: string, line: number, result: any): boolean {
    const totalGoals = (result.homeScore || 0) + (result.awayScore || 0);

    if (selection.toLowerCase().includes('over')) {
      return totalGoals > line;
    } else if (selection.toLowerCase().includes('under')) {
      return totalGoals < line;
    }
    return false;
  }

  private evaluateHandicap(selection: string, line: number, result: any, match: any): boolean {
    const adjustedHome = match.homeScore + (selection.toLowerCase() === 'home' ? line : 0);
    const adjustedAway = match.awayScore + (selection.toLowerCase() === 'away' ? line : 0);

    if (selection.toLowerCase() === 'home') {
      return adjustedHome > match.awayScore;
    } else {
      return adjustedAway > match.homeScore;
    }
  }

  private evaluateBothTeamsScore(selection: string, match: any): boolean {
    const bothScored = match.homeScore > 0 && match.awayScore > 0;

    if (selection.toLowerCase() === 'yes') {
      return bothScored;
    }
    return !bothScored;
  }

  private evaluateCorrectScore(selection: string, match: any): boolean {
    const [home, away] = selection.split('-').map(Number);
    return match.homeScore === home && match.awayScore === away;
  }

  /**
   * Check if a bet should be settled and settle it
   */
  private async checkAndSettleBet(bet: any) {
    // Refresh bet data
    const freshBet = await this.prisma.bet.findUnique({
      where: { id: bet.id },
      include: {
        selections: true,
        user: true,
      },
    });

    if (!freshBet || freshBet.status !== 'pending') return;

    // Check if all selections are settled
    const allSettled = freshBet.selections.every((s) => s.status !== 'pending');
    if (!allSettled) return;

    // Check if bet won or lost
    const allWon = freshBet.selections.every((s) => s.status === 'won');
    const anyLost = freshBet.selections.some((s) => s.status === 'lost');

    let betStatus: string;
    let actualWin = new Decimal(0);

    if (anyLost) {
      betStatus = 'lost';
    } else if (allWon) {
      betStatus = 'won';
      actualWin = new Decimal(freshBet.potentialWin);
    } else {
      // Partial void - some selections voided
      betStatus = 'partial_void';
      // Recalculate winnings with voided selections removed
      const validSelections = freshBet.selections.filter((s) => s.status === 'won');
      if (validSelections.length > 0) {
        let combinedOdds = new Decimal(1);
        for (const sel of validSelections) {
          combinedOdds = combinedOdds.mul(sel.oddsAtPlacement);
        }
        actualWin = new Decimal(freshBet.stake).mul(combinedOdds);
      }
    }

    // Update bet
    await this.prisma.bet.update({
      where: { id: freshBet.id },
      data: {
        status: betStatus,
        actualWin,
        settledAt: new Date(),
      },
    });

    // If won, credit winnings to wallet
    if (betStatus === 'won' || (betStatus === 'partial_void' && actualWin.gt(0))) {
      await this.creditWinnings(freshBet.userId, freshBet.currency, actualWin, freshBet.id);
    }

    // Send notification
    await this.sendSettlementNotification(freshBet, betStatus, actualWin);

    this.logger.log(`Settled bet ${freshBet.id}: ${betStatus}, win: ${actualWin}`);
  }

  /**
   * Credit winnings to user wallet
   */
  private async creditWinnings(
    userId: string,
    currency: string,
    amount: Decimal,
    betId: string,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      this.logger.error(`Wallet not found for user ${userId}`);
      return;
    }

    // Get the balance field based on currency
    const balanceFieldMap: Record<string, keyof typeof wallet> = {
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

    const balanceField = balanceFieldMap[currency] || 'usdcBalance';
    const currentBalance = new Decimal(wallet[balanceField] as any);
    const newBalance = currentBalance.plus(amount);

    // For now, use 1:1 exchange rate for USDC and approximate for others
    const exchangeRate = currency === 'USDC' ? new Decimal(1) : new Decimal(1);
    const usdcAmount = amount.mul(exchangeRate);

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId },
        data: {
          [balanceField]: newBalance,
          lifetimeWon: { increment: usdcAmount },
          version: { increment: 1 },
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'bet_win',
          currency,
          amount,
          usdcAmount,
          exchangeRate,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'bet',
          referenceId: betId,
          status: 'completed',
        },
      }),
    ]);

    // Publish balance update
    await this.redis.publish('wallet:balance_updated', {
      userId,
      currency,
      balance: newBalance.toString(),
    });
  }

  /**
   * Send settlement notification
   */
  private async sendSettlementNotification(bet: any, status: string, amount: Decimal) {
    let title: string;
    let message: string;

    if (status === 'won') {
      title = 'Bet Won! 🎉';
      message = `Your ${bet.type} bet won ${amount} ${bet.currency}!`;
    } else if (status === 'lost') {
      title = 'Bet Settled';
      message = `Your ${bet.type} bet has been settled. Better luck next time!`;
    } else {
      title = 'Bet Partially Settled';
      message = `Your bet has been partially settled. You won ${amount} ${bet.currency}.`;
    }

    await this.prisma.notification.create({
      data: {
        userId: bet.userId,
        type: 'bet',
        title,
        message,
        actionUrl: `/sports/bets/${bet.id}`,
      },
    });

    await this.redis.publish('notification:new', {
      userId: bet.userId,
      type: 'bet',
      title,
    });
  }

  /**
   * Force settle a specific match (admin triggered)
   */
  async forceSettleMatch(matchId: string, result: any): Promise<{ settled: number }> {
    // Update match result
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'finished',
        result,
        endedAt: new Date(),
      },
    });

    // Get match with markets
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        markets: {
          include: { odds: true },
        },
      },
    });

    if (!match) return { settled: 0 };

    await this.settleMatch(match);

    const settledCount = await this.prisma.betSelection.count({
      where: {
        matchId,
        status: { in: ['won', 'lost'] },
      },
    });

    return { settled: settledCount };
  }

  /**
   * Void all bets for a cancelled match
   */
  async voidMatchBets(matchId: string): Promise<{ voided: number }> {
    const selections = await this.prisma.betSelection.findMany({
      where: {
        matchId,
        status: 'pending',
      },
      include: {
        bet: true,
      },
    });

    for (const selection of selections) {
      // Void the selection
      await this.prisma.betSelection.update({
        where: { id: selection.id },
        data: {
          status: 'void',
          settledAt: new Date(),
        },
      });

      // Refund stake for single bets
      if (selection.bet.type === 'single') {
        await this.refundStake(selection.bet);
      } else {
        // For combo bets, check if all selections are now voided
        await this.checkAndSettleBet(selection.bet);
      }
    }

    // Update match status
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'cancelled',
        endedAt: new Date(),
      },
    });

    return { voided: selections.length };
  }

  /**
   * Refund stake for voided bet
   */
  private async refundStake(bet: any) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: bet.userId },
    });

    if (!wallet) return;

    // Get the balance field based on currency
    const balanceFieldMap: Record<string, keyof typeof wallet> = {
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

    const balanceField = balanceFieldMap[bet.currency] || 'usdcBalance';
    const currentBalance = new Decimal(wallet[balanceField] as any);
    const newBalance = currentBalance.plus(bet.stake);

    // Use the exchange rate from the original bet or default to 1:1
    const exchangeRate = bet.exchangeRate ? new Decimal(bet.exchangeRate) : new Decimal(1);
    const usdcAmount = new Decimal(bet.stake).mul(exchangeRate);

    await this.prisma.$transaction([
      this.prisma.bet.update({
        where: { id: bet.id },
        data: {
          status: 'void',
          settledAt: new Date(),
        },
      }),
      this.prisma.wallet.update({
        where: { userId: bet.userId },
        data: {
          [balanceField]: newBalance,
          version: { increment: 1 },
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId: bet.userId,
          walletId: wallet.id,
          type: 'refund',
          currency: bet.currency,
          amount: bet.stake,
          usdcAmount,
          exchangeRate,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'bet',
          referenceId: bet.id,
          status: 'completed',
          metadata: { reason: 'Bet voided - stake refunded' },
        },
      }),
    ]);

    // Notify user
    await this.prisma.notification.create({
      data: {
        userId: bet.userId,
        type: 'bet',
        title: 'Bet Voided',
        message: `Your bet has been voided and ${bet.stake} ${bet.currency} has been refunded.`,
        actionUrl: `/sports/bets/${bet.id}`,
      },
    });
  }
}
