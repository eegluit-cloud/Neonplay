import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { WalletService } from '../wallet/wallet.service';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';
import { Decimal } from '@prisma/client/runtime/library';

type CoinType = 'GC' | 'SC';

export interface MatchesQueryDto extends PaginationDto {
  sportSlug?: string;
  leagueSlug?: string;
  status?: 'upcoming' | 'live' | 'finished';
  dateFrom?: string;
  dateTo?: string;
  featured?: boolean;
}

export interface PlaceBetDto {
  type: 'single' | 'combo';
  stake: number;
  coinType: CoinType;
  selections: BetSelectionDto[];
}

export interface BetSelectionDto {
  matchId: string;
  marketId: string;
  oddId: string;
  selection: string;
}

export interface UserBetsQueryDto extends PaginationDto {
  status?: 'pending' | 'won' | 'lost' | 'void' | 'cashout';
  type?: 'single' | 'combo';
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class SportsService {
  private readonly logger = new Logger(SportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * Get all available sports
   */
  async getSports() {
    const cacheKey = 'sports:all';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const sports = await this.prisma.sport.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        iconKey: true,
        _count: {
          select: {
            leagues: {
              where: { isActive: true },
            },
            matches: {
              where: {
                status: { in: ['upcoming', 'live'] },
              },
            },
          },
        },
      },
    });

    const result = sports.map((sport) => ({
      id: sport.id,
      name: sport.name,
      slug: sport.slug,
      iconKey: sport.iconKey,
      leagueCount: sport._count.leagues,
      matchCount: sport._count.matches,
    }));

    // Cache for 5 minutes
    await this.redis.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get all leagues
   */
  async getAllLeagues() {
    const cacheKey = 'sports:all-leagues';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const leagues = await this.prisma.league.findMany({
      where: { isActive: true },
      orderBy: [{ sport: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        countryFlag: true,
        logoUrl: true,
        sport: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconKey: true,
          },
        },
        _count: {
          select: {
            matches: {
              where: {
                status: { in: ['upcoming', 'live'] },
              },
            },
          },
        },
      },
    });

    const result = leagues.map((league) => ({
      id: league.id,
      name: league.name,
      slug: league.slug,
      country: league.country,
      countryFlag: league.countryFlag,
      logoUrl: league.logoUrl,
      sport: league.sport,
      matchCount: league._count.matches,
    }));

