import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all game providers' })
  async getProviders() {
    return this.providersService.getProviders();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get provider details with their games' })
  @ApiParam({ name: 'slug', description: 'Provider slug' })
  async getProviderBySlug(@Param('slug') slug: string) {
    return this.providersService.getProviderBySlug(slug);
  }
}
