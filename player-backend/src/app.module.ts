import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Security
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { CsrfGuard } from './common/guards/csrf.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Configuration
import configuration from './config/configuration';

// Database
import { PrismaModule } from './database/prisma/prisma.module';
import { RedisModule } from './database/redis/redis.module';

// Health Check
import { HealthModule } from './health/health.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { GamesModule } from './modules/games/games.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { LeaderboardModule } from './modules/leaderboard/leaderboard.module';
import { SportsModule } from './modules/sports/sports.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { VipModule } from './modules/vip/vip.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { VerificationModule } from './modules/verification/verification.module';
import { JackpotModule } from './modules/jackpot/jackpot.module';
import { PrizesModule } from './modules/prizes/prizes.module';
import { AmoeModule } from './modules/amoe/amoe.module';
import { ContentModule } from './modules/content/content.module';
import { ActivityModule } from './modules/activity/activity.module';
import { HelpModule } from './modules/help/help.module';
import { SettingsModule } from './modules/settings/settings.module';
import { CmsModule } from './modules/cms/cms.module';
import { AdminModule } from './modules/admin/admin.module';
import { MediaModule } from './modules/media/media.module';
import { PaymentModule } from './modules/payment/payment.module';
import { HuiduModule } from './modules/huidu/huidu.module';
import { BonusModule } from './modules/bonus/bonus.module';

// WebSockets
import { WebsocketsModule } from './websockets/websockets.module';

// Jobs
import { JobsModule } from './jobs/jobs.module';

@Module({
  providers: [
    // Global rate limiting - prevents brute force and DDoS attacks
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global CSRF protection for all state-changing requests
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    // Global exception filter for consistent error responses
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_MAX', 100),
        },
      ],
    }),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,
    RedisModule,

    // Health Check
    HealthModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    WalletModule,
    GamesModule,
    ProvidersModule,
    LeaderboardModule,
    SportsModule,
    PromotionsModule,
    VipModule,
    ReferralsModule,
    NotificationsModule,
    VerificationModule,
    JackpotModule,
    PrizesModule,
    AmoeModule,
    ContentModule,
    ActivityModule,
    HelpModule,
    SettingsModule,
    CmsModule,
    AdminModule,
    MediaModule,
    PaymentModule,
    HuiduModule,
    BonusModule,

    // WebSockets
    WebsocketsModule,

    // Background Jobs
    JobsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply CSRF middleware to all routes
    // This sets the CSRF cookie on every response
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
