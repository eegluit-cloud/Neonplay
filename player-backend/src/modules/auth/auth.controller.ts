import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TokenResponse } from '../../shared/interfaces/user.interface';
import { SkipCsrf } from '../../common/guards/csrf.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @SkipCsrf()
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 registrations per minute per IP
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async register(@Body() dto: RegisterDto): Promise<TokenResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @SkipCsrf()
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 login attempts per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email/username and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<TokenResponse> {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current session' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ message: string }> {
    await this.authService.logout(userId, refreshToken);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout all sessions' })
  async logoutAll(@CurrentUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.logoutAll(userId);
    return { message: 'All sessions logged out successfully' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request): Promise<TokenResponse> {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.refreshTokens(dto.refreshToken, ipAddress, userAgent);
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60000, limit: 3 } }) // 3 reset requests per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If the email exists, a reset code has been sent' };
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 reset attempts per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with code' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
    return { message: 'Password reset successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify email with code' })
  async verifyEmail(
    @CurrentUser('id') userId: string,
    @Body() dto: VerifyEmailDto,
  ): Promise<{ message: string }> {
    await this.authService.verifyEmail(userId, dto.code);
    return { message: 'Email verified successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Resend email verification code' })
  async resendVerification(@CurrentUser('id') userId: string): Promise<{ message: string }> {
    await this.authService.sendEmailVerification(userId);
    return { message: 'Verification code sent' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify phone with OTP code' })
  async verifyPhone(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string },
  ): Promise<{ message: string }> {
    await this.authService.verifyPhone(userId, body.code);
    return { message: 'Phone verified successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-phone-verification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send phone verification code' })
  async sendPhoneVerification(
    @CurrentUser('id') userId: string,
    @Body() body: { phone: string },
  ): Promise<{ message: string }> {
    await this.authService.sendPhoneVerification(userId, body.phone);
    return { message: 'Verification code sent to phone' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: any): Promise<any> {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateMe(
    @CurrentUser('id') userId: string,
    @Body() body: {
      firstName?: string;
      lastName?: string;
      username?: string;
      dateOfBirth?: string;
      avatarUrl?: string;
    },
  ): Promise<any> {
    return this.authService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(userId, dto.currentPassword, dto.newPassword);
    return { message: 'Password changed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List active sessions' })
  async getSessions(@CurrentUser('id') userId: string): Promise<any[]> {
    return this.authService.getSessions(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ): Promise<{ message: string }> {
    await this.authService.revokeSession(userId, sessionId);
    return { message: 'Session revoked successfully' };
  }

  // OAuth endpoints would be here - simplified for now
  @Public()
  @Get('oauth/google')
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  async googleAuth(): Promise<{ url: string }> {
    // In production, this would redirect to Google OAuth
    return { url: '/auth/oauth/google/callback' };
  }

  @Public()
  @Get('oauth/google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request): Promise<TokenResponse> {
    // In production, this would handle the OAuth callback
    throw new Error('OAuth callback not implemented');
  }
}
