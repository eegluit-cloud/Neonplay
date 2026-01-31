import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getProviders() {
    const cacheKey = 'providers:list';
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const providers = await this.prisma.gameProvider.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        _count: {
          select: {
            games: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const result = providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      logoUrl: provider.logoUrl,
      gameCount: provider._count.games,
    }));

    // Cache for 10 minutes
    await this.redis.set(cacheKey, result, 600);

    return result;
  }

  async getProviderBySlug(slug: string) {
    const cacheKey = `providers:${slug}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
    }

    const provider = await this.prisma.gameProvider.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
        games: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { playCount: 'desc' }],
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnailUrl: true,
            bannerUrl: true,
            rtp: true,
            volatility: true,
            minBet: true,
            maxBet: true,
            isFeatured: true,
            isNew: true,
            isHot: true,
            playCount: true,
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
    });

    if (!provider || !provider.isActive) {
      throw new NotFoundException('Provider not found');
    }

    const result = {
      id: provider.id,
      name: provider.name,
      slug: provider.slug,
      logoUrl: provider.logoUrl,
      gameCount: provider.games.length,
      games: provider.games,
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, result, 300);

    return result;
  }
}
