import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AmoeService, PostalAddress } from './amoe.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('AMOE')
@Controller('amoe')
export class AmoeController {
  constructor(private readonly amoeService: AmoeService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Get AMOE configuration and eligibility rules' })
  async getConfig() {
    return this.amoeService.getConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-code')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate an AMOE code for mail-in entry' })
  async generateCode(
    @CurrentUser('id') userId: string,
    @CurrentUser('email') email: string,
  ) {
    return this.amoeService.generateCode(userId, email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit an AMOE entry with postal address' })
  async submitEntry(
    @CurrentUser('id') userId: string,
    @Body() body: { code: string; postalAddress: PostalAddress },
  ) {
    return this.amoeService.submitEntry(userId, body.code, body.postalAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Get('entries')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user AMOE entry history' })
  async getUserEntries(@CurrentUser('id') userId: string) {
    return this.amoeService.getUserEntries(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('redeem')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Redeem an approved AMOE entry' })
  async redeemEntry(
    @CurrentUser('id') userId: string,
    @Body() body: { entryId: string },
  ) {
    return this.amoeService.redeemEntry(userId, body.entryId);
  }
}
