import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PrizesService, PrizesQueryDto, ShippingAddress } from './prizes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Prizes')
@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get available prizes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'prizeType', required: false, type: String })
  @ApiQuery({ name: 'minValue', required: false, type: Number })
  @ApiQuery({ name: 'maxValue', required: false, type: Number })
  async getPrizes(@Query() query: PrizesQueryDto) {
    return this.prizesService.getPrizes(query);
  }

  @Public()
  @Get('store')
  @ApiOperation({ summary: 'Get store prizes purchasable with SC' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'minValue', required: false, type: Number })
  @ApiQuery({ name: 'maxValue', required: false, type: Number })
  async getStorePrizes(@Query() query: PrizesQueryDto) {
    return this.prizesService.getStorePrizes(query);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get prize categories' })
  async getPrizeCategories() {
    return this.prizesService.getPrizeCategories();
  }

  @Public()
  @Get('tiers')
  @ApiOperation({ summary: 'Get prize tiers for leaderboards' })
  async getPrizeTiers() {
    return this.prizesService.getPrizeTiers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/redemptions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user prize redemption history' })
  async getUserRedemptions(@CurrentUser('id') userId: string) {
    return this.prizesService.getUserRedemptions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem/:prizeId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Redeem a prize from the store' })
  async redeemPrize(
    @CurrentUser('id') userId: string,
    @Param('prizeId') prizeId: string,
    @Body() body: ShippingAddress,
  ) {
    return this.prizesService.redeemPrize(userId, prizeId, body);
  }
}
