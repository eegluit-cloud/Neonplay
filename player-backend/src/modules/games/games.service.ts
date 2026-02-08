import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { JackpotService } from '../jackpot/jackpot.service';
import { HuiduService } from '../huidu/huidu.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';
import { randomBytes } from 'crypto';

export interface GameRoundInput {
  sessionId: string;
  betAmount: number | string;
  winAmount: number | string;
  multiplier?: number;
  resultData?: Record<string, any>;
  providerRoundId?: string;
}

export interface GameRoundResult {
  roundId: string;
  betAmount: string;
  winAmount: string;
  netResult: string;
  newBalance: string;
  jackpotWin?: {
    id: string;
    type: string;
    name: string;
    amount: string;
  };
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'USDC' | 'USDT' | 'BTC' | 'ETH' | 'SOL' | 'DOGE' | 'INR';

// Balance field mapping type
type BalanceFieldMap = {
  USD: 'usdBalance';
  EUR: 'eurBalance';
  GBP: 'gbpBalance';
  CAD: 'cadBalance';
  AUD: 'audBalance';
  USDC: 'usdcBalance';
  USDT: 'usdtBalance';
  BTC: 'btcBalance';
  ETH: 'ethBalance';
  SOL: 'solBalance';
  DOGE: 'dogeBalance';
  INR: 'inrBalance';
};

type BalanceField = BalanceFieldMap[Currency];

// Default exchange rate (1:1 for USDC)
const DEFAULT_EXCHANGE_RATE = new Decimal(1);

// Balance field mapping
const BALANCE_FIELDS: BalanceFieldMap = {
  USD: 'usdBalance',
  EUR: 'eurBalance',
  GBP: 'gbpBalance',
  CAD: 'cadBalance',
  AUD: 'audBalance',
  USDC: 'usdcBalance',
  USDT: 'usdtBalance',
  BTC: 'btcBalance',
  ETH: 'ethBalance',
  SOL: 'solBalance',
  DOGE: 'dogeBalance',
  INR: 'inrBalance',
};

// Helper to get balance field name from currency
function getBalanceField(currency: Currency): BalanceField {
  return BALANCE_FIELDS[currency] || 'usdcBalance';
}

export interface GamesQueryDto extends PaginationDto {
  category?: string;
  provider?: string;
  search?: string;
  tags?: string[];
  sortBy?: 'popular' | 'newest' | 'name' | 'rtp';
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jackpotService: JackpotService,
    @Inject(forwardRef(() => HuiduService))
    private readonly huiduService: HuiduService,
  ) {}

  async getGames(query: GamesQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {
      isActive: true,
    };

    // Filter by category slug
    if (query.category) {
      where.category = { slug: query.category };
    }

    // Filter by provider slug
    if (query.provider) {
      where.provider = { slug: query.provider };
    }

    // Search by name
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    // Determine sort order
    let orderBy: any = { sortOrder: 'asc' };
    const sortDirection = query.sortOrder || 'desc';

    switch (query.sortBy) {
      case 'popular':
        orderBy = { playCount: sortDirection };
        break;
      case 'newest':
        orderBy = { releasedAt: sortDirection };
        break;
      case 'name':
        orderBy = { name: sortDirection === 'asc' ? 'asc' : 'desc' };
        break;
      case 'rtp':
        orderBy = { rtp: sortDirection };
        break;
      default:
        orderBy = [{ sortOrder: 'asc' }, { playCount: 'desc' }];
    }

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          thumbnailUrl: true,
          bannerUrl: true,
          tags: true,
          rtp: true,
          volatility: true,
          minBet: true,
          maxBet: true,
          features: true,
          isFeatured: true,
          isNew: true,
          isHot: true,
          playCount: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return createPaginatedResult(games, total, query.page || 1, query.limit || 20);
  }

