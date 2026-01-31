import { Module } from '@nestjs/common';
import { AmoeController } from './amoe.controller';
import { AmoeService } from './amoe.service';

@Module({
  controllers: [AmoeController],
  providers: [AmoeService],
  exports: [AmoeService],
})
export class AmoeModule {}
