import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Pay247Controller } from './pay247.controller';
import { Pay247Service } from './pay247.service';
import { Pay247ApiUtil } from './utils/pay247-api.util';
import { PrismaModule } from '../../../database/prisma/prisma.module';
import { WalletModule } from '../../wallet/wallet.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    WalletModule, // Import existing wallet module to use WalletService
  ],
  controllers: [Pay247Controller],
  providers: [
    Pay247Service,
    Pay247ApiUtil,
  ],
  exports: [Pay247Service], // Export for use in other modules if needed
})
export class Pay247Module {}
