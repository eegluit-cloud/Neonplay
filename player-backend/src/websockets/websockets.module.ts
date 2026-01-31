import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MainGateway } from './gateways/main.gateway';
import { WalletGateway } from './gateways/wallet.gateway';
import { LeaderboardGateway } from './gateways/leaderboard.gateway';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { ActivityGateway } from './gateways/activity.gateway';
import { GamesGateway } from './gateways/games.gateway';
import { SportsGateway } from './gateways/sports.gateway';
import { JackpotGateway } from './gateways/jackpot.gateway';
import { RedisIoAdapter } from './adapters/redis-io.adapter';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
      }),
    }),
  ],
  providers: [
    MainGateway,
    WalletGateway,
    LeaderboardGateway,
    NotificationsGateway,
    ActivityGateway,
    GamesGateway,
    SportsGateway,
    JackpotGateway,
    RedisIoAdapter,
  ],
  exports: [
    MainGateway,
    WalletGateway,
    LeaderboardGateway,
    NotificationsGateway,
    ActivityGateway,
    GamesGateway,
    SportsGateway,
    JackpotGateway,
  ],
})
export class WebsocketsModule {}
