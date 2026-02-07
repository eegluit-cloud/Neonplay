import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { RedisModule } from '../../database/redis/redis.module';
import { HuiduController } from './huidu.controller';
import { HuiduService } from './huidu.service';
import { HuiduApiUtil } from './utils/huidu-api.util';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    forwardRef(() => GamesModule),
  ],
  controllers: [HuiduController],
  providers: [HuiduService, HuiduApiUtil],
  exports: [HuiduService],
})
export class HuiduModule {}
