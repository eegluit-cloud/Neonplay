import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { MediaService, MediaAssetResponse, MediaCategoryResponse } from './media.service';

@ApiTags('Media')
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all media categories' })
  @ApiResponse({ status: 200, description: 'Returns all active media categories' })
  async getCategories(): Promise<MediaCategoryResponse[]> {
    return this.mediaService.getCategories();
  }

  @Get('assets/:key')
  @ApiOperation({ summary: 'Get asset by key' })
  @ApiParam({ name: 'key', description: 'Asset key (e.g., game:gates-of-olympus)' })
  @ApiResponse({ status: 200, description: 'Returns the asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getAsset(@Param('key') key: string): Promise<MediaAssetResponse> {
    const asset = await this.mediaService.getAsset(key);
    if (!asset) {
      throw new NotFoundException(`Asset with key ${key} not found`);
    }
    return asset;
  }

  @Get('url/:key')
  @ApiOperation({ summary: 'Get asset URL by key (returns placeholder if not found)' })
  @ApiParam({ name: 'key', description: 'Asset key (e.g., game:gates-of-olympus)' })
  @ApiResponse({ status: 200, description: 'Returns the asset URL or placeholder' })
  async getAssetUrl(@Param('key') key: string): Promise<{ url: string }> {
    const url = await this.mediaService.getAssetUrl(key);
    return { url };
  }

  @Get('urls')
  @ApiOperation({ summary: 'Get multiple asset URLs by keys' })
  @ApiQuery({ name: 'keys', description: 'Comma-separated asset keys', required: true })
  @ApiResponse({ status: 200, description: 'Returns a map of keys to URLs' })
  async getAssetUrls(@Query('keys') keys: string): Promise<Record<string, string>> {
    const keyArray = keys.split(',').map((k) => k.trim()).filter(Boolean);
    return this.mediaService.getAssetUrls(keyArray);
  }

  @Get('category/:slug')
  @ApiOperation({ summary: 'Get all assets in a category' })
  @ApiParam({ name: 'slug', description: 'Category slug (e.g., game-thumbnails)' })
  @ApiResponse({ status: 200, description: 'Returns all assets in the category' })
  async getAssetsByCategory(@Param('slug') slug: string): Promise<MediaAssetResponse[]> {
    return this.mediaService.getAssetsByCategory(slug);
  }
}