  async getFeaturedGames() {
    const cacheKey = 'games:featured';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    const games = await this.prisma.game.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { playCount: 'desc' }],
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        bannerUrl: true,
        rtp: true,
        volatility: true,
        isNew: true,
        isHot: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(games), 300);

    return games;
  }

  async getHotGames() {
    const cacheKey = 'games:hot';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    const games = await this.prisma.game.findMany({
      where: {
        isActive: true,
        isHot: true,
      },
      orderBy: { playCount: 'desc' },
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        rtp: true,
        volatility: true,
        isNew: true,
        isFeatured: true,
        playCount: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(games), 300);

    return games;
  }

  async getNewGames() {
    const cacheKey = 'games:new';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    const games = await this.prisma.game.findMany({
      where: {
        isActive: true,
        isNew: true,
      },
      orderBy: { releasedAt: 'desc' },
      take: 12,
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        rtp: true,
        volatility: true,
        isHot: true,
        isFeatured: true,
        releasedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(games), 300);

    return games;
  }

  async getGameBySlug(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        bannerUrl: true,
        tags: true,
        rtp: true,
        volatility: true,
        minBet: true,
        maxBet: true,
        features: true,
        isFeatured: true,
        isNew: true,
        isHot: true,
        isActive: true,
        playCount: true,
        releasedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async launchGame(userId: string, gameSlug: string, currency: Currency = 'INR') {
    // Validate currency
    const validCurrencies: Currency[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'DOGE', 'INR'];
    if (!validCurrencies.includes(currency)) {
      throw new BadRequestException(`Invalid currency. Must be one of: ${validCurrencies.join(', ')}`);
    }

    // Get game with provider info
    const game = await this.prisma.game.findUnique({
      where: { slug: gameSlug },
      include: {
        provider: {
          include: { aggregator: true },
        },
      },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException('Game not found');
    }

    if (!game.provider.isActive) {
      throw new BadRequestException('Game provider is currently unavailable');
    }

    // Check user wallet balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balanceField = getBalanceField(currency);
    const balance = wallet[balanceField] as Decimal;
    const minBet = game.minBet || 0;

    if (Number(balance) < Number(minBet)) {
      throw new BadRequestException(`Insufficient ${currency} balance to play this game`);
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString('hex');

    // Create game session
    const session = await this.prisma.gameSession.create({
      data: {
        userId,
        gameId: game.id,
        currency,
        sessionToken,
        totalBetUsdc: new Decimal(0),
        totalWinUsdc: new Decimal(0),
      },
    });

    // Record game play
    await this.recordGamePlay(userId, game.id);

    // Increment play count
    await this.prisma.game.update({
      where: { id: game.id },
      data: { playCount: { increment: 1 } },
    });

    // In production, this would call the game provider's API to get a launch URL
    // For now, return session details
    // Dispatch to aggregator-specific launch logic
    let launchUrl: string;
    if (game.provider.aggregator?.slug === 'huidu') {
      launchUrl = await this.huiduService.launchGame(userId, game, currency, session.id);
    } else {
      launchUrl = this.generateGameLaunchUrl(game, session.sessionToken, currency);
    }

    return {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      launchUrl,
      game: {
        id: game.id,
        name: game.name,
        slug: game.slug,
        provider: game.provider.name,
      },
      currency,
    };
  }

  private generateGameLaunchUrl(game: any, sessionToken: string, currency: Currency): string {
    // In production, this would generate the actual provider launch URL
    // This is a placeholder implementation
    const baseUrl = process.env.GAME_LAUNCH_BASE_URL || 'https://games.example.com';
    return `${baseUrl}/play/${game.slug}?session=${sessionToken}&currency=${currency.toLowerCase()}`;
  }

  async getCategories() {
    const cacheKey = 'games:categories';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    const categories = await this.prisma.gameCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        _count: {
          select: {
            games: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const result = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      gameCount: category._count.games,
    }));

    // Cache for 10 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 600);

    return result;
  }

  async getGamesByCategory(categorySlug: string, query: PaginationDto) {
    const category = await this.prisma.gameCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException('Category not found');
    }

    const { skip, take } = getPaginationParams(query);

    const where = {
      isActive: true,
      categoryId: category.id,
    };

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { playCount: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnailUrl: true,
          rtp: true,
          volatility: true,
          isFeatured: true,
          isNew: true,
          isHot: true,
          playCount: true,
          provider: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description,
      },
      ...createPaginatedResult(games, total, query.page || 1, query.limit || 20),
    };
  }

  async getUserFavorites(userId: string, query?: PaginationDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const { skip, take } = getPaginationParams({ page, limit });

    const [favorites, total] = await Promise.all([
      this.prisma.userFavoriteGame.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          createdAt: true,
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnailUrl: true,
              rtp: true,
              volatility: true,
              isNew: true,
              isHot: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              provider: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.userFavoriteGame.count({ where: { userId } }),
    ]);

    const games = favorites.map((f) => ({
      ...f.game,
      favoritedAt: f.createdAt,
    }));

    return createPaginatedResult(games, total, page, limit);
  }

  async addToFavorites(userId: string, gameId: string) {
    // Verify game exists and is active
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, isActive: true, name: true, slug: true },
    });

    if (!game || !game.isActive) {
      throw new NotFoundException('Game not found');
    }

    // Check if already favorited
    const existing = await this.prisma.userFavoriteGame.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    if (existing) {
      throw new ConflictException('Game is already in favorites');
    }

    await this.prisma.userFavoriteGame.create({
      data: { userId, gameId },
    });

    return {
      success: true,
      message: `${game.name} added to favorites`,
      game: {
        id: game.id,
        name: game.name,
        slug: game.slug,
      },
    };
  }

  async removeFromFavorites(userId: string, gameId: string) {
    const favorite = await this.prisma.userFavoriteGame.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
      include: {
        game: {
          select: { name: true, slug: true },
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Game not found in favorites');
    }

    await this.prisma.userFavoriteGame.delete({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    return {
      success: true,
      message: `${favorite.game.name} removed from favorites`,
    };
  }

  async getUserRecentGames(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [recentGames, total] = await Promise.all([
      this.prisma.userRecentGame.findMany({
        where: { userId },
        orderBy: { lastPlayedAt: 'desc' },
        skip,
        take,
        select: {
          lastPlayedAt: true,
          playCount: true,
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnailUrl: true,
              rtp: true,
              volatility: true,
              isNew: true,
              isHot: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              provider: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logoUrl: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.userRecentGame.count({ where: { userId } }),
    ]);

    const games = recentGames.map((r) => ({
      ...r.game,
      lastPlayedAt: r.lastPlayedAt,
      playCount: r.playCount,
    }));

    return createPaginatedResult(games, total, query.page || 1, query.limit || 20);
  }

  async recordGamePlay(userId: string, gameId: string) {
    // Upsert to track recent plays
    const existing = await this.prisma.userRecentGame.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    if (existing) {
      await this.prisma.userRecentGame.update({
        where: { id: existing.id },
        data: {
          lastPlayedAt: new Date(),
          playCount: { increment: 1 },
        },
      });
    } else {
      await this.prisma.userRecentGame.create({
        data: {
          userId,
          gameId,
          lastPlayedAt: new Date(),
          playCount: 1,
        },
      });
    }

    // Limit recent games to 50 entries per user
    const recentCount = await this.prisma.userRecentGame.count({
      where: { userId },
    });

    if (recentCount > 50) {
      // Delete oldest entries beyond 50
      const oldestEntries = await this.prisma.userRecentGame.findMany({
        where: { userId },
        orderBy: { lastPlayedAt: 'asc' },
        take: recentCount - 50,
        select: { id: true },
      });

      await this.prisma.userRecentGame.deleteMany({
        where: {
          id: { in: oldestEntries.map((e) => e.id) },
        },
      });
    }

    return { success: true };
  }

  async isGameFavorited(userId: string, gameId: string): Promise<boolean> {
    const favorite = await this.prisma.userFavoriteGame.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });
    return !!favorite;
  }

  async getProviders() {
    const cacheKey = 'games:providers';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached as string);
    }

    const providers = await this.prisma.gameProvider.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        _count: {
          select: {
            games: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const result = providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      logoUrl: provider.logoUrl,
      gameCount: provider._count.games,
    }));

    // Cache for 10 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 600);

    return result;
  }

  /**
   * Get user game session history
   */
  async getGameHistory(userId: string, query: any) {
    const { skip, take } = getPaginationParams(query);

    const where: any = { userId };

    if (query.startDate || query.endDate) {
      where.startedAt = {};
      if (query.startDate) where.startedAt.gte = new Date(query.startDate);
      if (query.endDate) where.startedAt.lte = new Date(query.endDate);
    }

    const [sessions, total] = await Promise.all([
      this.prisma.gameSession.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          currency: true,
          totalBet: true,
          totalWin: true,
          totalBetUsdc: true,
          totalWinUsdc: true,
          roundsPlayed: true,
          startedAt: true,
          endedAt: true,
          game: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnailUrl: true,
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              provider: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.gameSession.count({ where }),
    ]);

    // Calculate totals for the user
    const totals = await this.prisma.gameSession.aggregate({
      where: { userId },
      _sum: {
        totalBet: true,
        totalWin: true,
        roundsPlayed: true,
      },
      _count: true,
    });

    return {
      ...createPaginatedResult(sessions, total, query.page || 1, query.limit || 20),
      summary: {
        totalSessions: totals._count,
        totalBet: Number(totals._sum.totalBet || 0),
        totalWin: Number(totals._sum.totalWin || 0),
        totalRounds: totals._sum.roundsPlayed || 0,
        netResult: Number(totals._sum.totalWin || 0) - Number(totals._sum.totalBet || 0),
      },
    };
  }

  /**
   * Get game statistics
   */
  async getGameStats(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        rtp: true,
        volatility: true,
        playCount: true,
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Get aggregated session stats
    const sessionStats = await this.prisma.gameSession.aggregate({
      where: { gameId: game.id },
      _sum: {
        totalBet: true,
        totalWin: true,
        roundsPlayed: true,
      },
      _count: true,
      _avg: {
        totalBet: true,
        totalWin: true,
      },
    });

    // Get unique players count
    const uniquePlayers = await this.prisma.gameSession.groupBy({
      by: ['userId'],
      where: { gameId: game.id },
    });

    // Get recent big wins
    const bigWins = await this.prisma.gameSession.findMany({
      where: {
        gameId: game.id,
        totalWin: { gt: 0 },
      },
      orderBy: { totalWin: 'desc' },
      take: 10,
      select: {
        totalWin: true,
        totalWinUsdc: true,
        currency: true,
        startedAt: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    // Calculate actual RTP from data
    const totalBet = Number(sessionStats._sum.totalBet || 0);
    const totalWin = Number(sessionStats._sum.totalWin || 0);
    const actualRtp = totalBet > 0 ? ((totalWin / totalBet) * 100).toFixed(2) : null;

    return {
      game: {
        id: game.id,
        name: game.name,
        slug: game.slug,
        theoreticalRtp: game.rtp,
        volatility: game.volatility,
      },
      stats: {
        totalSessions: sessionStats._count,
        uniquePlayers: uniquePlayers.length,
        totalPlays: game.playCount,
        totalBet,
        totalWin,
        totalRounds: sessionStats._sum.roundsPlayed || 0,
        averageBetPerSession: Number(sessionStats._avg.totalBet || 0),
        averageWinPerSession: Number(sessionStats._avg.totalWin || 0),
        actualRtp,
        houseEdge: actualRtp ? (100 - parseFloat(actualRtp)).toFixed(2) : null,
      },
      bigWins: bigWins.map((w) => ({
        username: w.user?.username || 'Anonymous',
        amount: Number(w.totalWin),
        amountUsdc: Number(w.totalWinUsdc),
        currency: w.currency,
        date: w.startedAt,
      })),
    };
  }

  // ============================================================================
  // GAME ROUND RECORDING
  // ============================================================================

  /**
   * Record a game round result
   * Called by the game provider callback or game engine after each round
   *
   * This method:
   * 1. Validates the session and bet amount
   * 2. Deducts bet from wallet
   * 3. Records the round
   * 4. Adds win amount to wallet
   * 5. Updates session totals
   * 6. Contributes to jackpots (SC only)
   * 7. Checks for jackpot win
   * 8. Creates transactions
   */
  async recordGameRound(input: GameRoundInput): Promise<GameRoundResult> {
    const betAmount = new Decimal(input.betAmount);
    const winAmount = new Decimal(input.winAmount);

    // Get the session with game info
    const session = await this.prisma.gameSession.findUnique({
      where: { id: input.sessionId },
      include: {
        game: true,
        user: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    if (session.endedAt) {
      throw new BadRequestException('Game session has already ended');
    }

    const userId = session.userId;
    const gameId = session.gameId;
    const currency = session.currency as Currency;

    // For simplicity, use 1:1 exchange rate for USDC, in production this would come from a price service
    const exchangeRate = DEFAULT_EXCHANGE_RATE;
    const betAmountUsdc = betAmount.mul(exchangeRate);
    const winAmountUsdc = winAmount.mul(exchangeRate);

    // Execute everything in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Get wallet with pessimistic lock
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const balanceField = getBalanceField(currency);
      const currentBalance = wallet[balanceField] as Decimal;

      // Verify sufficient balance for bet
      if (currentBalance.lt(betAmount)) {
        throw new BadRequestException(`Insufficient ${currency} balance`);
      }

      // Calculate new balance after bet and win
      const balanceAfterBet = currentBalance.sub(betAmount);
      const balanceAfterWin = balanceAfterBet.add(winAmount);
      const netResult = winAmount.sub(betAmount);
      const netResultUsdc = winAmountUsdc.sub(betAmountUsdc);

      // Create game round record
      const round = await tx.gameRound.create({
        data: {
          sessionId: session.id,
          userId,
          gameId,
          currency,
          betAmount,
          winAmount,
          betAmountUsdc,
          winAmountUsdc,
          exchangeRate,
          multiplier: input.multiplier ? new Decimal(input.multiplier) : null,
          resultData: input.resultData ?? undefined,
          providerRoundId: input.providerRoundId ?? undefined,
        },
      });

      // Update wallet balance
      const walletUpdate: any = {
        version: { increment: 1 },
        [balanceField]: balanceAfterWin,
      };

      // Track lifetime winnings if this was a win (in USDC equivalent)
      if (netResultUsdc.gt(0)) {
        walletUpdate.lifetimeWon = wallet.lifetimeWon.add(netResultUsdc);
      }

      await tx.wallet.update({
        where: { userId },
        data: walletUpdate,
      });

      // Create bet transaction
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'game_bet',
          currency,
          amount: betAmount.neg(), // Negative for debit
          usdcAmount: betAmountUsdc.neg(),
          exchangeRate,
          balanceBefore: currentBalance,
          balanceAfter: balanceAfterBet,
          referenceType: 'game_round',
          referenceId: round.id,
          status: 'completed',
          metadata: {
            gameId,
            gameName: session.game.name,
            sessionId: session.id,
          },
        },
      });

      // Create win transaction if there was a win
      if (winAmount.gt(0)) {
        await tx.transaction.create({
          data: {
            userId,
            walletId: wallet.id,
            type: 'game_win',
            currency,
            amount: winAmount,
            usdcAmount: winAmountUsdc,
            exchangeRate,
            balanceBefore: balanceAfterBet,
            balanceAfter: balanceAfterWin,
            referenceType: 'game_round',
            referenceId: round.id,
            status: 'completed',
            metadata: {
              gameId,
              gameName: session.game.name,
              sessionId: session.id,
              multiplier: input.multiplier,
            },
          },
        });
      }

      // Update session totals
      await tx.gameSession.update({
        where: { id: session.id },
        data: {
          totalBet: { increment: betAmount },
          totalWin: { increment: winAmount },
          totalBetUsdc: { increment: betAmountUsdc },
          totalWinUsdc: { increment: winAmountUsdc },
          roundsPlayed: { increment: 1 },
        },
      });

      return {
        round,
        newBalance: balanceAfterWin,
        netResult,
      };
    });

    // After successful transaction, handle jackpot contributions and checks
    // These are outside the main transaction to avoid holding locks too long
    let jackpotWin = null;

    // Contribute to jackpots (using USDC equivalent for consistency)
    await this.jackpotService.contributeToJackpots(betAmountUsdc);

    // Check for jackpot win
    const jackpotResult = await this.jackpotService.checkAndTriggerWin(
      userId,
      gameId,
      session.id,
      betAmountUsdc,
    );

    if (jackpotResult.won && jackpotResult.jackpot) {
      jackpotWin = jackpotResult.jackpot;
      this.logger.log(
        `User ${userId} won ${jackpotResult.jackpot.type} jackpot: ${jackpotResult.jackpot.amount} ${currency}`,
      );
    }

    // Record big wins for social proof (outside main transaction)
    // Using USDC equivalent for threshold comparison
    if (winAmountUsdc.gte(100)) {
      await this.recordBigWin(userId, gameId, winAmount, winAmountUsdc, currency);
    }

    return {
      roundId: result.round.id,
      betAmount: betAmount.toFixed(4),
      winAmount: winAmount.toFixed(4),
      netResult: result.netResult.toFixed(4),
      newBalance: result.newBalance.toFixed(4),
      jackpotWin: jackpotWin || undefined,
    };
  }

  /**
   * End a game session
   */
  async endGameSession(sessionId: string): Promise<void> {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    if (session.endedAt) {
      return; // Already ended
    }

    await this.prisma.gameSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    this.logger.debug(`Game session ${sessionId} ended`);
  }

  /**
   * Get game rounds for a session
   */
  async getSessionRounds(sessionId: string, userId: string, query: PaginationDto) {
    const session = await this.prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Game session not found');
    }

    // Verify ownership
    if (session.userId !== userId) {
      throw new BadRequestException('Access denied');
    }

    const { skip, take } = getPaginationParams(query);

    const [rounds, total] = await Promise.all([
      this.prisma.gameRound.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          currency: true,
          betAmount: true,
          winAmount: true,
          betAmountUsdc: true,
          winAmountUsdc: true,
          multiplier: true,
          createdAt: true,
        },
      }),
      this.prisma.gameRound.count({ where: { sessionId } }),
    ]);

    return createPaginatedResult(
      rounds.map((r) => ({
        id: r.id,
        currency: r.currency,
        betAmount: r.betAmount.toString(),
        winAmount: r.winAmount.toString(),
        betAmountUsdc: r.betAmountUsdc.toString(),
        winAmountUsdc: r.winAmountUsdc.toString(),
        multiplier: r.multiplier?.toString() || null,
        netResult: r.winAmount.sub(r.betAmount).toString(),
        createdAt: r.createdAt,
      })),
      total,
      query.page || 1,
      query.limit || 20,
    );
  }

  /**
   * Record a big win for social proof display
   */
  private async recordBigWin(
    userId: string,
    gameId: string,
    amount: Decimal,
    amountUsdc: Decimal,
    currency: string,
  ): Promise<void> {
    try {
      // Check user privacy settings
      const privacy = await this.prisma.userPrivacySetting.findUnique({
        where: { userId },
      });

      if (privacy && !privacy.showInRecentWins) {
        return; // User opted out
      }

      // Get user for display
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, avatarUrl: true },
      });

      // Create public win record (requires gameRoundId - skip if not available)
      // Note: In a full implementation, gameRoundId would be passed from recordGameRound
      this.logger.log(`Recording big win for user ${userId}: ${amount} ${currency}`);

      // Create social proof event
      await this.prisma.socialProofEvent.create({
        data: {
          userId,
          displayName: this.formatDisplayName(
            user?.username || 'Anonymous',
            privacy?.displayNamePreference || 'first_initial',
          ),
          avatarUrl: user?.avatarUrl,
          eventType: 'win',
          actionText: `won ${amount.toFixed(2)} ${currency}!`,
          amount,
          amountUsdc,
          currency,
        },
      });
    } catch (error) {
      // Don't fail the main operation if this fails
      this.logger.warn(`Failed to record big win: ${error}`);
    }
  }

  /**
   * Format username based on privacy preference
   */
  private formatDisplayName(
    username: string,
    preference: string,
  ): string {
    switch (preference) {
      case 'anonymous':
        return 'Anonymous Player';
      case 'first_initial':
        return username ? `${username[0]}***` : 'Anonymous';
      case 'full':
      default:
        if (username.length <= 4) {
          return username ? `${username[0]}***` : 'Anonymous';
        }
        return username.slice(0, 2) + '***' + username.slice(-2);
    }
  }
}
