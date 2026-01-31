import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from '../database/prisma/prisma.module';
import { RedisModule } from '../database/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}
