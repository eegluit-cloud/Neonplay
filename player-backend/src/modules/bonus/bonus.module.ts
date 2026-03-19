import { Module, forwardRef } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';
import { GamesModule } from '../games/games.module';
import { WalletModule } from '../wallet/wallet.module';
import { RedisModule } from '../../database/redis/redis.module';

@Module({
    imports: [
        RedisModule,
        forwardRef(() => GamesModule),
        forwardRef(() => WalletModule),
    ],
    controllers: [BonusController],
    providers: [BonusService],
    exports: [BonusService],
})
export class BonusModule { }
