import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { RedisModule } from '../../database/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
