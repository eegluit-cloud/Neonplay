import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SettingsService, UpdateSettingsDto, UpdateResponsibleGamingDto } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({
    status: 200,
    description: 'Returns user settings',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getUserSettings(@CurrentUser('id') userId: string) {
    return this.settingsService.getUserSettings(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update user settings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          enum: ['dark', 'light', 'system'],
          example: 'dark',
        },
        language: {
          type: 'string',
          example: 'en',
        },
        timezone: {
          type: 'string',
          example: 'America/New_York',
        },
        currencyDisplay: {
          type: 'string',
          example: 'USD',
        },
        soundEnabled: {
          type: 'boolean',
          example: true,
        },
        animationReduced: {
          type: 'boolean',
          example: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(userId, dto);
  }

  @Get('responsible-gaming')
  @ApiOperation({ summary: 'Get responsible gaming settings' })
  @ApiResponse({
    status: 200,
    description: 'Returns responsible gaming settings',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getResponsibleGaming(@CurrentUser('id') userId: string) {
    return this.settingsService.getResponsibleGaming(userId);
  }

  @Put('responsible-gaming')
  @ApiOperation({ summary: 'Update responsible gaming settings' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dailyDepositLimit: {
          type: 'number',
          nullable: true,
          example: 100,
        },
        weeklyDepositLimit: {
          type: 'number',
          nullable: true,
          example: 500,
        },
        monthlyDepositLimit: {
          type: 'number',
          nullable: true,
          example: 2000,
        },
        dailyLossLimit: {
          type: 'number',
          nullable: true,
          example: 50,
        },
        dailyWagerLimit: {
          type: 'number',
          nullable: true,
          example: 200,
        },
        sessionTimeLimitMinutes: {
          type: 'integer',
          nullable: true,
          example: 120,
        },
        realityCheckIntervalMinutes: {
          type: 'integer',
          nullable: true,
          example: 30,
        },
        excludedGameCategories: {
          type: 'array',
          items: { type: 'string' },
          example: ['slots', 'table-games'],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Responsible gaming settings updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot modify settings during self-exclusion period',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async updateResponsibleGaming(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateResponsibleGamingDto,
  ) {
    return this.settingsService.updateResponsibleGaming(userId, dto);
  }

  @Post('self-exclude')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate self-exclusion' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['duration'],
      properties: {
        duration: {
          type: 'string',
          enum: ['24h', '7d', '30d', '6m', '1y', 'permanent'],
          description: 'Self-exclusion duration',
          example: '7d',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Self-exclusion activated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid duration',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async selfExclude(
    @CurrentUser('id') userId: string,
    @Body('duration') duration: '24h' | '7d' | '30d' | '6m' | '1y' | 'permanent',
  ) {
    return this.settingsService.selfExclude(userId, duration);
  }

  @Post('cooling-off')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate cooling off period' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['hours'],
      properties: {
        hours: {
          type: 'integer',
          minimum: 1,
          maximum: 72,
          description: 'Cooling off period in hours (1-72)',
          example: 24,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cooling off period activated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid hours value',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async coolingOff(
    @CurrentUser('id') userId: string,
    @Body('hours') hours: number,
  ) {
    return this.settingsService.coolingOff(userId, hours);
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate 2FA setup' })
  @ApiResponse({
    status: 200,
    description: 'Returns 2FA setup data including secret and QR code',
  })
  @ApiResponse({
    status: 400,
    description: '2FA is already enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async enable2FA(@CurrentUser('id') userId: string) {
    return this.settingsService.enable2FA(userId);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify and complete 2FA setup' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code'],
      properties: {
        code: {
          type: 'string',
          description: '6-digit TOTP code from authenticator app',
          example: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '2FA enabled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code or no pending 2FA setup',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async verify2FA(
    @CurrentUser('id') userId: string,
    @Body('code') code: string,
  ) {
    return this.settingsService.verify2FA(userId, code);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['code'],
      properties: {
        code: {
          type: 'string',
          description: '6-digit TOTP code from authenticator app',
          example: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code or 2FA not enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async disable2FA(
    @CurrentUser('id') userId: string,
    @Body('code') code: string,
  ) {
    return this.settingsService.disable2FA(userId, code);
  }

  @Post('2fa/backup-codes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate 2FA backup codes' })
  @ApiResponse({
    status: 200,
    description: 'Returns new backup codes',
  })
  @ApiResponse({
    status: 400,
    description: '2FA is not enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getBackupCodes(@CurrentUser('id') userId: string) {
    return this.settingsService.getBackupCodes(userId);
  }
}
