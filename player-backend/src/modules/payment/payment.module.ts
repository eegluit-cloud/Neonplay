import { Module } from '@nestjs/common';
import { Pay247Module } from './pay247/pay247.module';

/**
 * Root Payment Module
 * Aggregates all payment gateway modules
 */
@Module({
  imports: [
    Pay247Module,
    // Future payment gateways can be added here:
    // StripeModule,
    // PayPalModule,
    // etc.
  ],
  exports: [Pay247Module],
})
export class PaymentModule {}
