import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

export interface VideosQueryDto extends PaginationDto {
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'featured';
  sortOrder?: 'asc' | 'desc';
  isLive?: boolean;
}

export interface VideoDto {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  videoUrl: string;
  durationSeconds: number;
  viewCount: number;
  isFeatured: boolean;
  isLive: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface VideoCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  videoCount: number;
}

export interface TrackVideoViewDto {
  watchedSeconds: number;
  completed?: boolean;
}

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  // Cache keys and TTLs
  private readonly CACHE_PREFIX = 'content';
  private readonly FEATURED_VIDEOS_KEY = `${this.CACHE_PREFIX}:videos:featured`;
  private readonly LIVE_VIDEOS_KEY = `${this.CACHE_PREFIX}:videos:live`;
  private readonly CATEGORIES_KEY = `${this.CACHE_PREFIX}:categories`;
  private readonly FEATURED_CACHE_TTL = 300; // 5 minutes
  private readonly LIVE_CACHE_TTL = 60; // 1 minute
  private readonly CATEGORIES_CACHE_TTL = 600; // 10 minutes
  private readonly VIDEO_CACHE_TTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get paginated videos with filtering
   */
  async getVideos(query: VideosQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {
      publishedAt: { lte: new Date() },
    };

    // Filter by category slug
    if (query.category) {
      where.category = { slug: query.category };
    }

    // Filter by live status
    if (query.isLive !== undefined) {
      where.isLive = query.isLive;
    }

    // Search by title/description
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Determine sort order
    let orderBy: any = { publishedAt: 'desc' };
    const sortDirection = query.sortOrder || 'desc';

    switch (query.sortBy) {
      case 'popular':
        orderBy = { viewCount: sortDirection };
        break;
      case 'featured':
        orderBy = [{ isFeatured: 'desc' }, { publishedAt: 'desc' }];
        break;
      case 'newest':
      default:
        orderBy = { publishedAt: sortDirection };
    }

    const [videos, total] = await Promise.all([
      this.prisma.contentVideo.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          title: true,
          description: true,
          thumbnailUrl: true,
          videoUrl: true,
          durationSeconds: true,
          viewCount: true,
          isFeatured: true,
          isLive: true,
          publishedAt: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.contentVideo.count({ where }),
    ]);

    return createPaginatedResult(videos, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get featured videos for WBCTV homepage
   */
  async getFeaturedVideos(): Promise<VideoDto[]> {
    // Try cache first
    const cached = await this.redis.get<VideoDto[]>(this.FEATURED_VIDEOS_KEY);
    if (cached) {
      return cached;
    }

    const videos = await this.prisma.contentVideo.findMany({
      where: {
        isFeatured: true,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        videoUrl: true,
        durationSeconds: true,
        viewCount: true,
        isFeatured: true,
        isLive: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Cache the result
    await this.redis.set(this.FEATURED_VIDEOS_KEY, videos, this.FEATURED_CACHE_TTL);

    return videos as VideoDto[];
  }

  /**
   * Get live videos/streams
   */
  async getLiveVideos(): Promise<VideoDto[]> {
    // Try cache first
    const cached = await this.redis.get<VideoDto[]>(this.LIVE_VIDEOS_KEY);
    if (cached) {
      return cached;
    }

    const videos = await this.prisma.contentVideo.findMany({
      where: {
        isLive: true,
      },
      orderBy: { viewCount: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        videoUrl: true,
        durationSeconds: true,
        viewCount: true,
        isFeatured: true,
        isLive: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Cache with shorter TTL for live content
    await this.redis.set(this.LIVE_VIDEOS_KEY, videos, this.LIVE_CACHE_TTL);

    return videos as VideoDto[];
  }

  /**
   * Get video by ID
   */
  async getVideoById(id: string): Promise<VideoDto> {
    const cacheKey = `${this.CACHE_PREFIX}:video:${id}`;

    // Try cache first
    const cached = await this.redis.get<VideoDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const video = await this.prisma.contentVideo.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        videoUrl: true,
        durationSeconds: true,
        viewCount: true,
        isFeatured: true,
        isLive: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Cache the result
    await this.redis.set(cacheKey, video, this.VIDEO_CACHE_TTL);

    return video as VideoDto;
  }

  /**
   * Track video view and watch progress
   */
  async trackVideoView(
    userId: string | null,
    videoId: string,
    watchedSeconds: number,
    completed: boolean = false,
  ): Promise<{ success: boolean }> {
    // Verify video exists
    const video = await this.prisma.contentVideo.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Create view record (ContentView doesn't have unique constraint on userId+videoId)
    await this.prisma.contentView.create({
      data: {
        videoId,
        userId,
        watchedSeconds,
        completed,
      },
    });

    // Increment video view count
    await this.prisma.contentVideo.update({
      where: { id: videoId },
      data: { viewCount: { increment: 1 } },
    });

    // Invalidate video cache
    await this.redis.del(`${this.CACHE_PREFIX}:video:${videoId}`);

    return { success: true };
  }

  /**
   * Get video categories
   */
  async getCategories(): Promise<VideoCategoryDto[]> {
    // Try cache first
    const cached = await this.redis.get<VideoCategoryDto[]>(this.CATEGORIES_KEY);
    if (cached) {
      return cached;
    }

    const categories = await this.prisma.contentCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            videos: {
              where: {
                publishedAt: { lte: new Date() },
              },
            },
          },
        },
      },
    });

    const result: VideoCategoryDto[] = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: null, // ContentCategory doesn't have description field
      videoCount: category._count.videos,
    }));

    // Cache the result
    await this.redis.set(this.CATEGORIES_KEY, result, this.CATEGORIES_CACHE_TTL);

    return result;
  }

  /**
   * Get user's video watch history
   */
  async getUserWatchHistory(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [views, total] = await Promise.all([
      this.prisma.contentView.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          watchedSeconds: true,
          completed: true,
          createdAt: true,
          video: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              durationSeconds: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.contentView.count({ where: { userId } }),
    ]);

    const items = views.map((view: any) => ({
      ...view.video,
      watchedSeconds: view.watchedSeconds,
      completed: view.completed,
      watchedAt: view.createdAt,
      progress: view.video.durationSeconds
        ? Math.round((view.watchedSeconds / view.video.durationSeconds) * 100)
        : 0,
    }));

    return createPaginatedResult(items, total, query.page || 1, query.limit || 20);
  }

  /**
   * Invalidate all content caches (admin use)
   */
  async invalidateAllCaches(): Promise<void> {
    await Promise.all([
      this.redis.del(this.FEATURED_VIDEOS_KEY),
      this.redis.del(this.LIVE_VIDEOS_KEY),
      this.redis.del(this.CATEGORIES_KEY),
    ]);
    this.logger.log('All content caches invalidated');
  }
}
