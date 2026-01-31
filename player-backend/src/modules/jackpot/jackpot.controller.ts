import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JackpotService, RecentWinsQueryDto } from './jackpot.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Jackpots')
@Controller('jackpots')
export class JackpotController {
  constructor(private readonly jackpotService: JackpotService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active jackpots' })
  async getJackpots() {
    return this.jackpotService.getJackpots();
  }

  @Public()
  @Get('recent-wins')
  @ApiOperation({ summary: 'Get recent jackpot wins' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'jackpotId', required: false, type: String })
  @ApiQuery({ name: 'gameId', required: false, type: String })
  async getRecentWins(@Query() query: RecentWinsQueryDto) {
    return this.jackpotService.getRecentWins(query);
  }

  @Public()
  @Get('type/:type')
  @ApiOperation({ summary: 'Get jackpot by type (mini, minor, major, grand)' })
  async getJackpotByType(@Param('type') type: string) {
    return this.jackpotService.getJackpotByType(type);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get jackpot details by ID' })
  async getJackpotById(@Param('id') id: string) {
    return this.jackpotService.getJackpotById(id);
  }
}
