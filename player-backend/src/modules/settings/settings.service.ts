import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { CryptoUtil } from '../../common/utils/crypto.util';

export interface UserSettingsDto {
  theme: string;
  language: string;
  timezone: string | null;
  currencyDisplay: string;
  soundEnabled: boolean;
  animationReduced: boolean;
}

export interface UpdateSettingsDto {
  theme?: string;
  language?: string;
  timezone?: string;
  currencyDisplay?: string;
  soundEnabled?: boolean;
  animationReduced?: boolean;
}

export interface ResponsibleGamingDto {
  dailyDepositLimit: number | null;
  weeklyDepositLimit: number | null;
  monthlyDepositLimit: number | null;
  dailyLossLimit: number | null;
  dailyWagerLimit: number | null;
  sessionTimeLimitMinutes: number | null;
  realityCheckIntervalMinutes: number | null;
  selfExclusionUntil: Date | null;
  coolingOffUntil: Date | null;
  excludedGameCategories: string[];
}

export interface UpdateResponsibleGamingDto {
  dailyDepositLimit?: number | null;
  weeklyDepositLimit?: number | null;
  monthlyDepositLimit?: number | null;
  dailyLossLimit?: number | null;
  dailyWagerLimit?: number | null;
  sessionTimeLimitMinutes?: number | null;
  realityCheckIntervalMinutes?: number | null;
  excludedGameCategories?: string[];
}

