import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VipService } from './vip.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('VIP')
@Controller('vip')
export class VipController {
  constructor(private readonly vipService: VipService) {}

  @Public()
  @Get('tiers')
  @ApiOperation({ summary: 'Get all VIP tiers with benefits' })
  async getAllTiers() {
    return this.vipService.getAllTiers();
  }

  @Public()
  @Get('levels')
  @ApiOperation({ summary: 'Get all VIP levels (alias for tiers)' })
  async getAllLevels() {
    return this.vipService.getAllTiers();
  }

  @Public()
  @Get('tiers/requirements')
  @ApiOperation({ summary: 'Get VIP tier requirements summary' })
  async getTierRequirements() {
    return this.vipService.getTierRequirements();
  }

  @Public()
  @Get('page-content')
  @ApiOperation({ summary: 'Get VIP page content and settings' })
  async getPageContent() {
    return this.vipService.getPageContent();
  }

  @OptionalAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get('status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user VIP status with tier, XP, and progress (optional auth)' })
  async getUserVipStatus(@CurrentUser('id') userId?: string) {
    if (!userId) {
      // Return default/guest VIP status when not authenticated
      return {
        tier: null,
        currentXp: 0,
        nextTier: null,
        progress: 0,
        benefits: [],
        isGuest: true,
      };
    }
    return this.vipService.getUserVipStatus(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('xp-history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user XP earning history' })
  async getUserXpHistory(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.vipService.getUserXpHistory(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('benefits')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current tier benefits for user' })
  async getUserBenefits(@CurrentUser('id') userId: string) {
    return this.vipService.getUserBenefits(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cashback/claim')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Claim available cashback' })
  async claimCashback(@CurrentUser('id') userId: string) {
    return this.vipService.claimCashback(userId);
  }
}
