import { Module, forwardRef } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { JackpotModule } from '../jackpot/jackpot.module';

@Module({
  imports: [forwardRef(() => JackpotModule)],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
