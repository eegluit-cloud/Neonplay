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
    try {
      return await this.huiduService.processCallback(dto);
    } catch (error: any) {
      // Never throw HTTP errors to Huidu -- always return structured response
      return {
        code: 1,
        msg: error?.message || 'Internal error',
        payload: '',
      };
    }
  }
}
