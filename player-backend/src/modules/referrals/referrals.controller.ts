import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Referrals')
@Controller('referrals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('code')
  @ApiOperation({ summary: 'Get user referral code and link' })
  async getUserReferralCode(@CurrentUser('id') userId: string) {
    return this.referralsService.getUserReferralCode(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get referral statistics' })
  async getReferralStats(@CurrentUser('id') userId: string) {
    return this.referralsService.getReferralStats(userId);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get list of referred users' })
  async getReferralsList(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.referralsService.getReferralsList(userId, query);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a referral code' })
  async applyReferralCode(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string },
  ) {
    return this.referralsService.applyReferralCode(userId, body.code);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get referral status (whether user was referred)' })
  async getReferralStatus(@CurrentUser('id') userId: string) {
    return this.referralsService.getReferralStatus(userId);
  }
}