export interface Enable2FAResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly BACKUP_CODES_COUNT = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettingsDto> {
    let settings = await this.prisma.userSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await this.prisma.userSetting.create({
        data: { userId },
      });
    }

    return {
      theme: settings.theme,
      language: settings.language,
      timezone: settings.timezone,
      currencyDisplay: settings.currencyDisplay,
      soundEnabled: settings.soundEnabled,
      animationReduced: settings.animationReduced,
    };
  }

  /**
   * Update user settings
   */
  async updateSettings(
    userId: string,
    dto: UpdateSettingsDto,
  ): Promise<UserSettingsDto> {
    const settings = await this.prisma.userSetting.upsert({
      where: { userId },
      update: {
        theme: dto.theme,
        language: dto.language,
        timezone: dto.timezone,
        currencyDisplay: dto.currencyDisplay,
        soundEnabled: dto.soundEnabled,
        animationReduced: dto.animationReduced,
      },
      create: {
        userId,
        theme: dto.theme || 'dark',
        language: dto.language || 'en',
        timezone: dto.timezone,
        currencyDisplay: dto.currencyDisplay || 'USD',
        soundEnabled: dto.soundEnabled ?? true,
        animationReduced: dto.animationReduced ?? false,
      },
    });

    // Log activity
    await this.logActivity(userId, 'settings_updated', { changes: dto });

    return {
      theme: settings.theme,
      language: settings.language,
      timezone: settings.timezone,
      currencyDisplay: settings.currencyDisplay,
      soundEnabled: settings.soundEnabled,
      animationReduced: settings.animationReduced,
    };
  }

  /**
   * Get responsible gaming settings
   */
  async getResponsibleGaming(userId: string): Promise<ResponsibleGamingDto> {
    let settings = await this.prisma.responsibleGamingSetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await this.prisma.responsibleGamingSetting.create({
        data: { userId },
      });
    }

    return {
      dailyDepositLimit: settings.dailyDepositLimit
        ? Number(settings.dailyDepositLimit)
        : null,
      weeklyDepositLimit: settings.weeklyDepositLimit
        ? Number(settings.weeklyDepositLimit)
        : null,
      monthlyDepositLimit: settings.monthlyDepositLimit
        ? Number(settings.monthlyDepositLimit)
        : null,
      dailyLossLimit: settings.dailyLossLimit
        ? Number(settings.dailyLossLimit)
        : null,
      dailyWagerLimit: settings.dailyWagerLimit
        ? Number(settings.dailyWagerLimit)
        : null,
      sessionTimeLimitMinutes: settings.sessionTimeLimitMinutes,
      realityCheckIntervalMinutes: settings.realityCheckIntervalMinutes,
      selfExclusionUntil: settings.selfExclusionUntil,
      coolingOffUntil: settings.coolingOffUntil,
      excludedGameCategories:
        (settings.excludedGameCategories as string[]) || [],
    };
  }

  /**
   * Update responsible gaming settings
   */
  async updateResponsibleGaming(
    userId: string,
    dto: UpdateResponsibleGamingDto,
  ): Promise<ResponsibleGamingDto> {
    // Check if user is currently in self-exclusion or cooling off period
    const currentSettings = await this.prisma.responsibleGamingSetting.findUnique({
      where: { userId },
    });

    if (currentSettings?.selfExclusionUntil) {
      if (new Date(currentSettings.selfExclusionUntil) > new Date()) {
        throw new BadRequestException(
          'Cannot modify settings during self-exclusion period',
        );
      }
    }

    const settings = await this.prisma.responsibleGamingSetting.upsert({
      where: { userId },
      update: {
        dailyDepositLimit: dto.dailyDepositLimit,
        weeklyDepositLimit: dto.weeklyDepositLimit,
        monthlyDepositLimit: dto.monthlyDepositLimit,
        dailyLossLimit: dto.dailyLossLimit,
        dailyWagerLimit: dto.dailyWagerLimit,
        sessionTimeLimitMinutes: dto.sessionTimeLimitMinutes,
        realityCheckIntervalMinutes: dto.realityCheckIntervalMinutes,
        excludedGameCategories: dto.excludedGameCategories,
      },
      create: {
        userId,
        dailyDepositLimit: dto.dailyDepositLimit,
        weeklyDepositLimit: dto.weeklyDepositLimit,
        monthlyDepositLimit: dto.monthlyDepositLimit,
        dailyLossLimit: dto.dailyLossLimit,
        dailyWagerLimit: dto.dailyWagerLimit,
        sessionTimeLimitMinutes: dto.sessionTimeLimitMinutes,
        realityCheckIntervalMinutes: dto.realityCheckIntervalMinutes,
        excludedGameCategories: dto.excludedGameCategories,
      },
    });

    // Log activity
    await this.logActivity(userId, 'responsible_gaming_updated', { changes: dto });

    return this.getResponsibleGaming(userId);
  }

  /**
   * Self-exclude for a specified duration
   */
  async selfExclude(
    userId: string,
    duration: '24h' | '7d' | '30d' | '6m' | '1y' | 'permanent',
  ): Promise<{ message: string; exclusionUntil: Date | null }> {
    let exclusionUntil: Date | null = null;

    switch (duration) {
      case '24h':
        exclusionUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        break;
      case '7d':
        exclusionUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        exclusionUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        exclusionUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        exclusionUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        break;
      case 'permanent':
        exclusionUntil = new Date('2099-12-31');
        break;
      default:
        throw new BadRequestException('Invalid duration');
    }

    await this.prisma.responsibleGamingSetting.upsert({
      where: { userId },
      update: { selfExclusionUntil: exclusionUntil },
      create: { userId, selfExclusionUntil: exclusionUntil },
    });

    // Invalidate all user sessions
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    // Log activity
    await this.logActivity(userId, 'self_exclusion_activated', {
      duration,
      exclusionUntil,
    });

    this.logger.log(`User ${userId} self-excluded until ${exclusionUntil}`);

    return {
      message: `Self-exclusion activated until ${exclusionUntil.toISOString()}`,
      exclusionUntil,
    };
  }

  /**
   * Activate cooling off period
   */
  async coolingOff(
    userId: string,
    hours: number,
  ): Promise<{ message: string; coolingOffUntil: Date }> {
    if (hours < 1 || hours > 72) {
      throw new BadRequestException('Cooling off period must be between 1 and 72 hours');
    }

    const coolingOffUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

    await this.prisma.responsibleGamingSetting.upsert({
      where: { userId },
      update: { coolingOffUntil },
      create: { userId, coolingOffUntil },
    });

    // Log activity
    await this.logActivity(userId, 'cooling_off_activated', {
      hours,
      coolingOffUntil,
    });

    this.logger.log(`User ${userId} cooling off until ${coolingOffUntil}`);

    return {
      message: `Cooling off period activated for ${hours} hours`,
      coolingOffUntil,
    };
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string): Promise<Enable2FAResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `WBC2026:${user.email}`,
      issuer: 'WBC2026',
    });

    // Store temporarily in Redis until verified
    await this.redis.set(
      `2fa:pending:${userId}`,
      secret.base32,
      600, // 10 minutes TTL
    );

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    await this.redis.set(
      `2fa:backup:${userId}`,
      JSON.stringify(backupCodes),
      600, // 10 minutes TTL
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify and complete 2FA setup
   */
  async verify2FA(userId: string, code: string): Promise<{ message: string }> {
    const pendingSecret = await this.redis.get<string>(`2fa:pending:${userId}`);

    if (!pendingSecret) {
      throw new BadRequestException('No pending 2FA setup found. Please initiate 2FA setup first.');
    }

    // Verify the code
    const isValid = speakeasy.totp.verify({
      secret: pendingSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Get backup codes
    const backupCodesStr = await this.redis.get<string>(`2fa:backup:${userId}`);
    const backupCodes = backupCodesStr ? JSON.parse(backupCodesStr) : [];

    // Hash backup codes before storing
    const hashedBackupCodes = backupCodes.map((c: string) =>
      CryptoUtil.hashToken(c),
    );

    // Save to database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: pendingSecret,
        twoFactorEnabled: true,
      },
    });

    // Store hashed backup codes in a separate location (could be a separate table)
    await this.redis.set(
      `2fa:backup_codes:${userId}`,
      JSON.stringify(hashedBackupCodes),
    );

    // Clean up pending data
    await this.redis.del(`2fa:pending:${userId}`);
    await this.redis.del(`2fa:backup:${userId}`);

    // Log activity
    await this.logActivity(userId, '2fa_enabled');

    return { message: '2FA has been enabled successfully' };
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, code: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Verify the code
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid verification code');
    }

    // Disable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    // Clean up backup codes
    await this.redis.del(`2fa:backup_codes:${userId}`);

    // Log activity
    await this.logActivity(userId, '2fa_disabled');

    return { message: '2FA has been disabled successfully' };
  }

  /**
   * Get backup codes (regenerates them)
   */
  async getBackupCodes(userId: string): Promise<{ backupCodes: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA is not enabled');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes();
    const hashedBackupCodes = backupCodes.map((c) => CryptoUtil.hashToken(c));

    // Store hashed backup codes
    await this.redis.set(
      `2fa:backup_codes:${userId}`,
      JSON.stringify(hashedBackupCodes),
    );

    // Log activity
    await this.logActivity(userId, 'backup_codes_regenerated');

    return { backupCodes };
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      codes.push(CryptoUtil.generateAlphanumericCode(8));
    }
    return codes;
  }

  /**
   * Log user activity
   */
  private async logActivity(
    userId: string,
    action: string,
    metadata?: any,
  ): Promise<void> {
    try {
      await this.prisma.userActivityLog.create({
        data: {
          userId,
          action,
          metadata,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to log activity: ${error}`);
    }
  }
}
