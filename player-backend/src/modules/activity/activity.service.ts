import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

export interface ActivityQueryDto extends PaginationDto {
  gameId?: string;
  currency?: 'GC' | 'SC';
  minAmount?: number;
  userId?: string;
}

export interface WinActivityDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  gameName: string;
  gameSlug: string;
  gameThumbnail: string | null;
  amount: number;
  currency: string;
  multiplier: number | null;
  createdAt: Date;
}

export interface BetActivityDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  gameName: string;
  gameSlug: string;
  gameThumbnail: string | null;
  betAmount: number;
  currency: string;
  createdAt: Date;
}

export interface HighRollerDto {
  id: string;
  username: string;
  avatarUrl: string | null;
  gameName: string;
  gameSlug: string;
  betAmount: number;
  currency: string;
  createdAt: Date;
}

export interface MonthlyLeaderDto {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  totalWagered: number;
  totalWins: number;
  currency: string;
}

export interface SocialProofEventDto {
  type: 'win' | 'bet' | 'jackpot' | 'big_win';
  username: string;
  avatarUrl: string | null;
  gameName: string;
  amount: number;
  currency: string;
  multiplier?: number;
  timestamp: Date;
}

export interface SocialProofConfigDto {
  enabled: boolean;
  minWinAmount: number;
  minBetAmount: number;
  displayDurationMs: number;
  maxEventsPerMinute: number;
}

export interface RecordWinDto {
  gameId: string;
  amount: number;
  currency: 'GC' | 'SC';
  multiplier?: number;
  roundId?: string;
}