    // Cache for 5 minutes
    await this.redis.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get leagues for a specific sport
   */
  async getLeaguesBySport(sportSlug: string) {
    const cacheKey = `sports:leagues:${sportSlug}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const sport = await this.prisma.sport.findUnique({
      where: { slug: sportSlug },
    });

    if (!sport || !sport.isActive) {
      throw new NotFoundException('Sport not found');
    }

    const leagues = await this.prisma.league.findMany({
      where: {
        sportId: sport.id,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
        countryFlag: true,
        logoUrl: true,
        _count: {
          select: {
            matches: {
              where: {
                status: { in: ['upcoming', 'live'] },
              },
            },
          },
        },
      },
    });

    const result = {
      sport: {
        id: sport.id,
        name: sport.name,
        slug: sport.slug,
        iconKey: sport.iconKey,
      },
      leagues: leagues.map((league) => ({
        id: league.id,
        name: league.name,
        slug: league.slug,
        country: league.country,
        countryFlag: league.countryFlag,
        logoUrl: league.logoUrl,
        matchCount: league._count.matches,
      })),
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get matches with filters
   */
  async getMatches(query: MatchesQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};

    // Filter by sport
    if (query.sportSlug) {
      const sport = await this.prisma.sport.findUnique({
        where: { slug: query.sportSlug },
        select: { id: true },
      });
      if (sport) {
        where.sportId = sport.id;
      }
    }

    // Filter by league
    if (query.leagueSlug) {
      const league = await this.prisma.league.findUnique({
        where: { slug: query.leagueSlug },
        select: { id: true },
      });
      if (league) {
        where.leagueId = league.id;
      }
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by date range
    if (query.dateFrom || query.dateTo) {
      where.scheduledAt = {};
      if (query.dateFrom) {
        where.scheduledAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.scheduledAt.lte = new Date(query.dateTo);
      }
    }

    // Filter featured matches
    if (query.featured) {
      where.isFeatured = true;
    }

    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        skip,
        take,
        select: {
          id: true,
          scheduledAt: true,
          startedAt: true,
          status: true,
          homeScore: true,
          awayScore: true,
          liveMinute: true,
          livePeriod: true,
          isFeatured: true,
          sport: {
            select: {
              id: true,
              name: true,
              slug: true,
              iconKey: true,
            },
          },
          league: {
            select: {
              id: true,
              name: true,
              slug: true,
              country: true,
              countryFlag: true,
              logoUrl: true,
            },
          },
          homeTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              logoUrl: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              logoUrl: true,
            },
          },
          markets: {
            where: { isActive: true, isSuspended: false },
            take: 3, // Only main markets for list view
            select: {
              id: true,
              type: true,
              name: true,
              line: true,
              odds: {
                where: { isActive: true },
                select: {
                  id: true,
                  selection: true,
                  value: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.match.count({ where }),
    ]);

    return createPaginatedResult(matches, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get matches by sport slug
   */
  async getMatchesBySport(sportSlug: string, query: MatchesQueryDto) {
    const sport = await this.prisma.sport.findUnique({
      where: { slug: sportSlug },
    });

    if (!sport || !sport.isActive) {
      throw new NotFoundException('Sport not found');
    }

    const { skip, take } = getPaginationParams(query);

    const where: any = { sportId: sport.id };

    if (query.status) {
      where.status = query.status;
    } else {
      // Default to upcoming and live
      where.status = { in: ['upcoming', 'live'] };
    }

    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        skip,
        take,
        select: {
          id: true,
          scheduledAt: true,
          startedAt: true,
          status: true,
          homeScore: true,
          awayScore: true,
          liveMinute: true,
          livePeriod: true,
          isFeatured: true,
          league: {
            select: {
              id: true,
              name: true,
              slug: true,
              country: true,
              countryFlag: true,
              logoUrl: true,
            },
          },
          homeTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              logoUrl: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              logoUrl: true,
            },
          },
          markets: {
            where: { isActive: true, isSuspended: false },
            take: 3,
            select: {
              id: true,
              type: true,
              name: true,
              line: true,
              odds: {
                where: { isActive: true },
                select: {
                  id: true,
                  selection: true,
                  value: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      sport: {
        id: sport.id,
        name: sport.name,
        slug: sport.slug,
        iconKey: sport.iconKey,
      },
      ...createPaginatedResult(matches, total, query.page || 1, query.limit || 20),
    };
  }

  /**
   * Get matches by league slug
   */
  async getMatchesByLeague(leagueSlug: string, query: MatchesQueryDto) {
    const league = await this.prisma.league.findUnique({
      where: { slug: leagueSlug },
      include: {
        sport: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconKey: true,
          },
        },
      },
    });

    if (!league || !league.isActive) {
      throw new NotFoundException('League not found');
    }

    const { skip, take } = getPaginationParams(query);

    const where: any = { leagueId: league.id };

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = { in: ['upcoming', 'live'] };
    }

    const [matches, total] = await Promise.all([
      this.prisma.match.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        skip,
        take,
        select: {
          id: true,
          scheduledAt: true,
          startedAt: true,
          status: true,
          homeScore: true,
          awayScore: true,
          liveMinute: true,
          livePeriod: true,
          isFeatured: true,
          homeTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              logoUrl: true,
            },
          },
          awayTeam: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              logoUrl: true,
            },
          },
          markets: {
            where: { isActive: true, isSuspended: false },
            take: 3,
            select: {
              id: true,
              type: true,
              name: true,
              line: true,
              odds: {
                where: { isActive: true },
                select: {
                  id: true,
                  selection: true,
                  value: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.match.count({ where }),
    ]);

    return {
      league: {
        id: league.id,
        name: league.name,
        slug: league.slug,
        country: league.country,
        countryFlag: league.countryFlag,
        logoUrl: league.logoUrl,
      },
      sport: league.sport,
      ...createPaginatedResult(matches, total, query.page || 1, query.limit || 20),
    };
  }

  /**
   * Get live matches only
   */
  async getLiveMatches() {
    const cacheKey = 'sports:live-matches';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const matches = await this.prisma.match.findMany({
      where: { status: 'live' },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        scheduledAt: true,
        startedAt: true,
        status: true,
        homeScore: true,
        awayScore: true,
        liveMinute: true,
        livePeriod: true,
        isFeatured: true,
        sport: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconKey: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            countryFlag: true,
            logoUrl: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            logoUrl: true,
          },
        },
        markets: {
          where: { isActive: true, isSuspended: false },
          take: 3,
          select: {
            id: true,
            type: true,
            name: true,
            line: true,
            odds: {
              where: { isActive: true },
              select: {
                id: true,
                selection: true,
                value: true,
              },
            },
          },
        },
      },
    });

    // Cache for 30 seconds (live data changes frequently)
    await this.redis.set(cacheKey, matches, 30);

    return matches;
  }

  /**
   * Get featured matches for homepage
   */
  async getFeaturedMatches() {
    const cacheKey = 'sports:featured-matches';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const matches = await this.prisma.match.findMany({
      where: {
        isFeatured: true,
        status: { in: ['upcoming', 'live'] },
      },
      orderBy: [{ status: 'asc' }, { scheduledAt: 'asc' }],
      take: 10,
      select: {
        id: true,
        scheduledAt: true,
        startedAt: true,
        status: true,
        homeScore: true,
        awayScore: true,
        liveMinute: true,
        livePeriod: true,
        isFeatured: true,
        sport: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconKey: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            countryFlag: true,
            logoUrl: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            logoUrl: true,
          },
        },
        markets: {
          where: { isActive: true, isSuspended: false },
          take: 3,
          select: {
            id: true,
            type: true,
            name: true,
            line: true,
            odds: {
              where: { isActive: true },
              select: {
                id: true,
                selection: true,
                value: true,
              },
            },
          },
        },
      },
    });

    // Cache for 2 minutes
    await this.redis.set(cacheKey, matches, 120);

    return matches;
  }

  /**
   * Get match details with all markets and odds
   */
  async getMatchById(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      select: {
        id: true,
        externalMatchId: true,
        scheduledAt: true,
        startedAt: true,
        endedAt: true,
        status: true,
        homeScore: true,
        awayScore: true,
        liveMinute: true,
        livePeriod: true,
        result: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        sport: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconKey: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            countryFlag: true,
            logoUrl: true,
          },
        },
        homeTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            logoUrl: true,
            country: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            shortName: true,
            slug: true,
            logoUrl: true,
            country: true,
          },
        },
        markets: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            name: true,
            line: true,
            isSuspended: true,
            odds: {
              where: { isActive: true },
              orderBy: { selection: 'asc' },
              select: {
                id: true,
                selection: true,
                value: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  /**
   * Place a bet (single or combo)
   */
  async placeBet(userId: string, betData: PlaceBetDto) {
    // Validate coin type
    if (!['GC', 'SC'].includes(betData.coinType)) {
      throw new BadRequestException('Invalid coin type. Must be GC or SC');
    }

    // Validate stake
    if (betData.stake <= 0) {
      throw new BadRequestException('Stake must be greater than 0');
    }

    // Validate selections
    if (!betData.selections || betData.selections.length === 0) {
      throw new BadRequestException('At least one selection is required');
    }

    if (betData.type === 'single' && betData.selections.length !== 1) {
      throw new BadRequestException('Single bet must have exactly one selection');
    }

    if (betData.type === 'combo' && betData.selections.length < 2) {
      throw new BadRequestException('Combo bet must have at least two selections');
    }

    // Check for duplicate matches in combo bet
    if (betData.type === 'combo') {
      const matchIds = betData.selections.map((s) => s.matchId);
      const uniqueMatchIds = new Set(matchIds);
      if (matchIds.length !== uniqueMatchIds.size) {
        throw new BadRequestException('Cannot have multiple selections from the same match in a combo bet');
      }
    }

    // Get wallet and check balance
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balance = betData.coinType === 'GC' ? wallet.gcBalance : wallet.scBalance;
    const stake = new Decimal(betData.stake);

    if (stake.gt(balance)) {
      throw new BadRequestException(`Insufficient ${betData.coinType} balance`);
    }

    // Validate all selections and calculate total odds
    const selectionDetails = await this.validateSelections(betData.selections);
    let totalOdds = new Decimal(1);

    for (const selection of selectionDetails) {
      totalOdds = totalOdds.mul(selection.odds);
    }

    const potentialWin = stake.mul(totalOdds);

    // Create bet in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create the bet
      const bet = await tx.bet.create({
        data: {
          userId,
          type: betData.type,
          stake,
          coinType: betData.coinType,
          potentialWin,
          totalOdds,
          status: 'pending',
        },
      });

      // Create bet selections
      for (const selection of selectionDetails) {
        await tx.betSelection.create({
          data: {
            betId: bet.id,
            matchId: selection.matchId,
            marketId: selection.marketId,
            oddId: selection.oddId,
            selection: selection.selection,
            oddsAtPlacement: selection.odds,
            status: 'pending',
          },
        });
      }

      // Deduct stake from wallet
      const currentBalance = betData.coinType === 'GC' ? wallet.gcBalance : wallet.scBalance;
      const newBalance = new Decimal(currentBalance).minus(stake);

      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'stake',
          coinType: betData.coinType,
          amount: stake.neg(),
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'bet',
          referenceId: bet.id,
          status: 'completed',
          metadata: {
            betType: betData.type,
            selectionsCount: betData.selections.length,
          },
        },
      });

      const updateData: any = { version: { increment: 1 } };
      if (betData.coinType === 'GC') {
        updateData.gcBalance = newBalance;
      } else {
        updateData.scBalance = newBalance;
      }

      // Use updateMany for proper optimistic locking check
      const walletUpdateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: updateData,
      });

      // Verify the wallet was actually updated (no concurrent modification)
      if (walletUpdateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for bet placement - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry your bet.');
      }

      // Publish balance update event
      await this.redis.publish('wallet:balance_updated', {
        userId,
        gcBalance: betData.coinType === 'GC' ? newBalance.toString() : wallet.gcBalance.toString(),
        scBalance: betData.coinType === 'SC' ? newBalance.toString() : wallet.scBalance.toString(),
      });

      // Fetch complete bet with selections
      const completeBet = await tx.bet.findUnique({
        where: { id: bet.id },
        include: {
          selections: {
            include: {
              match: {
                include: {
                  homeTeam: { select: { name: true, shortName: true } },
                  awayTeam: { select: { name: true, shortName: true } },
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        bet: completeBet,
        wallet: {
          gcBalance: betData.coinType === 'GC' ? newBalance : wallet.gcBalance,
          scBalance: betData.coinType === 'SC' ? newBalance : wallet.scBalance,
        },
      };
    });
  }

  /**
   * Validate bet selections
   */
  private async validateSelections(selections: BetSelectionDto[]) {
    const results = [];

    for (const selection of selections) {
      // Verify match exists and is bettable
      const match = await this.prisma.match.findUnique({
        where: { id: selection.matchId },
        select: { id: true, status: true },
      });

      if (!match) {
        throw new BadRequestException(`Match ${selection.matchId} not found`);
      }

      if (!['upcoming', 'live'].includes(match.status)) {
        throw new BadRequestException(`Match ${selection.matchId} is not available for betting`);
      }

      // Verify market exists and is active
      const market = await this.prisma.market.findUnique({
        where: { id: selection.marketId },
        select: { id: true, matchId: true, isActive: true, isSuspended: true },
      });

      if (!market) {
        throw new BadRequestException(`Market ${selection.marketId} not found`);
      }

      if (market.matchId !== selection.matchId) {
        throw new BadRequestException(`Market ${selection.marketId} does not belong to match ${selection.matchId}`);
      }

      if (!market.isActive || market.isSuspended) {
        throw new BadRequestException(`Market ${selection.marketId} is not available for betting`);
      }

      // Verify odd exists and is active
      const odd = await this.prisma.odd.findUnique({
        where: { id: selection.oddId },
        select: { id: true, marketId: true, selection: true, value: true, isActive: true },
      });

      if (!odd) {
        throw new BadRequestException(`Odd ${selection.oddId} not found`);
      }

      if (odd.marketId !== selection.marketId) {
        throw new BadRequestException(`Odd ${selection.oddId} does not belong to market ${selection.marketId}`);
      }

      if (!odd.isActive) {
        throw new BadRequestException(`Odd ${selection.oddId} is no longer available`);
      }

      if (odd.selection !== selection.selection) {
        throw new BadRequestException(`Selection mismatch for odd ${selection.oddId}`);
      }

      results.push({
        matchId: selection.matchId,
        marketId: selection.marketId,
        oddId: selection.oddId,
        selection: selection.selection,
        odds: odd.value,
      });
    }

    return results;
  }

  /**
   * Get user's bet history
   */
  async getUserBets(userId: string, query: UserBetsQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.dateFrom || query.dateTo) {
      where.placedAt = {};
      if (query.dateFrom) {
        where.placedAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.placedAt.lte = new Date(query.dateTo);
      }
    }

    const [bets, total] = await Promise.all([
      this.prisma.bet.findMany({
        where,
        orderBy: { placedAt: 'desc' },
        skip,
        take,
        include: {
          selections: {
            include: {
              match: {
                include: {
                  sport: { select: { name: true, slug: true, iconKey: true } },
                  league: { select: { name: true, slug: true } },
                  homeTeam: { select: { name: true, shortName: true, logoUrl: true } },
                  awayTeam: { select: { name: true, shortName: true, logoUrl: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.bet.count({ where }),
    ]);

    return createPaginatedResult(bets, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get specific bet details
   */
  async getBetById(userId: string, betId: string) {
    const bet = await this.prisma.bet.findFirst({
      where: { id: betId, userId },
      include: {
        selections: {
          include: {
            match: {
              include: {
                sport: { select: { id: true, name: true, slug: true, iconKey: true } },
                league: { select: { id: true, name: true, slug: true, country: true, logoUrl: true } },
                homeTeam: { select: { id: true, name: true, shortName: true, logoUrl: true } },
                awayTeam: { select: { id: true, name: true, shortName: true, logoUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!bet) {
      throw new NotFoundException('Bet not found');
    }

    // Calculate cashout value if bet is still pending
    let cashoutValue = null;
    if (bet.status === 'pending') {
      cashoutValue = await this.calculateCashoutValue(bet);
    }

    return {
      ...bet,
      cashoutValue,
    };
  }

  /**
   * Calculate cashout value for a bet
   */
  private async calculateCashoutValue(bet: any) {
    // Simple cashout calculation: stake * (current cumulative odds / original odds) * margin
    const margin = 0.9; // 10% margin for cashout

    let currentCumulativeOdds = new Decimal(1);
    let allSettled = true;
    let anyLost = false;

    for (const selection of bet.selections) {
      // Check if match has ended
      const match = await this.prisma.match.findUnique({
        where: { id: selection.matchId },
        select: { status: true, result: true },
      });

      if (match?.status === 'finished') {
        // Selection is settled
        if (selection.status === 'lost') {
          anyLost = true;
          break;
        }
        // Won selections contribute their odds
        currentCumulativeOdds = currentCumulativeOdds.mul(selection.oddsAtPlacement);
      } else {
        // Still pending, use current odds
        allSettled = false;
        const currentOdd = await this.prisma.odd.findUnique({
          where: { id: selection.oddId },
          select: { value: true, isActive: true },
        });

        if (!currentOdd || !currentOdd.isActive) {
          // Odds no longer available, use original
          currentCumulativeOdds = currentCumulativeOdds.mul(selection.oddsAtPlacement);
        } else {
          currentCumulativeOdds = currentCumulativeOdds.mul(currentOdd.value);
        }
      }
    }

    if (anyLost) {
      return null; // Cannot cashout a losing bet
    }

    const cashoutValue = new Decimal(bet.stake)
      .mul(currentCumulativeOdds)
      .div(bet.totalOdds)
      .mul(margin);

    // Ensure cashout is at least some portion of stake
    const minCashout = new Decimal(bet.stake).mul(0.1);
    return cashoutValue.lt(minCashout) ? minCashout : cashoutValue;
  }

  /**
   * Cashout a bet
   */
  async cashoutBet(userId: string, betId: string) {
    const bet = await this.prisma.bet.findFirst({
      where: { id: betId, userId },
      include: {
        selections: true,
      },
    });

    if (!bet) {
      throw new NotFoundException('Bet not found');
    }

    if (bet.status !== 'pending') {
      throw new BadRequestException('Only pending bets can be cashed out');
    }

    // Check if any selections are from finished matches with losses
    for (const selection of bet.selections) {
      if (selection.status === 'lost') {
        throw new BadRequestException('Cannot cashout - bet has lost selections');
      }
    }

    const cashoutValue = await this.calculateCashoutValue(bet);

    if (!cashoutValue) {
      throw new BadRequestException('Cashout not available for this bet');
    }

    // Get wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update bet status
      const updatedBet = await tx.bet.update({
        where: { id: betId },
        data: {
          status: 'cashout',
          actualWin: cashoutValue,
          settledAt: new Date(),
        },
      });

      // Update all selections to void
      await tx.betSelection.updateMany({
        where: { betId },
        data: {
          status: 'void',
          settledAt: new Date(),
        },
      });

      // Credit cashout amount to wallet
      const currentBalance = bet.coinType === 'GC' ? wallet.gcBalance : wallet.scBalance;
      const newBalance = new Decimal(currentBalance).plus(cashoutValue);

      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'game_win', // Using game_win type for cashout winnings
          coinType: bet.coinType,
          amount: cashoutValue,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'bet',
          referenceId: betId,
          status: 'completed',
          metadata: {
            type: 'cashout',
            originalStake: bet.stake,
            potentialWin: bet.potentialWin,
          },
        },
      });

      const updateData: any = { version: { increment: 1 } };
      if (bet.coinType === 'GC') {
        updateData.gcBalance = newBalance;
      } else {
        updateData.scBalance = newBalance;
        updateData.scLifetimeEarned = new Decimal(wallet.scLifetimeEarned).plus(cashoutValue);
      }

      // Use updateMany for proper optimistic locking check
      const walletUpdateResult = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: updateData,
      });

      if (walletUpdateResult.count === 0) {
        this.logger.error(`Optimistic locking failed for cashout - wallet ${wallet.id}`);
        throw new ConflictException('Wallet was modified by another transaction. Please retry.');
      }

      // Fetch updated wallet for response
      const updatedWallet = await tx.wallet.findUnique({
        where: { id: wallet.id },
      });

      if (!updatedWallet) {
        throw new BadRequestException('Failed to retrieve updated wallet');
      }

      // Publish balance update event
      await this.redis.publish('wallet:balance_updated', {
        userId,
        gcBalance: updatedWallet.gcBalance.toString(),
        scBalance: updatedWallet.scBalance.toString(),
      });

      return {
        success: true,
        cashoutAmount: cashoutValue,
        bet: updatedBet,
        wallet: {
          gcBalance: updatedWallet.gcBalance,
          scBalance: updatedWallet.scBalance,
        },
      };
    });
  }

  // ============================================================================
  // BET SETTLEMENT ENGINE
  // ============================================================================

  /**
   * Update match result and trigger bet settlement
   * Called when a match ends (from external sports data provider)
   */
  async updateMatchResult(
    matchId: string,
    result: {
      homeScore: number;
      awayScore: number;
      result: 'home' | 'draw' | 'away';
    },
  ) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.status === 'finished') {
      this.logger.warn(`Match ${matchId} is already finished`);
      return { settled: 0 };
    }

    // Update match with result
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'finished',
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        result: result.result,
        endedAt: new Date(),
      },
    });

    // Deactivate all markets for this match
    await this.prisma.market.updateMany({
      where: { matchId },
      data: { isActive: false, isSuspended: true },
    });

    // Clear cache
    await this.redis.del(`sports:match:${matchId}`);
    await this.redis.del('sports:live-matches');
    await this.redis.del('sports:featured-matches');

    // Settle all pending bets for this match
    const settledCount = await this.settlePendingBetsForMatch(matchId);

    this.logger.log(
      `Match ${matchId} finished with result ${result.result} (${result.homeScore}-${result.awayScore}). Settled ${settledCount} bet selections.`,
    );

    return { settled: settledCount };
  }

  /**
   * Settle all pending bet selections for a completed match
   */
  async settlePendingBetsForMatch(matchId: string): Promise<number> {
    // Get match with its markets and odds
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        markets: {
          include: {
            odds: true,
          },
        },
      },
    });

    if (!match || match.status !== 'finished' || !match.result) {
      this.logger.warn(`Match ${matchId} is not ready for settlement`);
      return 0;
    }

    // Get all pending bet selections for this match
    const pendingSelections = await this.prisma.betSelection.findMany({
      where: {
        matchId,
        status: 'pending',
      },
      include: {
        bet: true,
        odd: {
          include: {
            market: true,
          },
        },
      },
    });

    this.logger.log(
      `Found ${pendingSelections.length} pending selections for match ${matchId}`,
    );

    let settledCount = 0;

    for (const selection of pendingSelections) {
      const selectionStatus = this.determineSelectionOutcome(
        selection,
        match,
      );

      // Update selection status
      await this.prisma.betSelection.update({
        where: { id: selection.id },
        data: {
          status: selectionStatus,
          settledAt: new Date(),
        },
      });

      settledCount++;

      // Check if all selections for this bet are now settled
      await this.checkAndSettleBet(selection.betId);
    }

    return settledCount;
  }

  /**
   * Determine if a bet selection is won, lost, or void
   */
  private determineSelectionOutcome(
    selection: any,
    match: any,
  ): 'won' | 'lost' | 'void' {
    const market = selection.odd.market;
    const marketType = market.type;
    const userSelection = selection.selection;
    const matchResult = match.result;
    const homeScore = match.homeScore ?? 0;
    const awayScore = match.awayScore ?? 0;
    const totalGoals = homeScore + awayScore;

    // Handle match cancellation/postponement
    if (['cancelled', 'postponed'].includes(match.status)) {
      return 'void';
    }

    switch (marketType) {
      case '1x2':
        // Match result: home, draw, away
        return userSelection === matchResult ? 'won' : 'lost';

      case 'over_under':
        // Total goals over/under a line
        const ouLine = market.line ? Number(market.line) : 2.5;
        if (userSelection === 'over') {
          return totalGoals > ouLine ? 'won' : 'lost';
        } else {
          return totalGoals < ouLine ? 'won' : 'lost';
        }

      case 'both_score':
        // Both teams to score: yes/no
        const bothScored = homeScore > 0 && awayScore > 0;
        if (userSelection === 'yes') {
          return bothScored ? 'won' : 'lost';
        } else {
          return bothScored ? 'lost' : 'won';
        }

      case 'double_chance':
        // Home/Draw (1X), Away/Draw (X2), Home/Away (12)
        if (userSelection === '1x') {
          return matchResult === 'home' || matchResult === 'draw' ? 'won' : 'lost';
        } else if (userSelection === 'x2') {
          return matchResult === 'draw' || matchResult === 'away' ? 'won' : 'lost';
        } else if (userSelection === '12') {
          return matchResult === 'home' || matchResult === 'away' ? 'won' : 'lost';
        }
        break;

      case 'handicap':
        // Asian handicap
        const handicapLine = market.line ? Number(market.line) : 0;
        let adjustedHomeScore = homeScore;
        let adjustedAwayScore = awayScore;

        if (userSelection === 'home') {
          adjustedHomeScore += handicapLine;
        } else {
          adjustedAwayScore -= handicapLine;
        }

        if (adjustedHomeScore > adjustedAwayScore) {
          return userSelection === 'home' ? 'won' : 'lost';
        } else if (adjustedHomeScore < adjustedAwayScore) {
          return userSelection === 'away' ? 'won' : 'lost';
        } else {
          return 'void'; // Push - refund
        }

      case 'correct_score':
        // Exact score prediction
        const predictedScore = userSelection; // e.g., "2-1"
        const actualScore = `${homeScore}-${awayScore}`;
        return predictedScore === actualScore ? 'won' : 'lost';

      case 'odd_even':
        // Total goals odd or even
        const isEven = totalGoals % 2 === 0;
        if (userSelection === 'even') {
          return isEven ? 'won' : 'lost';
        } else {
          return isEven ? 'lost' : 'won';
        }

      default:
        this.logger.warn(`Unknown market type: ${marketType}`);
        return 'void';
    }

    return 'void';
  }

  /**
   * Check if all selections for a bet are settled and finalize the bet
   */
  private async checkAndSettleBet(betId: string): Promise<void> {
    const bet = await this.prisma.bet.findUnique({
      where: { id: betId },
      include: {
        selections: true,
        user: true,
      },
    });

    if (!bet || bet.status !== 'pending') {
      return;
    }

    // Check if all selections are settled
    const allSettled = bet.selections.every((s) => s.status !== 'pending');

    if (!allSettled) {
      return; // Wait for all selections to settle
    }

    // Determine bet outcome
    const hasLoss = bet.selections.some((s) => s.status === 'lost');
    const allVoid = bet.selections.every((s) => s.status === 'void');
    const someVoid = bet.selections.some((s) => s.status === 'void');

    let betStatus: 'won' | 'lost' | 'void';
    let actualWin = new Decimal(0);

    if (allVoid) {
      // All selections void - refund the stake
      betStatus = 'void';
      actualWin = new Decimal(bet.stake);
    } else if (hasLoss) {
      // At least one loss - bet loses
      betStatus = 'lost';
      actualWin = new Decimal(0);
    } else {
      // All remaining selections won
      betStatus = 'won';

      // Calculate actual win with void selections removed
      const wonSelections = bet.selections.filter((s) => s.status === 'won');

      if (bet.type === 'single') {
        actualWin = new Decimal(bet.stake).mul(bet.totalOdds);
      } else {
        // Combo: recalculate odds excluding void selections
        let adjustedOdds = new Decimal(1);
        for (const selection of wonSelections) {
          adjustedOdds = adjustedOdds.mul(selection.oddsAtPlacement);
        }
        actualWin = new Decimal(bet.stake).mul(adjustedOdds);
      }
    }

    // Update bet
    await this.prisma.bet.update({
      where: { id: betId },
      data: {
        status: betStatus,
        actualWin,
        settledAt: new Date(),
      },
    });

    // Process winnings if any
    if (actualWin.gt(0)) {
      await this.processWinnings(bet.userId, bet.id, actualWin, bet.coinType);
    }

    // Send notification
    await this.sendBetSettlementNotification(bet.userId, betId, betStatus, actualWin);

    this.logger.log(
      `Bet ${betId} settled as ${betStatus} with win amount: ${actualWin.toString()}`,
    );
  }

  /**
   * Credit winnings to user's wallet
   */
  private async processWinnings(
    userId: string,
    betId: string,
    amount: Decimal,
    coinType: string,
  ): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      this.logger.error(`Wallet not found for user ${userId}`);
      return;
    }

    const currentBalance = coinType === 'GC' ? wallet.gcBalance : wallet.scBalance;
    const newBalance = currentBalance.add(amount);

    await this.prisma.$transaction(async (tx) => {
      // Create win transaction
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'game_win',
          coinType,
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          referenceType: 'bet',
          referenceId: betId,
          status: 'completed',
          metadata: {
            type: 'bet_settlement',
          },
        },
      });

      // Update wallet
      const updateData: any = { version: { increment: 1 } };
      if (coinType === 'GC') {
        updateData.gcBalance = newBalance;
      } else {
        updateData.scBalance = newBalance;
        updateData.scLifetimeEarned = wallet.scLifetimeEarned.add(amount);
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: updateData,
      });
    });

    // Publish balance update
    await this.redis.publish('wallet:balance_updated', {
      userId,
      coinType,
      newBalance: newBalance.toString(),
    });
  }

  /**
   * Send bet settlement notification to user
   */
  private async sendBetSettlementNotification(
    userId: string,
    betId: string,
    status: string,
    amount: Decimal,
  ): Promise<void> {
    const title = status === 'won' ? 'You Won!' :
                  status === 'lost' ? 'Bet Settled' :
                  'Bet Voided';

    const message = status === 'won'
      ? `Congratulations! Your bet won ${amount.toFixed(2)}!`
      : status === 'lost'
        ? 'Your bet was not successful. Better luck next time!'
        : `Your bet has been voided. ${amount.toFixed(2)} has been refunded.`;

    try {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'bet',
          title,
          message,
          data: {
            betId,
            status,
            amount: amount.toString(),
          },
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to send settlement notification: ${error}`);
    }
  }

  /**
   * Get pending bets count for a match
   */
  async getPendingBetsCountForMatch(matchId: string): Promise<number> {
    return this.prisma.betSelection.count({
      where: {
        matchId,
        status: 'pending',
      },
    });
  }

  /**
   * Get all unsettled matches that have ended
   */
  async getUnsettledFinishedMatches(): Promise<any[]> {
    return this.prisma.match.findMany({
      where: {
        status: 'finished',
        result: { not: null },
        betSelections: {
          some: {
            status: 'pending',
          },
        },
      },
      select: {
        id: true,
        homeScore: true,
        awayScore: true,
        result: true,
        endedAt: true,
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        _count: {
          select: {
            betSelections: {
              where: { status: 'pending' },
            },
          },
        },
      },
    });
  }

  /**
   * Void all bets for a cancelled/postponed match
   */
  async voidBetsForMatch(matchId: string): Promise<number> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Get all pending selections for this match
    const pendingSelections = await this.prisma.betSelection.findMany({
      where: {
        matchId,
        status: 'pending',
      },
    });

    // Update all selections to void
    await this.prisma.betSelection.updateMany({
      where: {
        matchId,
        status: 'pending',
      },
      data: {
        status: 'void',
        settledAt: new Date(),
      },
    });

    // Check and settle each affected bet
    const betIds = [...new Set(pendingSelections.map((s) => s.betId))];
    for (const betId of betIds) {
      await this.checkAndSettleBet(betId);
    }

    this.logger.log(
      `Voided ${pendingSelections.length} selections for match ${matchId}`,
    );

    return pendingSelections.length;
  }
}
