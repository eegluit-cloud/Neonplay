import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { GamesService, Currency } from '../games/games.service';
import { HuiduApiUtil } from './utils/huidu-api.util';
import { HuiduCallbackDto } from './dto/huidu-callback.dto';
import { HuiduCallbackPayload } from './interfaces/huidu.interface';
import { Decimal } from '@prisma/client/runtime/library';
import { randomBytes } from 'crypto';

// Balance field mapping (same as games.service.ts)
const BALANCE_FIELDS: Record<string, string> = {
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
export class HuiduService {
  private readonly logger = new Logger(HuiduService.name);
  private readonly callbackUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
    private readonly huiduApi: HuiduApiUtil,
    @Inject(forwardRef(() => GamesService))
    private readonly gamesService: GamesService,
  ) {
    this.callbackUrl = this.configService.get<string>('HUIDU_CALLBACK_URL', '');
  }

  /**
   * Generate a Huidu-compatible member_account from userId.
   * Format: "np" + first 16 chars of UUID (hyphens stripped) = 18 chars total.
   * Stores bidirectional Redis mapping with no TTL.
   */
  async getOrCreateMemberAccount(userId: string): Promise<string> {
    // Check if mapping already exists
    const existing = await this.redis.get<string>(`huidu:user:${userId}`);
    if (existing) return existing;

    // Generate: strip hyphens, take first 16 chars, prepend "np"
    const memberAccount = 'np' + userId.replace(/-/g, '').slice(0, 16).toLowerCase();

    // Store bidirectional mapping (no TTL -- permanent)
    await this.redis.set(`huidu:user:${userId}`, memberAccount);
    await this.redis.set(`huidu:member:${memberAccount}`, userId);

    this.logger.log(`Created Huidu member account: ${memberAccount} for user ${userId}`);
    return memberAccount;
  }

  /**
   * Launch a Huidu game -- calls Huidu API to get a game launch URL.
   * Called from GamesService.launchGame() for Huidu-aggregated games.
   */
  async launchGame(
    userId: string,
    game: any, // Game with provider.aggregator included
    currency: Currency,
    sessionId: string,
  ): Promise<string> {
    const memberAccount = await this.getOrCreateMemberAccount(userId);

    // Get wallet balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    const balanceField = BALANCE_FIELDS[currency] || 'usdcBalance';
    const balance = wallet ? ((wallet as any)[balanceField] as Decimal) : new Decimal(0);

    const launchUrl = await this.huiduApi.getGameUrl({
      timestamp: Date.now().toString(),
      agency_uid: this.huiduApi.getAgencyUid(),
      member_account: memberAccount,
      game_uid: game.externalGameId,
      credit_amount: balance.toFixed(2),
      currency_code: currency,
      language: 'en',
      platform: 1,
      callback_url: this.callbackUrl,
    });

    this.logger.log(
      `Launched Huidu game ${game.slug} for user ${userId}, session ${sessionId}`,
    );

    return launchUrl;
  }

  /**
   * Process a bet/win callback from Huidu.
   * This is the critical path -- called for every single bet and win event.
   *
   * Flow:
   * 1. Verify agency_uid
   * 2. Decrypt payload
   * 3. Idempotency check (Redis)
   * 4. Resolve userId from member_account
   * 5. Find game by externalGameId
   * 6. Find or create GameSession
   * 7. Process via recordGameRound()
   * 8. Return encrypted balance response
   */
  async processCallback(
    dto: HuiduCallbackDto,
  ): Promise<{ code: number; msg: string; payload: string }> {
    // 1. Verify agency_uid
    if (dto.agency_uid !== this.huiduApi.getAgencyUid()) {
      this.logger.warn(`Invalid agency_uid: ${dto.agency_uid}`);
      return { code: 1, msg: 'Invalid agency_uid', payload: '' };
    }

    // 2. Decrypt payload
    let cbPayload: HuiduCallbackPayload;
    try {
      cbPayload = this.huiduApi.decryptCallback(dto.payload);
    } catch (error) {
      this.logger.error('Failed to decrypt Huidu callback payload', error);
      return { code: 1, msg: 'Payload decryption failed', payload: '' };
    }

    const { serial_number, currency_code, game_uid, member_account, game_round } = cbPayload;

    this.logger.debug(
      `Huidu callback: serial=${serial_number} game=${game_uid} member=${member_account} ` +
        `bet=${cbPayload.bet_amount} win=${cbPayload.win_amount} round=${game_round}`,
    );

    // 3. Idempotency check
    const cacheKey = `huidu:cb:${serial_number}`;
    const cached = await this.redis.get<{ code: number; creditAmount: string; timestamp: string }>(
      cacheKey,
    );
    if (cached) {
      this.logger.debug(`Idempotent replay for serial_number: ${serial_number}`);
      return {
        code: 0,
        msg: 'success',
        payload: this.huiduApi.encryptCallbackResponse(
          cached.creditAmount,
          cached.timestamp,
        ),
      };
    }

    // 4. Resolve userId from member_account
    const userId = await this.redis.get<string>(`huidu:member:${member_account}`);
    if (!userId) {
      this.logger.error(`Unknown Huidu member_account: ${member_account}`);
      return { code: 1, msg: 'Unknown player', payload: '' };
    }

    // 5. Find game by externalGameId
    const game = await this.prisma.game.findFirst({
      where: { externalGameId: game_uid },
    });
    if (!game) {
      this.logger.error(`Huidu game not found: externalGameId=${game_uid}`);
      return { code: 1, msg: 'Game not found', payload: '' };
    }

    // 6. Parse amounts
    const betAmount = parseFloat(cbPayload.bet_amount);
    const winAmount = parseFloat(cbPayload.win_amount);

    // 7. Find or create GameSession
    const currency = currency_code as Currency;
    let session = await this.prisma.gameSession.findFirst({
      where: {
        userId,
        gameId: game.id,
        currency: currency_code,
        endedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!session) {
      const sessionToken = randomBytes(32).toString('hex');
      session = await this.prisma.gameSession.create({
        data: {
          userId,
          gameId: game.id,
          currency: currency_code,
          sessionToken,
          totalBetUsdc: new Decimal(0),
          totalWinUsdc: new Decimal(0),
        },
      });
      this.logger.log(`Created new Huidu session ${session.id} for user ${userId} game ${game.slug}`);
    }

    // 8. Process via recordGameRound
    // Handle negative amounts (refunds):
    // - Negative bet_amount = bet refund (credit back to player)
    // - Negative win_amount = win reversal (deduct from player)
    let effectiveBet: number;
    let effectiveWin: number;

    if (betAmount < 0 && winAmount < 0) {
      // Both negative: net refund
      effectiveBet = 0;
      effectiveWin = Math.abs(betAmount) + Math.abs(winAmount);
    } else if (betAmount < 0) {
      // Bet refund: credit the refunded bet as a win
      effectiveBet = 0;
      effectiveWin = Math.abs(betAmount) + Math.max(0, winAmount);
    } else if (winAmount < 0) {
      // Win reversal: deduct the reversed win as a bet
      effectiveBet = betAmount + Math.abs(winAmount);
      effectiveWin = 0;
    } else {
      // Normal bet/win
      effectiveBet = betAmount;
      effectiveWin = winAmount;
    }

    try {
      await this.gamesService.recordGameRound({
        sessionId: session.id,
        betAmount: effectiveBet,
        winAmount: effectiveWin,
        providerRoundId: serial_number,
        resultData: {
          game_round,
          data: cbPayload.data,
          original_bet: cbPayload.bet_amount,
          original_win: cbPayload.win_amount,
        },
      });
    } catch (error: any) {
      // If insufficient balance, return code=0 with current balance
      // Huidu sees balance < bet and knows bet failed
      if (error?.message?.includes('Insufficient')) {
        this.logger.warn(
          `Insufficient balance for Huidu callback: user=${userId} bet=${betAmount} serial=${serial_number}`,
        );
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        const balField = BALANCE_FIELDS[currency] || 'usdcBalance';
        const currentBalance = wallet ? ((wallet as any)[balField] as Decimal).toFixed(2) : '0.00';
        const ts = Date.now().toString();

        await this.redis.set(cacheKey, { code: 0, creditAmount: currentBalance, timestamp: ts }, 86400);

        return {
          code: 0,
          msg: 'success',
          payload: this.huiduApi.encryptCallbackResponse(currentBalance, ts),
        };
      }

      // Other errors -> code=1 so Huidu retries
      this.logger.error(`Huidu callback processing error: ${error?.message}`, error?.stack);
      return { code: 1, msg: error?.message || 'Processing error', payload: '' };
    }

    // 9. Get updated balance
    const updatedWallet = await this.prisma.wallet.findUnique({ where: { userId } });
    const balanceField = BALANCE_FIELDS[currency] || 'usdcBalance';
    const newBalance = updatedWallet
      ? ((updatedWallet as any)[balanceField] as Decimal).toFixed(2)
      : '0.00';
    const ts = Date.now().toString();

    // 10. Cache for idempotency (24h TTL)
    await this.redis.set(cacheKey, { code: 0, creditAmount: newBalance, timestamp: ts }, 86400);

    // 11. Return encrypted response
    return {
      code: 0,
      msg: 'success',
      payload: this.huiduApi.encryptCallbackResponse(newBalance, ts),
    };
  }
}
