import { Module, forwardRef } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { JackpotModule } from '../jackpot/jackpot.module';
import { HuiduModule } from '../huidu/huidu.module';

@Module({
  imports: [
    forwardRef(() => JackpotModule),
    forwardRef(() => HuiduModule),
  ],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
