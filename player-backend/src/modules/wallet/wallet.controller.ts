import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get wallet balances' })
  async getWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query() query: any,
  ) {
    return this.walletService.getTransactions(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get transaction details' })
  async getTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') transactionId: string,
  ) {
    return this.walletService.getTransactionById(userId, transactionId);
  }

  @Public()
  @Get('packages')
  @ApiOperation({ summary: 'Get available coin packages' })
  async getPackages() {
    return this.walletService.getCoinPackages();
  }

  @Public()
  @Get('payment-methods')
  @ApiOperation({ summary: 'Get available payment methods' })
  async getPaymentMethods() {
    return this.walletService.getPaymentMethods();
  }

  @Public()
  @Get('crypto-options')
  @ApiOperation({ summary: 'Get crypto payment options' })
  async getCryptoOptions() {
    return this.walletService.getCryptoOptions();
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate coin purchase' })
  async initiatePurchase(
    @CurrentUser('id') userId: string,
    @Body() body: { packageId: string; paymentMethod: string },
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || '';
    return this.walletService.initiatePurchase(
      userId,
      body.packageId,
      body.paymentMethod,
      ipAddress,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('purchase/confirm')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm purchase after payment' })
  async confirmPurchase(
    @CurrentUser('id') userId: string,
    @Body() body: { purchaseId: string; paymentIntentId: string },
  ) {
    return this.walletService.confirmPurchase(
      userId,
      body.purchaseId,
      body.paymentIntentId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request SC redemption' })
  async requestRedemption(
    @CurrentUser('id') userId: string,
    @Body() body: { scAmount: number; method: string; payoutDetails: any },
  ) {
    return this.walletService.requestRedemption(
      userId,
      body.scAmount,
      body.method,
      body.payoutDetails,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('redemptions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get redemption history' })
  async getRedemptions(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.walletService.getRedemptions(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('bonuses')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get available bonuses' })
  async getBonuses(@CurrentUser('id') userId: string) {
    return this.walletService.getAvailableBonuses(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bonuses/:type/claim')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Claim a bonus' })
  async claimBonus(
    @CurrentUser('id') userId: string,
    @Param('type') bonusType: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.walletService.claimBonus(userId, bonusType);
  }
}
