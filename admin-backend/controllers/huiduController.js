const prisma = require('../lib/prisma');
const huidu = require('../lib/huidu');
const { invalidateProviderCache, invalidateGameCache } = require('../lib/redis');

// Game type -> category slug mapping
const GAME_TYPE_MAP = {
  'Slot': 'slots',
  'Slots': 'slots',
  'Slot Game': 'slots',
  'Fish': 'fish',
  'Fishing': 'fish',
  'Table': 'table-games',
  'Card': 'table-games',
  'Casino': 'table-games',
  'Live': 'live-casino',
  'Live Casino': 'live-casino',
  'Crash': 'crash',
  'Sports': 'sports',
  'Mini': 'mini-games',
  'Esports': 'esports',
  'E-Sports': 'esports',
};

const getOrCreateCategory = async (gameType) => {
  const slug = GAME_TYPE_MAP[gameType] || 'other';
  let category = await prisma.gameCategory.findUnique({ where: { slug } });
  if (!category) {
    category = await prisma.gameCategory.create({
      data: { name: gameType || 'Other', slug, isActive: true, sortOrder: 99 },
    });
  }
  return category;
};

// POST /api/huidu/sync/providers
const syncProviders = async (req, res) => {
  try {
    // Ensure Huidu aggregator exists
    let aggregator = await prisma.gameAggregator.findUnique({ where: { slug: 'huidu' } });
    if (!aggregator) {
      aggregator = await prisma.gameAggregator.create({
        data: {
          name: 'Huidu',
          slug: 'huidu',
          apiEndpoint: process.env.HUIDU_SERVER_URL || 'https://jsgame.live',
          isActive: true,
          config: { agency_uid: process.env.HUIDU_AGENCY_UID },
        },
      });
    }

    const providers = await huidu.getProviders();
    let created = 0;
    let updated = 0;

    for (const p of providers) {
      const slug = `huidu-${p.code}`;
      const existing = await prisma.gameProvider.findUnique({ where: { slug } });

      if (existing) {
        await prisma.gameProvider.update({
          where: { slug },
          data: { name: p.name, isActive: p.status === 1 },
        });
        updated++;
      } else {
        await prisma.gameProvider.create({
          data: {
            name: p.name,
            slug,
            aggregatorId: aggregator.id,
            isActive: p.status === 1,
            config: { huidu_code: p.code },
          },
        });
        created++;
      }
    }

    await invalidateProviderCache();

    res.json({
      message: `Synced ${providers.length} providers`,
      created,
      updated,
      total: providers.length,
    });
  } catch (error) {
    console.error('Sync providers error:', error);
    res.status(500).json({ error: `Failed to sync providers: ${error.message}` });
  }
};

// POST /api/huidu/sync/games/:providerCode
const syncGames = async (req, res) => {
  try {
    const { providerCode } = req.params;
    const slug = `huidu-${providerCode}`;
    const provider = await prisma.gameProvider.findUnique({ where: { slug } });

    if (!provider) {
      return res.status(404).json({ error: `Provider ${slug} not found. Sync providers first.` });
    }

    const games = await huidu.getGameList(providerCode);
    let created = 0;
    let updated = 0;

    for (const g of games) {
      const category = await getOrCreateCategory(g.game_type);
      const gameSlug = `${slug}-${g.game_uid.slice(0, 8)}`.toLowerCase();
      const existing = await prisma.game.findFirst({
        where: { externalGameId: g.game_uid, providerId: provider.id },
      });

      if (existing) {
        await prisma.game.update({
          where: { id: existing.id },
          data: {
            name: g.game_name,
            isActive: g.status === 1,
            categoryId: category.id,
          },
        });
        updated++;
      } else {
        await prisma.game.create({
          data: {
            name: g.game_name,
            slug: gameSlug,
            externalGameId: g.game_uid,
            providerId: provider.id,
            categoryId: category.id,
            isActive: g.status === 1,
            isNew: true,
          },
        });
        created++;
      }
    }

    await invalidateGameCache();

    res.json({
      message: `Synced ${games.length} games for ${providerCode}`,
      created,
      updated,
      total: games.length,
      providerCode,
    });
  } catch (error) {
    console.error('Sync games error:', error);
    res.status(500).json({ error: `Failed to sync games: ${error.message}` });
  }
};

// POST /api/huidu/sync/all-games
const syncAllGames = async (req, res) => {
  try {
    const providers = await prisma.gameProvider.findMany({
      where: { aggregator: { slug: 'huidu' } },
      select: { id: true, slug: true, config: true },
    });

    if (providers.length === 0) {
      return res.status(400).json({ error: 'No Huidu providers found. Sync providers first.' });
    }

    const results = [];
    for (const p of providers) {
      const code = p.config?.huidu_code || p.slug.replace('huidu-', '');
      try {
        const games = await huidu.getGameList(code);
        const category_cache = {};
        let created = 0;
        let updated = 0;

        for (const g of games) {
          // Cache category lookups
          if (!category_cache[g.game_type]) {
            category_cache[g.game_type] = await getOrCreateCategory(g.game_type);
          }
          const category = category_cache[g.game_type];
          const gameSlug = `${p.slug}-${g.game_uid.slice(0, 8)}`.toLowerCase();

          const existing = await prisma.game.findFirst({
            where: { externalGameId: g.game_uid, providerId: p.id },
          });

          if (existing) {
            await prisma.game.update({
              where: { id: existing.id },
              data: {
                name: g.game_name,
                isActive: g.status === 1,
                categoryId: category.id,
              },
            });
            updated++;
          } else {
            await prisma.game.create({
              data: {
                name: g.game_name,
                slug: gameSlug,
                externalGameId: g.game_uid,
                providerId: p.id,
                categoryId: category.id,
                isActive: g.status === 1,
                isNew: true,
              },
            });
            created++;
          }
        }

        results.push({ provider: code, games: games.length, created, updated, status: 'ok' });
      } catch (err) {
        results.push({ provider: code, error: err.message, status: 'failed' });
      }
    }

    await invalidateGameCache();

    const totalGames = results.reduce((sum, r) => sum + (r.games || 0), 0);
    const totalCreated = results.reduce((sum, r) => sum + (r.created || 0), 0);
    const totalUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0);
    const failed = results.filter((r) => r.status === 'failed').length;

    res.json({
      message: `Sync complete: ${totalGames} games across ${providers.length} providers`,
      totalGames,
      totalCreated,
      totalUpdated,
      providersProcessed: providers.length,
      providersFailed: failed,
      results,
    });
  } catch (error) {
    console.error('Sync all games error:', error);
    res.status(500).json({ error: `Failed to sync all games: ${error.message}` });
  }
};

// GET /api/huidu/status
const getStatus = async (req, res) => {
  try {
    const aggregator = await prisma.gameAggregator.findUnique({ where: { slug: 'huidu' } });

    const providerCount = await prisma.gameProvider.count({
      where: { aggregator: { slug: 'huidu' } },
    });

    const gameCount = await prisma.game.count({
      where: { provider: { aggregator: { slug: 'huidu' } } },
    });

    const activeGameCount = await prisma.game.count({
      where: { provider: { aggregator: { slug: 'huidu' } }, isActive: true },
    });

    res.json({
      aggregator: aggregator
        ? { id: aggregator.id, name: aggregator.name, isActive: aggregator.isActive }
        : null,
      providerCount,
      gameCount,
      activeGameCount,
    });
  } catch (error) {
    console.error('Get Huidu status error:', error);
    res.status(500).json({ error: 'Failed to get Huidu status' });
  }
};

module.exports = { syncProviders, syncGames, syncAllGames, getStatus };
