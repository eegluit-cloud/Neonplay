import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('CMS')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Public()
  @Get('pages/:slug')
  @ApiOperation({ summary: 'Get static page by slug' })
  @ApiParam({
    name: 'slug',
    description: 'Page slug (e.g., terms, privacy, about)',
    example: 'terms',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the static page content',
  })
  @ApiResponse({
    status: 404,
    description: 'Page not found',
  })
  async getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }

  @Public()
  @Get('announcements')
  @ApiOperation({ summary: 'Get all active announcements' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of active announcements',
  })
  async getAnnouncements() {
    return this.cmsService.getAnnouncements();
  }

  @Public()
  @Get('announcements/pinned')
  @ApiOperation({ summary: 'Get pinned announcements only' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of pinned announcements',
  })
  async getPinnedAnnouncements() {
    return this.cmsService.getPinnedAnnouncements();
  }

  @Public()
  @Get('settings/:key')
  @ApiOperation({ summary: 'Get site setting by key' })
  @ApiParam({
    name: 'key',
    description: 'Setting key',
    example: 'support_email',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the setting value',
  })
  @ApiResponse({
    status: 404,
    description: 'Setting not found',
  })
  async getSiteSetting(@Param('key') key: string) {
    const value = await this.cmsService.getSiteSetting(key);
    if (value === null) {
      return { key, value: null };
    }
    return { key, value };
  }

  @Public()
  @Get('social-links')
  @ApiOperation({ summary: 'Get social media links' })
  @ApiResponse({
    status: 200,
    description: 'Returns social media links',
  })
  async getSocialLinks() {
    return this.cmsService.getSocialLinks();
  }

  @Public()
  @Get('hero-banners')
  @ApiOperation({ summary: 'Get hero banners for homepage' })
  @ApiQuery({
    name: 'platform',
    required: false,
    enum: ['desktop', 'mobile', 'tablet'],
    description: 'Filter banners by platform',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns list of active hero banners',
  })
  async getHeroBanners(
    @Query('platform') platform?: 'desktop' | 'mobile' | 'tablet',
  ) {
    return this.cmsService.getHeroBanners(platform);
  }
}
