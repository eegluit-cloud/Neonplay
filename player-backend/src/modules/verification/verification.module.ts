import { Module } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { RedisModule } from '../../database/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
