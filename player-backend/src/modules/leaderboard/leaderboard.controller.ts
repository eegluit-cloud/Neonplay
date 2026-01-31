import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  LeaderboardService,
  LeaderboardType,
  LeaderboardPeriod,
} from './leaderboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

const VALID_TYPES: LeaderboardType[] = ['biggest_win', 'most_wagered', 'most_played'];
const VALID_PERIODS: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly'];

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active leaderboards with top 10 entries' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active leaderboards with their top entries',
  })
  async getActiveLeaderboards() {
    return this.leaderboardService.getActiveLeaderboards();
  }

  @Public()
  @Get('history')
  @ApiOperation({ summary: 'Get historical completed leaderboards' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of completed leaderboards',
  })
  async getLeaderboardHistory(@Query() query: PaginationDto) {
    return this.leaderboardService.getLeaderboardHistory(query);
  }

  @Public()
  @Get('prizes/:period')
  @ApiOperation({ summary: 'Get prize configuration for a leaderboard period' })
  @ApiParam({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    description: 'Leaderboard period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns prize tiers for the specified period',
  })
  async getLeaderboardPrizes(@Param('period') period: string) {
    if (!VALID_PERIODS.includes(period as LeaderboardPeriod)) {
      throw new BadRequestException(
        `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}`,
      );
    }
    return this.leaderboardService.getLeaderboardPrizes(period as LeaderboardPeriod);
  }

  @Public()
  @Get(':type/:period')
  @ApiOperation({ summary: 'Get specific leaderboard with entries' })
  @ApiParam({
    name: 'type',
    enum: ['biggest_win', 'most_wagered', 'most_played'],
    description: 'Leaderboard type',
  })
  @ApiParam({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    description: 'Leaderboard period',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (max 100)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the leaderboard with paginated entries',
  })
  @ApiResponse({
    status: 404,
    description: 'No active leaderboard found for the given type and period',
  })
  async getLeaderboard(
    @Param('type') type: string,
    @Param('period') period: string,
    @Query() query: PaginationDto,
  ) {
    // Validate type
    if (!VALID_TYPES.includes(type as LeaderboardType)) {
      throw new BadRequestException(
        `Invalid leaderboard type. Must be one of: ${VALID_TYPES.join(', ')}`,
      );
    }

    // Validate period
    if (!VALID_PERIODS.includes(period as LeaderboardPeriod)) {
      throw new BadRequestException(
        `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}`,
      );
    }

    return this.leaderboardService.getLeaderboard(
      type as LeaderboardType,
      period as LeaderboardPeriod,
      query,
    );
  }

  @Public()
  @Get(':type/:period/realtime')
  @ApiOperation({ summary: 'Get real-time top players from cache' })
  @ApiParam({
    name: 'type',
    enum: ['biggest_win', 'most_wagered', 'most_played'],
    description: 'Leaderboard type',
  })
  @ApiParam({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    description: 'Leaderboard period',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of top players to return (default: 10, max: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns real-time top players from Redis cache',
  })
  async getRealtimeTopPlayers(
    @Param('type') type: string,
    @Param('period') period: string,
    @Query('limit') limit?: number,
  ) {
    // Validate type
    if (!VALID_TYPES.includes(type as LeaderboardType)) {
      throw new BadRequestException(
        `Invalid leaderboard type. Must be one of: ${VALID_TYPES.join(', ')}`,
      );
    }

    // Validate period
    if (!VALID_PERIODS.includes(period as LeaderboardPeriod)) {
      throw new BadRequestException(
        `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}`,
      );
    }

    const safeLimit = Math.min(Math.max(limit || 10, 1), 50);

    return this.leaderboardService.getRealtimeTopPlayers(
      type as LeaderboardType,
      period as LeaderboardPeriod,
      safeLimit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':type/:period/my-position')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user position on a leaderboard' })
  @ApiParam({
    name: 'type',
    enum: ['biggest_win', 'most_wagered', 'most_played'],
    description: 'Leaderboard type',
  })
  @ApiParam({
    name: 'period',
    enum: ['daily', 'weekly', 'monthly'],
    description: 'Leaderboard period',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user position on the leaderboard',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'No active leaderboard found for the given type and period',
  })
  async getUserPosition(
    @CurrentUser('id') userId: string,
    @Param('type') type: string,
    @Param('period') period: string,
  ) {
    // Validate type
    if (!VALID_TYPES.includes(type as LeaderboardType)) {
      throw new BadRequestException(
        `Invalid leaderboard type. Must be one of: ${VALID_TYPES.join(', ')}`,
      );
    }

    // Validate period
    if (!VALID_PERIODS.includes(period as LeaderboardPeriod)) {
      throw new BadRequestException(
        `Invalid period. Must be one of: ${VALID_PERIODS.join(', ')}`,
      );
    }

    return this.leaderboardService.getUserPosition(
      userId,
      type as LeaderboardType,
      period as LeaderboardPeriod,
    );
  }
}
