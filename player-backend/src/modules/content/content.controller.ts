import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ContentService, VideosQueryDto, TrackVideoViewDto } from './content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('videos')
  @ApiOperation({ summary: 'Get paginated videos with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category slug' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['newest', 'popular', 'featured'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'isLive', required: false, type: Boolean, description: 'Filter live streams only' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of videos',
  })
  async getVideos(@Query() query: VideosQueryDto) {
    return this.contentService.getVideos(query);
  }

  @Public()
  @Get('videos/featured')
  @ApiOperation({ summary: 'Get featured videos for WBCTV homepage' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of featured videos',
  })
  async getFeaturedVideos() {
    return this.contentService.getFeaturedVideos();
  }

  @Public()
  @Get('videos/live')
  @ApiOperation({ summary: 'Get live streams' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of current live streams',
  })
  async getLiveVideos() {
    return this.contentService.getLiveVideos();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all video categories' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of video categories with video counts',
  })
  async getCategories() {
    return this.contentService.getCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Get('watch-history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user video watch history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns user watch history with progress',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getWatchHistory(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.contentService.getUserWatchHistory(userId, query);
  }

  @Public()
  @Get('videos/:id')
  @ApiOperation({ summary: 'Get video by ID' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns video details',
  })
  @ApiResponse({
    status: 404,
    description: 'Video not found',
  })
  async getVideoById(@Param('id') id: string) {
    return this.contentService.getVideoById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('videos/:id/track')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Track video view and watch progress' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        watchedSeconds: {
          type: 'number',
          description: 'Total seconds watched',
          example: 120,
        },
        completed: {
          type: 'boolean',
          description: 'Whether the video was completed',
          example: false,
        },
      },
      required: ['watchedSeconds'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'View tracking recorded successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Video not found',
  })
  async trackVideoView(
    @CurrentUser('id') userId: string,
    @Param('id') videoId: string,
    @Body() dto: TrackVideoViewDto,
  ) {
    return this.contentService.trackVideoView(
      userId,
      videoId,
      dto.watchedSeconds,
      dto.completed,
    );
  }
}
