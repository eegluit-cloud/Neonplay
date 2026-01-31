import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import {
  SportsService,
  MatchesQueryDto,
  PlaceBetDto,
  UserBetsQueryDto,
} from './sports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Sports')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all available sports' })
  async getSports() {
    return this.sportsService.getSports();
  }

  @Public()
  @Get('leagues')
  @ApiOperation({ summary: 'Get all leagues' })
  async getAllLeagues() {
    return this.sportsService.getAllLeagues();
  }

  @Public()
  @Get('leagues/:sportSlug')
  @ApiOperation({ summary: 'Get leagues for a specific sport' })
  @ApiParam({ name: 'sportSlug', description: 'Sport slug' })
  async getLeaguesBySport(@Param('sportSlug') sportSlug: string) {
    return this.sportsService.getLeaguesBySport(sportSlug);
  }

  @Public()
  @Get(':slug/matches')
  @ApiOperation({ summary: 'Get matches by sport slug' })
  @ApiParam({ name: 'slug', description: 'Sport slug' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['upcoming', 'live', 'finished'] })
  async getMatchesBySport(
    @Param('slug') sportSlug: string,
    @Query() query: MatchesQueryDto,
  ) {
    return this.sportsService.getMatchesBySport(sportSlug, query);
  }

  @Public()
  @Get('matches')
  @ApiOperation({ summary: 'Get matches with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sportSlug', required: false, type: String, description: 'Filter by sport' })
  @ApiQuery({ name: 'leagueSlug', required: false, type: String, description: 'Filter by league' })
  @ApiQuery({ name: 'status', required: false, enum: ['upcoming', 'live', 'finished'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Start date filter (ISO)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'End date filter (ISO)' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  async getMatches(@Query() query: MatchesQueryDto) {
    return this.sportsService.getMatches(query);
  }

  @Public()
  @Get('matches/live')
  @ApiOperation({ summary: 'Get live matches only' })
  async getLiveMatches() {
    return this.sportsService.getLiveMatches();
  }

  @Public()
  @Get('league/:slug/matches')
  @ApiOperation({ summary: 'Get matches by league slug' })
  @ApiParam({ name: 'slug', description: 'League slug' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['upcoming', 'live', 'finished'] })
  async getMatchesByLeague(
    @Param('slug') leagueSlug: string,
    @Query() query: MatchesQueryDto,
  ) {
    return this.sportsService.getMatchesByLeague(leagueSlug, query);
  }

  @Public()
  @Get('matches/featured')
  @ApiOperation({ summary: 'Get featured matches for homepage' })
  async getFeaturedMatches() {
    return this.sportsService.getFeaturedMatches();
  }

  @Public()
  @Get('matches/:id')
  @ApiOperation({ summary: 'Get match details with all markets and odds' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  async getMatchById(@Param('id') id: string) {
    return this.sportsService.getMatchById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bets')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Place a bet (single or combo)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['single', 'combo'],
          description: 'Bet type',
        },
        stake: {
          type: 'number',
          description: 'Stake amount',
        },
        coinType: {
          type: 'string',
          enum: ['GC', 'SC'],
          description: 'Coin type to bet with',
        },
        selections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              matchId: { type: 'string' },
              marketId: { type: 'string' },
              oddId: { type: 'string' },
              selection: { type: 'string' },
            },
            required: ['matchId', 'marketId', 'oddId', 'selection'],
          },
          description: 'Bet selections',
        },
      },
      required: ['type', 'stake', 'coinType', 'selections'],
    },
  })
  async placeBet(
    @CurrentUser('id') userId: string,
    @Body() betData: PlaceBetDto,
  ) {
    return this.sportsService.placeBet(userId, betData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bets')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user bet history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'won', 'lost', 'void', 'cashout'] })
  @ApiQuery({ name: 'type', required: false, enum: ['single', 'combo'] })
  @ApiQuery({ name: 'dateFrom', required: false, type: String, description: 'Start date filter (ISO)' })
  @ApiQuery({ name: 'dateTo', required: false, type: String, description: 'End date filter (ISO)' })
  async getUserBets(
    @CurrentUser('id') userId: string,
    @Query() query: UserBetsQueryDto,
  ) {
    return this.sportsService.getUserBets(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bets/:betId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get specific bet details' })
  @ApiParam({ name: 'betId', description: 'Bet ID' })
  async getBetById(
    @CurrentUser('id') userId: string,
    @Param('betId') betId: string,
  ) {
    return this.sportsService.getBetById(userId, betId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bets/:betId/cashout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cashout a pending bet' })
  @ApiParam({ name: 'betId', description: 'Bet ID' })
  async cashoutBet(
    @CurrentUser('id') userId: string,
    @Param('betId') betId: string,
  ) {
    return this.sportsService.cashoutBet(userId, betId);
  }
}
