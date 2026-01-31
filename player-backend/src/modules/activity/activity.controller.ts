import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ActivityService, ActivityQueryDto } from './activity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Public()
  @Get('recent-wins')
  @ApiOperation({ summary: 'Get recent wins feed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'gameId', required: false, type: String, description: 'Filter by game ID' })
  @ApiQuery({ name: 'coinType', required: false, enum: ['GC', 'SC'], description: 'Filter by coin type' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum win amount' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of recent wins',
  })
  async getRecentWins(@Query() query: ActivityQueryDto) {
    return this.activityService.getRecentWins(query);
  }

  @Public()
  @Get('live-bets')
  @ApiOperation({ summary: 'Get live bets feed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'gameId', required: false, type: String, description: 'Filter by game ID' })
  @ApiQuery({ name: 'coinType', required: false, enum: ['GC', 'SC'], description: 'Filter by coin type' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of live bets',
  })
  async getLiveBets(@Query() query: ActivityQueryDto) {
    return this.activityService.getLiveBets(query);
  }

  @Public()
  @Get('high-rollers')
  @ApiOperation({ summary: 'Get high rollers (large bets)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'coinType', required: false, enum: ['GC', 'SC'], description: 'Filter by coin type' })
  @ApiQuery({ name: 'minAmount', required: false, type: Number, description: 'Minimum bet amount threshold' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of high roller bets',
  })
  async getHighRollers(@Query() query: ActivityQueryDto) {
    return this.activityService.getHighRollers(query);
  }

  @Public()
  @Get('monthly-leaders')
  @ApiOperation({ summary: 'Get monthly leaderboard by wagered amount' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of top players this month',
  })
  async getMonthlyLeaders() {
    return this.activityService.getMonthlyLeaders();
  }

  @Public()
  @Get('social-proof')
  @ApiOperation({ summary: 'Get recent social proof events for real-time display' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of recent significant wins and bets',
  })
  async getSocialProofEvents() {
    return this.activityService.getSocialProofEvents();
  }

  @Public()
  @Get('social-proof/config')
  @ApiOperation({ summary: 'Get social proof display configuration' })
  @ApiResponse({
    status: 200,
    description: 'Returns social proof configuration settings',
  })
  async getSocialProofConfig() {
    return this.activityService.getSocialProofConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-activity')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user activity history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of user activities',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getUserActivity(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.activityService.getUserActivity(userId, query);
  }
}
