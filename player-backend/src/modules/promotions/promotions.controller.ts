import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active promotions' })
  async getActivePromotions() {
    return this.promotionsService.getActivePromotions();
  }

  @Public()
  @Get('spin-wheel/config')
  @ApiOperation({ summary: 'Get spin wheel configuration' })
  async getSpinWheelConfig() {
    return this.promotionsService.getSpinWheelConfig();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get promotion details by slug' })
  async getPromotionBySlug(@Param('slug') slug: string) {
    return this.promotionsService.getPromotionBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/claim')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Claim a promotion' })
  async claimPromotion(
    @CurrentUser('id') userId: string,
    @Param('slug') slug: string,
  ) {
    return this.promotionsService.claimPromotion(userId, slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post('code/apply')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply a promotional code' })
  async applyPromoCode(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string },
  ) {
    return this.promotionsService.applyPromoCode(userId, body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('spin-wheel/spin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Spin the wheel' })
  async spinWheel(@CurrentUser('id') userId: string) {
    return this.promotionsService.spinWheel(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/history')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user promotion history' })
  async getUserPromotions(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.promotionsService.getUserPromotions(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/active')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user active promotions with wagering progress' })
  async getUserActivePromotions(@CurrentUser('id') userId: string) {
    return this.promotionsService.getUserActivePromotions(userId);
  }
}
