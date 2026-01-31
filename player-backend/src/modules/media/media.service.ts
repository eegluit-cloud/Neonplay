import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { Prisma } from '@prisma/client';

export interface MediaAssetResponse {
  id: string;
  key: string;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  title: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
}

export interface MediaCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  allowedTypes: string[];
  maxFileSize: number;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly cachePrefix = 'media:';
  private readonly cacheTtl = 3600; // 1 hour
  private readonly cdnUrl: string;
  private readonly placeholderUrl: string;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
  ) {
    this.cdnUrl = this.config.get<string>('S3_CDN_URL') || '';
    this.placeholderUrl = this.config.get<string>('PLACEHOLDER_IMAGE_URL') || '/placeholder.svg';
  }

  /**
   * Get asset URL by key with caching and fallback
   */
  async getAssetUrl(key: string): Promise<string> {
    // Try cache first
    const cached = await this.redis.get<string>(`${this.cachePrefix}url:${key}`);
    if (cached) {
      return cached;
    }

    // Fetch from DB
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { key, isActive: true },
      select: { url: true },
    });

    if (asset?.url) {
      // Cache the URL
      await this.redis.set(`${this.cachePrefix}url:${key}`, asset.url, this.cacheTtl);
      return asset.url;
    }

    // Return placeholder
    return this.getPlaceholderUrl(key);
  }

  /**
   * Get multiple asset URLs by keys (batch operation)
   */
  async getAssetUrls(keys: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const uncachedKeys: string[] = [];

    // Check cache for all keys
    for (const key of keys) {
      const cached = await this.redis.get<string>(`${this.cachePrefix}url:${key}`);
      if (cached) {
        result[key] = cached;
      } else {
        uncachedKeys.push(key);
      }
    }

    // Fetch uncached from DB
    if (uncachedKeys.length > 0) {
      const assets = await this.prisma.mediaAsset.findMany({
        where: { key: { in: uncachedKeys }, isActive: true },
        select: { key: true, url: true },
      });

      for (const asset of assets) {
        result[asset.key] = asset.url;
        await this.redis.set(`${this.cachePrefix}url:${asset.key}`, asset.url, this.cacheTtl);
      }

      // Set placeholders for missing keys
      for (const key of uncachedKeys) {
        if (!result[key]) {
          result[key] = this.getPlaceholderUrl(key);
        }
      }
    }

    return result;
  }

  /**
   * Get full asset details by key
   */
  async getAsset(key: string): Promise<MediaAssetResponse | null> {
    const cacheKey = `${this.cachePrefix}asset:${key}`;
    const cached = await this.redis.get<MediaAssetResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const asset = await this.prisma.mediaAsset.findUnique({
      where: { key, isActive: true },
    });

    if (!asset) {
      return null;
    }

    const response: MediaAssetResponse = {
      id: asset.id,
      key: asset.key,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      altText: asset.altText,
      title: asset.title,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
    };

    await this.redis.set(cacheKey, JSON.stringify(response), this.cacheTtl);
    return response;
  }

  /**
   * Get all assets by category
   */
  async getAssetsByCategory(categorySlug: string): Promise<MediaAssetResponse[]> {
    const category = await this.prisma.mediaCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return [];
    }

    const assets = await this.prisma.mediaAsset.findMany({
      where: { categoryId: category.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((asset) => ({
      id: asset.id,
      key: asset.key,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      altText: asset.altText,
      title: asset.title,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
    }));
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<MediaCategoryResponse[]> {
    const categories = await this.prisma.mediaCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      allowedTypes: cat.allowedTypes as string[],
      maxFileSize: cat.maxFileSize,
    }));
  }

  /**
   * Create or update an asset (for admin/seeding)
   */
  async upsertAsset(data: {
    key: string;
    categorySlug: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
    altText?: string;
    title?: string;
    description?: string;
    metadata?: Record<string, unknown>;
    uploadedBy?: string;
  }): Promise<MediaAssetResponse> {
    const category = await this.prisma.mediaCategory.findUnique({
      where: { slug: data.categorySlug },
    });

    if (!category) {
      throw new NotFoundException(`Category ${data.categorySlug} not found`);
    }

    const asset = await this.prisma.mediaAsset.upsert({
      where: { key: data.key },
      update: {
        filename: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        width: data.width,
        height: data.height,
        thumbnailUrl: data.thumbnailUrl,
        altText: data.altText,
        title: data.title,
        description: data.description,
        metadata: data.metadata as Prisma.JsonObject,
        uploadedBy: data.uploadedBy,
      },
      create: {
        key: data.key,
        categoryId: category.id,
        filename: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        url: data.url,
        width: data.width,
        height: data.height,
        thumbnailUrl: data.thumbnailUrl,
        altText: data.altText,
        title: data.title,
        description: data.description,
        metadata: data.metadata as Prisma.JsonObject,
        uploadedBy: data.uploadedBy,
      },
    });

    // Invalidate cache
    await this.redis.del(`${this.cachePrefix}url:${data.key}`);
    await this.redis.del(`${this.cachePrefix}asset:${data.key}`);

    return {
      id: asset.id,
      key: asset.key,
      url: asset.url,
      thumbnailUrl: asset.thumbnailUrl,
      altText: asset.altText,
      title: asset.title,
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
    };
  }

  /**
   * Delete an asset
   */
  async deleteAsset(key: string): Promise<void> {
    await this.prisma.mediaAsset.delete({
      where: { key },
    });

    // Invalidate cache
    await this.redis.del(`${this.cachePrefix}url:${key}`);
    await this.redis.del(`${this.cachePrefix}asset:${key}`);
  }

  /**
   * Get placeholder URL based on asset key type
   */
  private getPlaceholderUrl(key: string): string {
    // Extract category from key (e.g., "game:slug" -> "game")
    const category = key.split(':')[0];

    // Return category-specific placeholders or default
    const placeholders: Record<string, string> = {
      game: '/placeholders/game.svg',
      provider: '/placeholders/provider.svg',
      banner: '/placeholders/banner.svg',
      icon: '/placeholders/icon.svg',
      avatar: '/placeholders/avatar.svg',
      video: '/placeholders/video.svg',
      team: '/placeholders/team.svg',
      prize: '/placeholders/prize.svg',
    };

    return placeholders[category] || this.placeholderUrl;
  }

  /**
   * Build full URL from relative path
   */
  buildUrl(relativePath: string): string {
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    return this.cdnUrl ? `${this.cdnUrl}/${relativePath}` : relativePath;
  }

  /**
   * Create a media category (for admin/seeding)
   */
  async upsertCategory(data: {
    name: string;
    slug: string;
    description?: string;
    allowedTypes: string[];
    maxFileSize: number;
    dimensions?: Record<string, unknown>;
    sortOrder?: number;
  }): Promise<MediaCategoryResponse> {
    const category = await this.prisma.mediaCategory.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description,
        allowedTypes: data.allowedTypes,
        maxFileSize: data.maxFileSize,
        dimensions: data.dimensions as Prisma.JsonObject,
        sortOrder: data.sortOrder ?? 0,
      },
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        allowedTypes: data.allowedTypes,
        maxFileSize: data.maxFileSize,
        dimensions: data.dimensions as Prisma.JsonObject,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      allowedTypes: category.allowedTypes as string[],
      maxFileSize: category.maxFileSize,
    };
  }
}
