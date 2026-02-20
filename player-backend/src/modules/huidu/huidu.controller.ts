import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { SkipCsrf } from '../../common/guards/csrf.guard';
import { HuiduService } from './huidu.service';
import { HuiduCallbackDto } from './dto/huidu-callback.dto';

@Controller('huidu')
export class HuiduController {
  constructor(private readonly huiduService: HuiduService) {}

  /**
   * POST /huidu/callback
   * Called by Huidu for every bet/win event (Seamless wallet mode).
   * Must always return HTTP 200 with { code, msg, payload }.
   */
  @Post('callback')
  @Public()
  @SkipCsrf()
  @Throttle({ default: { ttl: 60000, limit: 200 } })
  @HttpCode(200)
  async handleCallback(@Body() dto: HuiduCallbackDto) {
    // 🔔 Log incoming callback request
    console.log('='.repeat(80));
    console.log('🔔 HUIDU CALLBACK RECEIVED at', new Date().toISOString());
    console.log('   Method: POST /api/huidu/callback');
    console.log('   agency_uid:', dto.agency_uid);
    console.log('   payload (encrypted):', dto.payload ? dto.payload.substring(0, 100) + '...' : 'null');
    console.log('='.repeat(80));
    
    try {
      return await this.huiduService.processCallback(dto);
    } catch (error: any) {
      // Never throw HTTP errors to Huidu -- always return structured response
      console.log('❌ Callback processing error:', error?.message);
      return {
        code: 1,
        msg: error?.message || 'Internal error',
        payload: '',
      };
    }
  }
}
