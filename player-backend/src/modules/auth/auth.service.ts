import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenResponse, JwtPayload, OAuthProfile } from '../../shared/interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS = 12;
  private readonly MAX_LOGIN_ATTEMPTS = 10;
  private readonly LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenResponse> {
    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username.toLowerCase() },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    // Create user with wallet
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        countryCode: dto.countryCode,
        wallet: {
          create: {},
        },
        vip: {
          create: {
            tierId: await this.getDefaultVipTierId(),
            xpCurrent: 0,
            xpLifetime: 0,
          },
        },
        referralCode: {
          create: {
            code: CryptoUtil.generateReferralCode(),
          },
        },
        settings: {
          create: {},
        },
        notificationPrefs: {
          create: {},
        },
        privacySettings: {
          create: {},
        },
      },
    });

    // Handle referral if provided
    if (dto.referralCode) {
      await this.applyReferralCode(user.id, dto.referralCode);
    }

    // Generate tokens
    return this.generateTokens(user);
  }

  async login(dto: LoginDto, ipAddress: string, userAgent: string): Promise<TokenResponse> {
    const identifier = dto.email.toLowerCase();

    // Check for account lockout
    const isLocked = await this.isAccountLocked(identifier);
    if (isLocked) {
      throw new UnauthorizedException('Account temporarily locked. Please try again later.');
    }

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      await this.recordLoginAttempt(identifier, ipAddress, false, 'Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is suspended
    if (user.isSuspended) {
      throw new UnauthorizedException('Account is suspended: ' + (user.suspendedReason || 'Contact support'));
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.recordLoginAttempt(identifier, ipAddress, false, 'Invalid password');
      const attempts = await this.getLoginAttempts(identifier);
      if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
        await this.lockAccount(identifier);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Record successful login
    await this.recordLoginAttempt(identifier, ipAddress, true);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store session
    await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

    return tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = CryptoUtil.hashToken(refreshToken);

    await this.prisma.userSession.deleteMany({
      where: {
        userId,
        refreshTokenHash: tokenHash,
      },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    // Invalidate all access tokens in Redis
    await this.redis.del(`user:${userId}:tokens`);
  }

  async refreshTokens(refreshToken: string, ipAddress: string, userAgent: string): Promise<TokenResponse> {
    const tokenHash = CryptoUtil.hashToken(refreshToken);

    const session = await this.prisma.userSession.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!session.user.isActive || session.user.isSuspended) {
      throw new UnauthorizedException('Account is not active');
    }

    // Delete old session
    await this.prisma.userSession.delete({
      where: { id: session.id },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(session.user);

    // Create new session (token rotation)
    await this.createSession(session.userId, tokens.refreshToken, ipAddress, userAgent);

    return tokens;
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isActive: true,
        isSuspended: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        twoFactorEnabled: true,
      },
    });

    if (!user || !user.isActive || user.isSuspended) {
      return null;
    }

    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset code
    const code = CryptoUtil.generateCode(6);
    const codeHash = CryptoUtil.hashToken(code);

    // Store verification code
    await this.prisma.verificationCode.create({
      data: {
        userId: user.id,
        type: 'password_reset',
        codeHash,
        identifier: email.toLowerCase(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    });

    // TODO: Send email with reset code
    this.logger.log(`Password reset code for ${email}: ${code}`);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const codeHash = CryptoUtil.hashToken(code);

    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        identifier: email.toLowerCase(),
        type: 'password_reset',
        codeHash,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
      include: { user: true },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    // Update password and mark code as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId! },
        data: { passwordHash },
      }),
      this.prisma.verificationCode.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
      // Invalidate all sessions
      this.prisma.userSession.deleteMany({
        where: { userId: verification.userId! },
      }),
    ]);
  }

  async sendEmailVerification(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email already verified');
    }

    const code = CryptoUtil.generateCode(6);
    const codeHash = CryptoUtil.hashToken(code);

    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: 'email',
        codeHash,
        identifier: user.email,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    });

    // TODO: Send email
    this.logger.log(`Email verification code for ${user.email}: ${code}`);
  }

  async verifyEmail(userId: string, code: string): Promise<void> {
    const codeHash = CryptoUtil.hashToken(code);

    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        userId,
        type: 'email',
        codeHash,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Increment attempts counter
    await this.prisma.verificationCode.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } },
    });

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.verificationCode.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
    ]);
  }

  async handleOAuthLogin(profile: OAuthProfile, ipAddress: string, userAgent: string): Promise<TokenResponse> {
    // Check if OAuth account already linked (outside transaction for quick check)
    let oauthAccount = await this.prisma.userOAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: profile.provider,
          providerUserId: profile.providerId,
        },
      },
      include: { user: true },
    });

    if (oauthAccount) {
      // Existing user, generate tokens
      const tokens = await this.generateTokens(oauthAccount.user);
      await this.createSession(oauthAccount.userId, tokens.refreshToken, ipAddress, userAgent);
      return tokens;
    }

    // Use a transaction to prevent race conditions when creating/linking accounts
    const user = await this.prisma.$transaction(async (tx) => {
      // Re-check OAuth account inside transaction to prevent race condition
      const existingOAuth = await tx.userOAuthAccount.findUnique({
        where: {
          provider_providerUserId: {
            provider: profile.provider,
            providerUserId: profile.providerId,
          },
        },
        include: { user: true },
      });

      if (existingOAuth) {
        return existingOAuth.user;
      }

      // Check if email already registered
      let existingUser = await tx.user.findUnique({
        where: { email: profile.email.toLowerCase() },
      });

      if (existingUser) {
        // Link OAuth account to existing user
        // Use upsert to handle race condition where another request might have created it
        await tx.userOAuthAccount.upsert({
          where: {
            provider_providerUserId: {
              provider: profile.provider,
              providerUserId: profile.providerId,
            },
          },
          update: {}, // If exists, do nothing
          create: {
            userId: existingUser.id,
            provider: profile.provider,
            providerUserId: profile.providerId,
          },
        });
        return existingUser;
      }

      // Create new user
      const username = await this.generateUniqueUsername(profile.email);
      const defaultVipTierId = await this.getDefaultVipTierId();

      return tx.user.create({
        data: {
          email: profile.email.toLowerCase(),
          username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: new Date(), // OAuth emails are pre-verified
          oauthAccounts: {
            create: {
              provider: profile.provider,
              providerUserId: profile.providerId,
            },
          },
          wallet: {
            create: {},
          },
          vip: {
            create: {
              tierId: defaultVipTierId,
              xpCurrent: 0,
              xpLifetime: 0,
            },
          },
          referralCode: {
            create: {
              code: CryptoUtil.generateReferralCode(),
            },
          },
          settings: {
            create: {},
          },
          notificationPrefs: {
            create: {},
          },
          privacySettings: {
            create: {},
          },
        },
      });
    });

    const tokens = await this.generateTokens(user);
    await this.createSession(user.id, tokens.refreshToken, ipAddress, userAgent);

    return tokens;
  }

  async getSessions(userId: string): Promise<any[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException('Cannot change password for this account');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      // Invalidate all other sessions
      this.prisma.userSession.deleteMany({
        where: { userId },
      }),
    ]);
  }

  async sendPhoneVerification(userId: string, phone: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if phone is already registered
    const existingPhone = await this.prisma.user.findFirst({
      where: { phone, id: { not: userId } },
    });

    if (existingPhone) {
      throw new ConflictException('Phone number already registered');
    }

    // Update phone number on user profile
    await this.prisma.user.update({
      where: { id: userId },
      data: { phone, phoneVerifiedAt: null },
    });

    const code = CryptoUtil.generateCode(6);
    const codeHash = CryptoUtil.hashToken(code);

    // Invalidate any existing phone codes
    await this.prisma.verificationCode.updateMany({
      where: {
        userId,
        type: 'phone',
        verifiedAt: null,
      },
      data: { expiresAt: new Date() },
    });

    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: 'phone',
        codeHash,
        identifier: phone,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // TODO: Send SMS using Twilio or other provider
    this.logger.log(`Phone verification code for ${phone}: ${code}`);
  }

  async verifyPhone(userId: string, code: string): Promise<void> {
    const codeHash = CryptoUtil.hashToken(code);

    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        userId,
        type: 'phone',
        codeHash,
        expiresAt: { gt: new Date() },
        verifiedAt: null,
      },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (verification.attempts >= 5) {
      throw new BadRequestException('Too many attempts. Please request a new code.');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { phoneVerifiedAt: new Date() },
      }),
      this.prisma.verificationCode.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
      }),
    ]);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
  }): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check username uniqueness if being updated
    if (data.username && data.username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: data.username.toLowerCase() },
      });
      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.username !== undefined) updateData.username = data.username.toLowerCase();
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        avatarUrl: true,
        phone: true,
        countryCode: true,
        stateCode: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        identityVerifiedAt: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }

  // Private helper methods
  private async generateTokens(user: any): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiry') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer',
    };
  }

  private async createSession(
    userId: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    const tokenHash = CryptoUtil.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.userSession.create({
      data: {
        userId,
        refreshTokenHash: tokenHash,
        ipAddress,
        userAgent,
        deviceInfo: this.parseUserAgent(userAgent),
        expiresAt,
      },
    });
  }

  private parseUserAgent(userAgent: string): any {
    // Basic user agent parsing - in production use a proper library
    const isMobile = /mobile/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const browser = this.extractBrowser(userAgent);
    const os = this.extractOS(userAgent);

    return {
      browser,
      os,
      deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    };
  }

  private extractBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    return 'Unknown';
  }

  private extractOS(userAgent: string): string {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
  }

  private async recordLoginAttempt(
    identifier: string,
    ipAddress: string,
    success: boolean,
    failureReason?: string,
  ): Promise<void> {
    await this.prisma.loginAttempt.create({
      data: {
        identifier,
        ipAddress,
        success,
        failureReason,
      },
    });
  }

  private async getLoginAttempts(identifier: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const count = await this.prisma.loginAttempt.count({
      where: {
        identifier,
        success: false,
        createdAt: { gte: oneHourAgo },
      },
    });

    return count;
  }

  private async isAccountLocked(identifier: string): Promise<boolean> {
    const lockKey = `lockout:${identifier}`;
    return this.redis.exists(lockKey);
  }

  private async lockAccount(identifier: string): Promise<void> {
    const lockKey = `lockout:${identifier}`;
    await this.redis.set(lockKey, 'locked', this.LOCKOUT_DURATION);
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = base;
    let counter = 1;

    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}${counter}`;
      counter++;
    }

    return username;
  }

  private async getDefaultVipTierId(): Promise<string> {
    const defaultTier = await this.prisma.vipTier.findFirst({
      where: { level: 1 },
    });

    if (!defaultTier) {
      // Create default tier if it doesn't exist
      const tier = await this.prisma.vipTier.create({
        data: {
          name: 'Bronze',
          slug: 'bronze',
          level: 1,
          minXp: 0,
          cashbackPercent: 0,
          redemptionBonusPercent: 0,
          color: '#CD7F32',
        },
      });
      return tier.id;
    }

    return defaultTier.id;
  }

  private async applyReferralCode(userId: string, code: string): Promise<void> {
    const referralCode = await this.prisma.referralCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!referralCode || referralCode.userId === userId) {
      return; // Invalid code or self-referral
    }

    await this.prisma.referral.create({
      data: {
        referrerId: referralCode.userId,
        referredId: userId,
        status: 'pending',
      },
    });
  }
}
