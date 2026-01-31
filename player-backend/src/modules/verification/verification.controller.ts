import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Public()
  @Post('email/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email verification code' })
  async sendEmailVerification(@Body() body: { email: string }) {
    const { code, expiresAt } = await this.verificationService.createEmailVerification(
      body.email,
    );
    await this.verificationService.sendVerificationEmail(body.email, code);

    return {
      message: 'Verification code sent to your email',
      expiresAt,
    };
  }

  @Public()
  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with code' })
  async verifyEmail(@Body() body: { email: string; code: string }) {
    await this.verificationService.verifyEmailCode(body.email, body.code);
    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post('phone/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send phone verification code (SMS)' })
  async sendPhoneVerification(@Body() body: { phone: string }) {
    const { code, expiresAt } = await this.verificationService.createPhoneVerification(
      body.phone,
    );
    await this.verificationService.sendVerificationSMS(body.phone, code);

    return {
      message: 'Verification code sent to your phone',
      expiresAt,
    };
  }

  @Public()
  @Post('phone/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone with code' })
  async verifyPhone(@Body() body: { phone: string; code: string }) {
    await this.verificationService.verifyPhoneCode(body.phone, body.code);
    return { message: 'Phone verified successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/send')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send 2FA verification code' })
  async send2FACode(@CurrentUser('id') userId: string) {
    const user = await this.verificationService['prisma'].user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { code, expiresAt } = await this.verificationService.create2FAVerification(userId);
    await this.verificationService.send2FAEmail(user.email, code);

    return {
      message: '2FA code sent to your email',
      expiresAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA code' })
  async verify2FACode(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string },
  ) {
    await this.verificationService.verify2FACode(userId, body.code);
    return { message: '2FA verified successfully' };
  }

  @Public()
  @Post('check-age')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if user is 18+ years old' })
  async checkAge(@Body() body: { dateOfBirth: string }) {
    const dob = new Date(body.dateOfBirth);
    const isAdult = this.verificationService.verifyAge(dob);

    return {
      isAdult,
      message: isAdult
        ? 'Age verification passed'
        : 'You must be 18 or older to use this platform',
    };
  }

  @Public()
  @Post('check-location')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if location is allowed' })
  async checkLocation(@Body() body: { ipAddress: string }) {
    const result = await this.verificationService.checkGeolocation(body.ipAddress);
    return result;
  }
}
