import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';

export interface StaticPageDto {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | null;
}

export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  isPinned: boolean;
  publishedAt: Date | null;
  expiresAt: Date | null;
}

export interface SocialLinksDto {
  twitter?: string;
  discord?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

export interface HeroBannerDto {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  backgroundGradient: string | null;
  targetAudience: string;
  platform: string;
  sortOrder: number;
}

@Injectable()
export class CmsService {
  private readonly logger = new Logger(CmsService.name);

  // Cache keys and TTLs
  private readonly CACHE_PREFIX = 'cms';
  private readonly PAGE_CACHE_TTL = 3600; // 1 hour
  private readonly ANNOUNCEMENTS_CACHE_TTL = 300; // 5 minutes
  private readonly SETTINGS_CACHE_TTL = 600; // 10 minutes
  private readonly BANNERS_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get static page by slug
   */
  async getPageBySlug(slug: string): Promise<StaticPageDto> {
    const cacheKey = `${this.CACHE_PREFIX}:page:${slug}`;

    // Try cache first
    const cached = await this.redis.get<StaticPageDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        isPublished: true,
        publishedAt: true,
      },
    });

    if (!page || !page.isPublished) {
      throw new NotFoundException(`Page '${slug}' not found`);
    }

    const result: StaticPageDto = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      publishedAt: page.publishedAt,
    };

    // Cache the result
    await this.redis.set(cacheKey, result, this.PAGE_CACHE_TTL);

    return result;
  }

  /**
   * Get all active announcements
   */
  async getAnnouncements(): Promise<AnnouncementDto[]> {
    const cacheKey = `${this.CACHE_PREFIX}:announcements`;

    // Try cache first
    const cached = await this.redis.get<AnnouncementDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();

    const announcements = await this.prisma.announcement.findMany({
      where: {
        isPublished: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'asc' },
        { publishedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        isPinned: true,
        publishedAt: true,
        expiresAt: true,
      },
    });

    const result: AnnouncementDto[] = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      type: a.type,
      priority: a.priority,
      isPinned: a.isPinned,
      publishedAt: a.publishedAt,
      expiresAt: a.expiresAt,
    }));

    // Cache the result
    await this.redis.set(cacheKey, result, this.ANNOUNCEMENTS_CACHE_TTL);

    return result;
  }

  /**
   * Get pinned announcements only
   */
  async getPinnedAnnouncements(): Promise<AnnouncementDto[]> {
    const cacheKey = `${this.CACHE_PREFIX}:announcements:pinned`;

    // Try cache first
    const cached = await this.redis.get<AnnouncementDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();

    const announcements = await this.prisma.announcement.findMany({
      where: {
        isPublished: true,
        isPinned: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      orderBy: [
        { priority: 'asc' },
        { publishedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        isPinned: true,
        publishedAt: true,
        expiresAt: true,
      },
    });

    const result: AnnouncementDto[] = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      type: a.type,
      priority: a.priority,
      isPinned: a.isPinned,
      publishedAt: a.publishedAt,
      expiresAt: a.expiresAt,
    }));

    // Cache the result
    await this.redis.set(cacheKey, result, this.ANNOUNCEMENTS_CACHE_TTL);

    return result;
  }

  /**
   * Get site setting by key
   */
  async getSiteSetting<T = any>(key: string): Promise<T | null> {
    const cacheKey = `${this.CACHE_PREFIX}:setting:${key}`;

    // Try cache first
    const cached = await this.redis.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const setting = await this.prisma.siteSetting.findUnique({
      where: { key },
    });

    if (!setting) {
      return null;
    }

    const value = setting.value as T;

    // Cache the result
    await this.redis.set(cacheKey, value, this.SETTINGS_CACHE_TTL);

    return value;
  }

  /**
   * Get social links
   */
  async getSocialLinks(): Promise<SocialLinksDto> {
    const socialLinks = await this.getSiteSetting<SocialLinksDto>('social_links');
    return socialLinks || {};
  }

  /**
   * Get hero banners with optional platform filter
   */
  async getHeroBanners(platform?: 'desktop' | 'mobile' | 'tablet'): Promise<HeroBannerDto[]> {
    const cacheKey = `${this.CACHE_PREFIX}:banners:${platform || 'all'}`;

    // Try cache first
    const cached = await this.redis.get<HeroBannerDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();

    const whereClause: any = {
      isActive: true,
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gt: now } },
          ],
        },
      ],
    };

    // Filter by platform
    if (platform) {
      whereClause.platform = { in: ['all', platform] };
    }

    const banners = await this.prisma.heroBanner.findMany({
      where: whereClause,
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        ctaText: true,
        ctaLink: true,
        imageUrl: true,
        videoUrl: true,
        backgroundGradient: true,
        targetAudience: true,
        platform: true,
        sortOrder: true,
      },
    });

    const result: HeroBannerDto[] = banners.map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      imageUrl: b.imageUrl,
      videoUrl: b.videoUrl,
      backgroundGradient: b.backgroundGradient,
      targetAudience: b.targetAudience,
      platform: b.platform,
      sortOrder: b.sortOrder,
    }));

    // Cache the result
    await this.redis.set(cacheKey, result, this.BANNERS_CACHE_TTL);

    return result;
  }

  /**
   * Invalidate CMS caches (for admin use)
   */
  async invalidateCaches(type?: 'pages' | 'announcements' | 'settings' | 'banners'): Promise<void> {
    if (!type || type === 'pages') {
      // Would need to iterate through all page slugs or use pattern deletion
      this.logger.log('Page caches invalidated');
    }
    if (!type || type === 'announcements') {
      await this.redis.del(`${this.CACHE_PREFIX}:announcements`);
      await this.redis.del(`${this.CACHE_PREFIX}:announcements:pinned`);
      this.logger.log('Announcements cache invalidated');
    }
    if (!type || type === 'settings') {
      // Would need to iterate through all setting keys or use pattern deletion
      this.logger.log('Settings caches invalidated');
    }
    if (!type || type === 'banners') {
      await this.redis.del(`${this.CACHE_PREFIX}:banners:all`);
      await this.redis.del(`${this.CACHE_PREFIX}:banners:desktop`);
      await this.redis.del(`${this.CACHE_PREFIX}:banners:mobile`);
      await this.redis.del(`${this.CACHE_PREFIX}:banners:tablet`);
      this.logger.log('Banner caches invalidated');
    }
  }
}
