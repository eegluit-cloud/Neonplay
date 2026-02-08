import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Pay247Service } from './pay247.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { Pay247WebhookDto } from './dto/webhook.dto';

@ApiTags('Pay247 Payment Gateway')
@Controller('payment/pay247')
export class Pay247Controller {
  constructor(private readonly pay247Service: Pay247Service) {}

  // ==========================================
  // DEPOSIT ENDPOINTS (Authenticated)
  // ==========================================

  @Post('deposit/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Pay247 deposit' })
  @ApiResponse({
    status: 201,
    description: 'Deposit created successfully',
    schema: {
      example: {
        depositId: 'uuid',
        paymentUrl: 'https://pay247.io/pay/xxx',
        merchantOrderId: 'PAY247_DEP_xxx',
        pay247OrderId: 'P247ORD123',
      },
    },
  })
  async createDeposit(
    @CurrentUser('id') userId: string,
    @Body() createDepositDto: CreateDepositDto,
    @Req() req: Request,
  ) {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.pay247Service.createDeposit(userId, createDepositDto, clientIp);
  }

  @Get('deposit/:orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Query deposit status' })
  @ApiResponse({
    status: 200,
    description: 'Deposit status retrieved',
  })
  async getDepositStatus(
    @CurrentUser('id') userId: string,
    @Param('orderId') merchantOrderId: string,
  ) {
    return this.pay247Service.queryDepositStatus(userId, merchantOrderId);
  }

  // ==========================================
  // WITHDRAWAL ENDPOINTS (Authenticated)
  // ==========================================

  @Post('withdrawal/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Pay247 withdrawal' })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal created successfully',
    schema: {
      example: {
        withdrawalId: 'uuid',
        merchantOrderId: 'PAY247_WTH_xxx',
        pay247OrderId: 'P247PAYOUT123',
        status: 'processing',
      },
    },
  })
  async createWithdrawal(
    @CurrentUser('id') userId: string,
    @Body() createWithdrawalDto: CreateWithdrawalDto,
  ) {
    return this.pay247Service.createWithdrawal(userId, createWithdrawalDto);
  }

  @Get('withdrawal/:orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Query withdrawal status' })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal status retrieved',
  })
  async getWithdrawalStatus(
    @CurrentUser('id') userId: string,
    @Param('orderId') merchantOrderId: string,
  ) {
    return this.pay247Service.queryWithdrawalStatus(userId, merchantOrderId);
  }

  // ==========================================
  // WEBHOOK ENDPOINTS (No Auth - Signature Verified)
  // ==========================================

  @Post('webhook/deposit')
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay247 deposit webhook (called by Pay247)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleDepositWebhook(
    @Body() webhookData: Pay247WebhookDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      const result = await this.pay247Service.handleDepositWebhook(
        webhookData,
        ipAddress,
        userAgent,
      );

      // Always return 200 OK to Pay247 (even if already processed)
      return {
        code: 0,
        message: result.message,
      };
    } catch (error) {
      // Log error but return 200 to prevent retry storms
      console.error('Webhook processing error:', error);

      return {
        code: 500,
        message: 'Processing error',
      };
    }
  }

  @Post('webhook/withdrawal')
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 requests per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay247 withdrawal webhook (called by Pay247)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWithdrawalWebhook(
    @Body() webhookData: Pay247WebhookDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      const result = await this.pay247Service.handleWithdrawalWebhook(
        webhookData,
        ipAddress,
        userAgent,
      );

      return {
        code: 0,
        message: result.message,
      };
    } catch (error) {
      console.error('Webhook processing error:', error);

      return {
        code: 500,
        message: 'Processing error',
      };
    }
  }
}
