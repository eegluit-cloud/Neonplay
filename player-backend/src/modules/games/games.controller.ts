import {
  Controller,
  Get,
  Post,
  Delete,
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
import { GamesService, GamesQueryDto } from './games.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get paginated games list with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category slug' })
  @ApiQuery({ name: 'provider', required: false, type: String, description: 'Provider slug' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['popular', 'newest', 'name', 'rtp'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getGames(@Query() query: GamesQueryDto) {
    return this.gamesService.getGames(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured games for homepage' })
  async getFeaturedGames() {
    return this.gamesService.getFeaturedGames();
  }

  @Public()
  @Get('hot')
  @ApiOperation({ summary: 'Get trending/hot games' })
  async getHotGames() {
    return this.gamesService.getHotGames();
  }

  @Public()
  @Get('new')
  @ApiOperation({ summary: 'Get newly added games' })
  async getNewGames() {
    return this.gamesService.getNewGames();
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all game categories' })
  async getCategories() {
    return this.gamesService.getCategories();
  }

  @Public()
  @Get('providers')
  @ApiOperation({ summary: 'Get all game providers' })
  async getProviders() {
    return this.gamesService.getProviders();
  }

  @Public()
  @Get('category/:slug')
  @ApiOperation({ summary: 'Get games by category' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  async getGamesByCategory(
    @Param('slug') slug: string,
    @Query() query: PaginationDto,
  ) {
    return this.gamesService.getGamesByCategory(slug, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user favorite games' })
  async getUserFavorites(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.gamesService.getUserFavorites(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/:gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add game to favorites' })
  @ApiParam({ name: 'gameId', description: 'Game ID' })
  async addToFavorites(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.gamesService.addToFavorites(userId, gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('favorites/:gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove game from favorites' })
  @ApiParam({ name: 'gameId', description: 'Game ID' })
  async removeFromFavorites(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    return this.gamesService.removeFromFavorites(userId, gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user recently played games' })
  async getUserRecentGames(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.gamesService.getUserRecentGames(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user game session history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getGameHistory(
    @CurrentUser('id') userId: string,
    @Query() query: any,
  ) {
    return this.gamesService.getGameHistory(userId, query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get single game details by slug' })
  @ApiParam({ name: 'slug', description: 'Game slug' })
  async getGameBySlug(@Param('slug') slug: string) {
    return this.gamesService.getGameBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/launch')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Launch game and get session URL' })
  @ApiParam({ name: 'slug', description: 'Game slug' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        coinType: {
          type: 'string',
          enum: ['GC', 'SC'],
          description: 'Coin type to play with',
        },
      },
      required: ['coinType'],
    },
  })
  async launchGame(
    @CurrentUser('id') userId: string,
    @Param('slug') slug: string,
    @Body('currency') currency?: string,
  ) {
    return this.gamesService.launchGame(userId, slug, currency as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':gameId/is-favorited')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if game is in user favorites' })
  @ApiParam({ name: 'gameId', description: 'Game ID' })
  async isGameFavorited(
    @CurrentUser('id') userId: string,
    @Param('gameId') gameId: string,
  ) {
    const isFavorited = await this.gamesService.isGameFavorited(userId, gameId);
    return { isFavorited };
  }

  @Public()
  @Get(':slug/stats')
  @ApiOperation({ summary: 'Get game statistics' })
  @ApiParam({ name: 'slug', description: 'Game slug' })
  async getGameStats(@Param('slug') slug: string) {
    return this.gamesService.getGameStats(slug);
  }
}
