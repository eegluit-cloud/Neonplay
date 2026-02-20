import {
  Controller,
  Get,
  Post,
  Patch,
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
  @Patch('currency')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update primary currency' })
  async setPrimaryCurrency(
    @CurrentUser('id') userId: string,
    @Body() body: { currency: string },
  ) {
    return this.walletService.setPrimaryCurrency(userId, body.currency);
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
  @ApiOperation({ summary: 'Get available deposit packages' })
  async getPackages() {
    return this.walletService.getDepositPackages();
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
  @Post('deposit')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate deposit' })
  async initiateDeposit(
    @CurrentUser('id') userId: string,
    @Body() body: { packageId?: string; amount: number; currency: string; paymentMethod: string },
  ) {
    return this.walletService.initiateDeposit(
      userId,
      body.currency as any,
      body.amount,
      body.paymentMethod,
      body.packageId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit/confirm')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm deposit after payment' })
  async confirmDeposit(
    @CurrentUser('id') userId: string,
    @Body() body: { depositId: string; paymentIntentId: string; txHash?: string },
  ) {
    return this.walletService.confirmDeposit(
      userId,
      body.depositId,
      body.paymentIntentId,
      body.txHash,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request withdrawal' })
  async requestWithdrawal(
    @CurrentUser('id') userId: string,
    @Body() body: { amount: number; currency: string; method: string; payoutDetails: any; toAddress?: string },
  ) {
    return this.walletService.requestWithdrawal(
      userId,
      body.currency as any,
      body.amount,
      body.method,
      body.payoutDetails,
      body.toAddress,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('withdrawals')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get withdrawal history' })
  async getWithdrawals(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.walletService.getWithdrawals(userId, query);
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
