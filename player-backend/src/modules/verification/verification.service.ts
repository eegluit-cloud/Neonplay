import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  // Generate a 6-digit verification code
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate a secure token for password reset
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create email verification code
  async createEmailVerification(
    email: string,
    userId?: string,
  ): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any existing codes for this email
    await this.prisma.verificationCode.updateMany({
      where: {
        identifier: email,
        type: 'email',
        verifiedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });

    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: 'email',
        codeHash,
        identifier: email,
        expiresAt,
      },
    });

    this.logger.log(`Email verification code created for: ${email}`);
    return { code, expiresAt };
  }

  // Create phone verification code (SMS OTP)
  async createPhoneVerification(
    phone: string,
    userId?: string,
  ): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check rate limit (max 3 per hour)
    const recentCodes = await this.prisma.verificationCode.count({
      where: {
        identifier: phone,
        type: 'phone',
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });

    if (recentCodes >= 3) {
      throw new BadRequestException(
        'Too many verification attempts. Please try again later.',
      );
    }

    // Invalidate existing codes
    await this.prisma.verificationCode.updateMany({
      where: {
        identifier: phone,
        type: 'phone',
        verifiedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });

    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: 'phone',
        codeHash,
        identifier: phone,
        expiresAt,
      },
    });

    this.logger.log(`Phone verification code created for: ${phone}`);
    return { code, expiresAt };
  }

  // Create password reset token
  async createPasswordResetToken(
    email: string,
    userId: string,
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = this.generateToken();
    const codeHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate existing reset tokens
    await this.prisma.verificationCode.updateMany({
      where: {
        userId,
        type: 'password_reset',
        verifiedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });

    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: 'password_reset',
        codeHash,
        identifier: email,
        expiresAt,
      },
    });

    this.logger.log(`Password reset token created for user: ${userId}`);
    return { token, expiresAt };
  }

  // Create 2FA verification code
  async create2FAVerification(userId: string): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Invalidate existing 2FA codes
    await this.prisma.verificationCode.updateMany({
      where: {
        userId,
        type: '2fa',
        verifiedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });

    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: '2fa',
        codeHash,
        identifier: user.email,
        expiresAt,
      },
    });

    this.logger.log(`2FA verification code created for user: ${userId}`);
    return { code, expiresAt };
  }

  // Verify email code
  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        identifier: email,
        type: 'email',
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Check attempts
    if (verification.attempts >= 5) {
      throw new BadRequestException(
        'Too many failed attempts. Please request a new code.',
      );
    }

    const isValid = await bcrypt.compare(code, verification.codeHash);

    if (!isValid) {
      await this.prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code');
    }

    // Mark as verified
    await this.prisma.verificationCode.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    // Update user email verification if userId exists
    if (verification.userId) {
      await this.prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerifiedAt: new Date() },
      });
    }

    this.logger.log(`Email verified for: ${email}`);
    return true;
  }

  // Verify phone code
  async verifyPhoneCode(phone: string, code: string): Promise<boolean> {
    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        identifier: phone,
        type: 'phone',
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    if (verification.attempts >= 5) {
      throw new BadRequestException(
        'Too many failed attempts. Please request a new code.',
      );
    }

    const isValid = await bcrypt.compare(code, verification.codeHash);

    if (!isValid) {
      await this.prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.verificationCode.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    if (verification.userId) {
      await this.prisma.user.update({
        where: { id: verification.userId },
        data: { phoneVerifiedAt: new Date() },
      });
    }

    this.logger.log(`Phone verified for: ${phone}`);
    return true;
  }

  // Verify password reset token
  async verifyPasswordResetToken(
    email: string,
    token: string,
  ): Promise<{ userId: string }> {
    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        identifier: email,
        type: 'password_reset',
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification || !verification.userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const isValid = await bcrypt.compare(token, verification.codeHash);

    if (!isValid) {
      throw new BadRequestException('Invalid reset token');
    }

    // Mark as verified
    await this.prisma.verificationCode.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    this.logger.log(`Password reset token verified for: ${email}`);
    return { userId: verification.userId };
  }

  // Verify 2FA code
  async verify2FACode(userId: string, code: string): Promise<boolean> {
    const verification = await this.prisma.verificationCode.findFirst({
      where: {
        userId,
        type: '2fa',
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('Invalid or expired 2FA code');
    }

    if (verification.attempts >= 3) {
      throw new BadRequestException(
        'Too many failed attempts. Please request a new code.',
      );
    }

    const isValid = await bcrypt.compare(code, verification.codeHash);

    if (!isValid) {
      await this.prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid 2FA code');
    }

    await this.prisma.verificationCode.update({
      where: { id: verification.id },
      data: { verifiedAt: new Date() },
    });

    this.logger.log(`2FA code verified for user: ${userId}`);
    return true;
  }

  // Send email (placeholder - integrate with SendGrid/SES)
  async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    // TODO: Integrate with actual email provider (SendGrid, AWS SES, etc.)
    this.logger.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    this.logger.debug(`Email content: ${html}`);
  }

  // Send SMS (placeholder - integrate with Twilio)
  async sendSMS(to: string, message: string): Promise<void> {
    // TODO: Integrate with actual SMS provider (Twilio, etc.)
    this.logger.log(`[SMS] To: ${to}, Message: ${message}`);
  }

  // Send verification email
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const subject = 'Verify Your Email - WBC 2026';
    const html = `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Send verification SMS
  async sendVerificationSMS(phone: string, code: string): Promise<void> {
    const message = `Your WBC 2026 verification code is: ${code}. Expires in 10 minutes.`;
    await this.sendSMS(phone, message);
  }

  // Send password reset email
  async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const subject = 'Reset Your Password - WBC 2026';
    const html = `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Send 2FA code email
  async send2FAEmail(email: string, code: string): Promise<void> {
    const subject = 'Your 2FA Code - WBC 2026';
    const html = `
      <h1>Two-Factor Authentication</h1>
      <p>Your 2FA code is: <strong>${code}</strong></p>
      <p>This code will expire in 5 minutes.</p>
      <p>If you did not request this, please secure your account immediately.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Check geolocation (placeholder)
  async checkGeolocation(ipAddress: string): Promise<{
    country: string;
    state?: string;
    isAllowed: boolean;
  }> {
    // TODO: Integrate with IP geolocation service (MaxMind, etc.)
    // For now, return a default response
    this.logger.log(`Checking geolocation for IP: ${ipAddress}`);

    // List of restricted regions (example)
    const restrictedCountries = ['XX']; // placeholder

    return {
      country: 'US',
      state: 'CA',
      isAllowed: true,
    };
  }

  // Verify age (18+)
  verifyAge(dateOfBirth: Date): boolean {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      return age - 1 >= 18;
    }

    return age >= 18;
  }

  // Clean up expired verification codes
  async cleanupExpiredCodes(): Promise<number> {
    const result = await this.prisma.verificationCode.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired verification codes`);
    return result.count;
  }
}