export interface RecordBetDto {
  gameId: string;
  betAmount: number;
  currency: 'GC' | 'SC';
  roundId?: string;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  // Cache keys and TTLs
  private readonly CACHE_PREFIX = 'activity';
  private readonly RECENT_WINS_KEY = `${this.CACHE_PREFIX}:recent_wins`;
  private readonly LIVE_BETS_KEY = `${this.CACHE_PREFIX}:live_bets`;
  private readonly HIGH_ROLLERS_KEY = `${this.CACHE_PREFIX}:high_rollers`;
  private readonly MONTHLY_LEADERS_KEY = `${this.CACHE_PREFIX}:monthly_leaders`;
  private readonly SOCIAL_PROOF_KEY = `${this.CACHE_PREFIX}:social_proof`;
  private readonly SOCIAL_PROOF_CONFIG_KEY = `${this.CACHE_PREFIX}:social_proof_config`;
  private readonly SHORT_CACHE_TTL = 30; // 30 seconds
  private readonly MEDIUM_CACHE_TTL = 60; // 1 minute
  private readonly LONG_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get recent wins with optional filtering (from GameRound where winAmount > 0)
   */
  async getRecentWins(query: ActivityQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {
      winAmount: { gt: 0 },
    };

    if (query.gameId) {
      where.gameId = query.gameId;
    }

    if (query.currency) {
      where.currency = query.currency;
    }

    if (query.minAmount) {
      where.winAmount = { gte: query.minAmount };
    }

    // Check user privacy settings
    const publicUsers = await this.prisma.userPrivacySetting.findMany({
      where: { showInRecentWins: true },
      select: { userId: true },
    });
    const publicUserIds = publicUsers.map((u) => u.userId);

    // Only show wins from users who allow it
    where.userId = { in: publicUserIds };

    const [rounds, total] = await Promise.all([
      this.prisma.gameRound.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          winAmount: true,
          currency: true,
          multiplier: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
          game: {
            select: {
              name: true,
              slug: true,
              thumbnailUrl: true,
            },
          },
        },
      }),
      this.prisma.gameRound.count({ where }),
    ]);

    const items: WinActivityDto[] = rounds.map((round: any) => ({
      id: round.id,
      username: round.user.username,
      avatarUrl: round.user.avatarUrl,
      gameName: round.game.name,
      gameSlug: round.game.slug,
      gameThumbnail: round.game.thumbnailUrl,
      amount: Number(round.winAmount),
      currency: round.currency,
      multiplier: round.multiplier ? Number(round.multiplier) : null,
      createdAt: round.createdAt,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get live bets feed (from GameRound)
   */
  async getLiveBets(query: ActivityQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};

    if (query.gameId) {
      where.gameId = query.gameId;
    }

    if (query.currency) {
      where.currency = query.currency;
    }

    const [rounds, total] = await Promise.all([
      this.prisma.gameRound.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          betAmount: true,
          currency: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
          game: {
            select: {
              name: true,
              slug: true,
              thumbnailUrl: true,
            },
          },
        },
      }),
      this.prisma.gameRound.count({ where }),
    ]);

    const items: BetActivityDto[] = rounds.map((round: any) => ({
      id: round.id,
      username: round.user.username,
      avatarUrl: round.user.avatarUrl,
      gameName: round.game.name,
      gameSlug: round.game.slug,
      gameThumbnail: round.game.thumbnailUrl,
      betAmount: Number(round.betAmount),
      currency: round.currency,
      createdAt: round.createdAt,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get high rollers (large bets)
   */
  async getHighRollers(query: ActivityQueryDto) {
    const { skip, take } = getPaginationParams(query);

    // Get high roller threshold from config or use default
    const minBetAmount = query.minAmount || 1000;

    const where: any = {
      betAmount: { gte: minBetAmount },
    };

    if (query.currency) {
      where.currency = query.currency;
    }

    const [rounds, total] = await Promise.all([
      this.prisma.gameRound.findMany({
        where,
        orderBy: [{ betAmount: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          betAmount: true,
          currency: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              avatarUrl: true,
            },
          },
          game: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.gameRound.count({ where }),
    ]);

    const items: HighRollerDto[] = rounds.map((round: any) => ({
      id: round.id,
      username: round.user.username,
      avatarUrl: round.user.avatarUrl,
      gameName: round.game.name,
      gameSlug: round.game.slug,
      betAmount: Number(round.betAmount),
      currency: round.currency,
      createdAt: round.createdAt,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get monthly leaders by wagered amount
   */
  async getMonthlyLeaders(): Promise<MonthlyLeaderDto[]> {
    // Try cache first
    const cached = await this.redis.get<MonthlyLeaderDto[]>(this.MONTHLY_LEADERS_KEY);
    if (cached) {
      return cached;
    }

    // Get start of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get users who allow leaderboard display
    const publicUsers = await this.prisma.userPrivacySetting.findMany({
      where: { showInLeaderboard: true },
      select: { userId: true },
    });
    const publicUserIds = publicUsers.map((u) => u.userId);

    // Aggregate wagered amounts and wins per user this month
    const leaders = await this.prisma.gameRound.groupBy({
      by: ['userId', 'currency'],
      where: {
        createdAt: { gte: startOfMonth },
        userId: { in: publicUserIds },
      },
      _sum: {
        betAmount: true,
        winAmount: true,
      },
      orderBy: {
        _sum: {
          betAmount: 'desc',
        },
      },
      take: 50,
    });

    // Get user details
    const userIds = [...new Set(leaders.map((l) => l.userId))] as string[];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const result: MonthlyLeaderDto[] = leaders.map((leader: any, index: number) => {
      const user = userMap.get(leader.userId);
      return {
        rank: index + 1,
        userId: leader.userId,
        username: user?.username || 'Anonymous',
        avatarUrl: user?.avatarUrl || null,
        totalWagered: Number(leader._sum.betAmount) || 0,
        totalWins: Number(leader._sum.winAmount) || 0,
        currency: leader.currency,
      };
    });

    // Cache for longer
    await this.redis.set(this.MONTHLY_LEADERS_KEY, result, this.LONG_CACHE_TTL);

    return result;
  }

  /**
   * Get recent social proof events for real-time display
   */
  async getSocialProofEvents(): Promise<SocialProofEventDto[]> {
    // Try cache first
    const cached = await this.redis.get<SocialProofEventDto[]>(this.SOCIAL_PROOF_KEY);
    if (cached) {
      return cached;
    }

    // Get config for thresholds
    const config = await this.getSocialProofConfig();

    // Get recent significant events from SocialProofEvent table
    const recentEvents = await this.prisma.socialProofEvent.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Last hour
        OR: [
          { eventType: 'win', amount: { gte: config.minWinAmount } },
          { eventType: 'jackpot' },
          { eventType: 'bonus_claimed' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        eventType: true,
        displayName: true,
        avatarUrl: true,
        actionText: true,
        amount: true,
        currency: true,
        createdAt: true,
      },
    });

    const events: SocialProofEventDto[] = recentEvents.map((event: any) => ({
      type: this.mapEventType(event.eventType),
      username: event.displayName,
      avatarUrl: event.avatarUrl,
      gameName: event.actionText,
      amount: Number(event.amount || 0),
      currency: event.currency || 'GC',
      timestamp: event.createdAt,
    }));

    // Cache with short TTL
    await this.redis.set(this.SOCIAL_PROOF_KEY, events, this.SHORT_CACHE_TTL);

    return events;
  }

  /**
   * Map event type from database to DTO type
   */
  private mapEventType(eventType: string): 'win' | 'bet' | 'jackpot' | 'big_win' {
    switch (eventType) {
      case 'jackpot': return 'jackpot';
      case 'big_win': return 'big_win';
      case 'bet': return 'bet';
      default: return 'win';
    }
  }

  /**
   * Get social proof configuration
   */
  async getSocialProofConfig(): Promise<SocialProofConfigDto> {
    // Try cache first
    const cached = await this.redis.get<SocialProofConfigDto>(this.SOCIAL_PROOF_CONFIG_KEY);
    if (cached) {
      return cached;
    }

    // Get from SocialProofConfig table
    const dbConfig = await this.prisma.socialProofConfig.findFirst({
      where: { isActive: true },
    });

    const config: SocialProofConfigDto = {
      enabled: dbConfig?.isActive ?? true,
      minWinAmount: dbConfig ? Number(dbConfig.minWinAmountUsdcToDisplay) : 100,
      minBetAmount: 500, // Not in schema, use default
      displayDurationMs: dbConfig ? dbConfig.displayFrequencySeconds * 1000 : 5000,
      maxEventsPerMinute: 10, // Not in schema, use default
    };

    // Cache config
    await this.redis.set(this.SOCIAL_PROOF_CONFIG_KEY, config, this.LONG_CACHE_TTL);

    return config;
  }

  /**
   * Record a win activity (creates a SocialProofEvent if significant)
   */
  async recordWin(userId: string, data: RecordWinDto): Promise<{ success: boolean; activityId: string }> {
    // Check if user wants activity to be public
    const privacySettings = await this.prisma.userPrivacySetting.findUnique({
      where: { userId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, avatarUrl: true },
    });

    const game = await this.prisma.game.findUnique({
      where: { id: data.gameId },
      select: { name: true },
    });

    // Create social proof event if user allows and win is significant
    const config = await this.getSocialProofConfig();
    if ((privacySettings?.showInRecentWins ?? true) && config.enabled && data.amount >= config.minWinAmount) {
      const event = await this.prisma.socialProofEvent.create({
        data: {
          userId,
          displayName: user?.username || 'Anonymous',
          avatarUrl: user?.avatarUrl,
          eventType: data.amount >= 10000 || (data.multiplier && data.multiplier >= 100) ? 'big_win' : 'win',
          actionText: `won on ${game?.name || 'Unknown Game'}`,
          amount: data.amount,
          currency: data.currency,
          isSynthetic: false,
        },
      });

      // Invalidate caches
      await this.invalidateActivityCaches();

      // Publish to Redis channel for WebSocket broadcast
      await this.redis.publish('social_proof_events', JSON.stringify({
        type: data.amount >= 10000 ? 'big_win' : 'win',
        username: user?.username || 'Anonymous',
        avatarUrl: user?.avatarUrl,
        gameName: game?.name || 'Unknown',
        amount: data.amount,
        currency: data.currency,
        multiplier: data.multiplier,
        timestamp: new Date(),
      }));

      return { success: true, activityId: event.id };
    }

    return { success: true, activityId: '' };
  }

  /**
   * Record a bet activity (creates a SocialProofEvent if significant)
   */
  async recordBet(userId: string, data: RecordBetDto): Promise<{ success: boolean; activityId: string }> {
    // High rollers get social proof events
    const config = await this.getSocialProofConfig();

    if (config.enabled && data.betAmount >= config.minBetAmount) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, avatarUrl: true },
      });

      const game = await this.prisma.game.findUnique({
        where: { id: data.gameId },
        select: { name: true },
      });

      const event = await this.prisma.socialProofEvent.create({
        data: {
          userId,
          displayName: user?.username || 'Anonymous',
          avatarUrl: user?.avatarUrl,
          eventType: 'bet',
          actionText: `placed a high bet on ${game?.name || 'Unknown Game'}`,
          amount: data.betAmount,
          currency: data.currency,
          isSynthetic: false,
        },
      });

      // Invalidate caches
      await this.invalidateActivityCaches();

      return { success: true, activityId: event.id };
    }

    return { success: true, activityId: '' };
  }

  /**
   * Invalidate activity-related caches
   */
  private async invalidateActivityCaches(): Promise<void> {
    await Promise.all([
      this.redis.del(this.RECENT_WINS_KEY),
      this.redis.del(this.LIVE_BETS_KEY),
      this.redis.del(this.HIGH_ROLLERS_KEY),
      this.redis.del(this.SOCIAL_PROOF_KEY),
    ]);
  }

  /**
   * Get user's own activity history (from GameRound)
   */
  async getUserActivity(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [rounds, total] = await Promise.all([
      this.prisma.gameRound.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          betAmount: true,
          winAmount: true,
          currency: true,
          multiplier: true,
          createdAt: true,
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
      this.prisma.gameRound.count({ where: { userId } }),
    ]);

    const items = rounds.map((round: any) => ({
      id: round.id,
      type: Number(round.winAmount) > 0 ? 'win' : 'bet',
      amount: Number(round.winAmount) || null,
      betAmount: Number(round.betAmount),
      currency: round.currency,
      multiplier: round.multiplier ? Number(round.multiplier) : null,
      createdAt: round.createdAt,
      game: round.game,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }
}
