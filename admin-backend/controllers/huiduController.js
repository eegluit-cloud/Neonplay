const prisma = require('../lib/prisma');
const huidu = require('../lib/huidu');
const XLSX = require('xlsx');
const { invalidateProviderCache, invalidateGameCache } = require('../lib/redis');

// Game type -> category slug mapping (comprehensive for Excel + API ingestion)
const GAME_TYPE_MAP = {
  // Slots
  'Slot': 'slots', 'Slots': 'slots', 'SLot': 'slots', 'SLots': 'slots',
  'Slot Game': 'slots', 'Slot game': 'slots', 'slot': 'slots', 'slot game': 'slots',
  'Video Slot': 'slots', 'Video Slots': 'slots', 'video slot': 'slots',
  'POP Slots': 'slots', 'POP Jackpot Slots': 'slots', 'Progressive Slot Machines': 'slots',
  'slot/arcade': 'slots', 'CasinoLive & Slot': 'slots', 'HTML5 3D slot': 'slots',
  'Slot (Pocketz)': 'slots', 'Slot/Buy Bonus': 'slots', 'Electronic': 'slots',
  // Live Casino
  'Live': 'live-casino', 'Live Casino': 'live-casino', 'CasinoLive': 'live-casino',
  'live': 'live-casino', 'Live Grand': 'live-casino',
  // Table Games
  'Table': 'table-games', 'Table Game': 'table-games', 'Table Games': 'table-games',
  'Table game': 'table-games', 'table': 'table-games', 'table game': 'table-games',
  'TableGame': 'table-games', 'Card': 'table-games', 'Card Game': 'table-games',
  'Card game': 'table-games', 'card': 'table-games', 'cards game': 'table-games',
  'CARD': 'table-games', 'Casino': 'table-games', 'Casino Games': 'table-games',
  'Casino game': 'table-games', 'casino': 'table-games', 'CasinoTable': 'table-games',
  'CASINO': 'table-games', 'Roulette': 'table-games', 'Roulette/Other': 'table-games',
  'baccarat': 'table-games', 'blackjack': 'table-games', 'roulette': 'table-games',
  'poker': 'table-games', 'Poker&Game': 'table-games', 'Table/Poker': 'table-games',
  'Table/Board game': 'table-games', 'P2P Poker': 'table-games', 'India Poker': 'table-games',
  'Video Poker': 'table-games', 'P2P(对战棋牌)': 'table-games',
  '棋牌游戏': 'table-games', '棋牌类': 'table-games', '百人场': 'table-games', '百人游戏': 'table-games',
  // Fish / Shooting
  'Fish': 'fish', 'FISH': 'fish', 'Fish Game': 'fish', 'fish': 'fish',
  'Fish/Shooting': 'fish', 'FISHING': 'fish', 'Fishing': 'fish', 'Shooting': 'fish',
  '捕鱼': 'fish',
  // Crash
  'Crash': 'crash', 'CRASH': 'crash', 'Crash Game': 'crash', 'Crash Type': 'crash',
  'crash game': 'crash', '\u0441rash': 'crash', 'Blockchain/Crash': 'crash',
  // Sports
  'Sports': 'sports', 'Sports Game': 'sports',
  // Esports
  'ESports': 'esports', 'Esports': 'esports', 'E-Sports': 'esports',
  // Lottery / Bingo / Keno
  'Lottery': 'lottery', 'Lottery Game': 'lottery', 'Lotto': 'lottery', 'lotto': 'lottery',
  'Scratch Lottery': 'lottery', 'Scratch Games': 'lottery', 'Scratch cards': 'lottery',
  'Bingo': 'lottery', 'Bingo game': 'lottery', 'Video Bingo': 'lottery',
  'Keno': 'lottery', 'keno': 'lottery', 'keno game': 'lottery', '彩票': 'lottery',
  // Arcade
  'Arcade': 'arcade', 'ARCADE': 'arcade', 'Arcade Game': 'arcade', 'Arcade game': 'arcade',
  'Aracde': 'arcade', 'arcade': 'arcade', 'Arcade/Other': 'arcade',
  'Arcade/Table game': 'arcade', '街机': 'arcade', '多人街機': 'arcade',
  'Monster Games': 'arcade', 'Animal': 'arcade',
  // Instant Win
  'Instant': 'instant-win', 'Instant Win': 'instant-win', 'InstantWin': 'instant-win',
  'instant': 'instant-win', 'instant game': 'instant-win', 'instant win game': 'instant-win',
  'FastGames': 'instant-win', 'TurboGames': 'instant-win', 'Gamble Game': 'instant-win',
  'Cash': 'instant-win', 'Wheel of Fotrune': 'instant-win',
  // Mini Games / Other
  'Mini': 'mini-games', 'Mini Games': 'mini-games', 'MiniA': 'mini-games',
  'MiniB': 'mini-games', 'MIniC': 'mini-games', 'mini': 'mini-games',
  'Original': 'mini-games', 'original': 'mini-games', 'Other': 'mini-games',
  'other': 'mini-games', 'Casual': 'mini-games', 'Classic Games': 'mini-games',
  'XGames': 'mini-games', 'Multiplayer': 'mini-games', 'Numeric': 'mini-games',
  // Blockchain / Provably Fair
  'Blockchain/HiLo': 'blockchain', 'Blockchain/Limbo': 'blockchain',
  'Blockchain/Mines': 'blockchain', 'Blockchain/Plinko': 'blockchain',
  'Blockchain/Plinko Buy Bunus': 'blockchain', 'Blockchain/Tower': 'blockchain',
  'Plinko': 'blockchain', 'plinko game': 'blockchain',
  'Dice': 'blockchain', 'dice game': 'blockchain',
  'Marbles': 'blockchain', 'marbles': 'blockchain',
  'mine game': 'blockchain', 'tower game': 'blockchain', 'Step Flow': 'blockchain',
  // Cockfighting
  'Cockfighting': 'cockfighting', '斗鸡': 'cockfighting',
  // Virtual Sports
  'VirtualSports': 'virtual-sports',
  // Lobby (skip these)
  'Lobby': 'lobby', 'lobby': 'lobby',
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

// Sheets to skip during Excel import
const SKIP_SHEETS = new Set(['Menu目录', 'currency', 'language']);

// Sanitize sheet name to a URL-safe slug
const toProviderSlug = (sheetName) => {
  return 'huidu-' + sheetName
    .toLowerCase()
    .replace(/[()（）[\]【】]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Detect column indices from header row (handles 3 major patterns)
const detectColumns = (headerRow) => {
  const cols = { name: -1, uid: -1, type: -1, code: -1, rtp: -1, currency: -1, language: -1 };
  if (!headerRow) return cols;

  for (let i = 0; i < headerRow.length; i++) {
    const val = String(headerRow[i] || '').trim();
    if (val === 'Game Name') cols.name = i;
    else if (val === 'Game UID') cols.uid = i;
    else if (val === 'Game Type') cols.type = i;
    else if (val === 'Code' || val === 'code') cols.code = i;
    else if (val === 'RTP') cols.rtp = i;
    else if (val === '货币') cols.currency = i;
    else if (val === '语言') cols.language = i;
  }
  return cols;
};

// POST /api/huidu/import/excel
const importExcelGames = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Send .xlsx file as "file" field.' });
    }

    console.log(`[Huidu Excel Import] Parsing file: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(1)}MB)`);

    // Parse Excel from buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames.filter((n) => !SKIP_SHEETS.has(n));

    console.log(`[Huidu Excel Import] Found ${sheetNames.length} provider sheets`);

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

    // Category cache to avoid repeated DB lookups
    const categoryCache = {};
    const categoriesCreated = [];
    const providerResults = [];
    const skippedSheets = [...SKIP_SHEETS];
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const sheetName of sheetNames) {
      const ws = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

      if (rows.length < 2) {
        skippedSheets.push(sheetName);
        continue;
      }

      // Detect header columns
      const cols = detectColumns(rows[0]);
      if (cols.uid === -1 || cols.name === -1) {
        skippedSheets.push(sheetName);
        continue;
      }

      // Check if provider is offline/suspended
      const isOffline = /下架|暂停/.test(sheetName);
      const providerSlug = toProviderSlug(sheetName);

      // Collect provider-level currencies and languages
      const currencies = new Set();
      const languages = new Set();
      const gameRows = [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const uid = row[cols.uid];
        const name = row[cols.name];
        if (!uid || !name) continue;

        // Collect currency/language (provider-level, spread across rows)
        if (cols.currency !== -1 && row[cols.currency]) {
          const cur = String(row[cols.currency]).trim();
          if (cur && cur.length <= 5) currencies.add(cur);
        }
        if (cols.language !== -1 && row[cols.language]) {
          const lang = String(row[cols.language]).trim();
          if (lang && lang.length <= 5) languages.add(lang);
        }

        gameRows.push({
          uid: String(uid).trim(),
          name: String(name).trim(),
          type: cols.type !== -1 && row[cols.type] ? String(row[cols.type]).trim() : null,
          code: cols.code !== -1 && row[cols.code] != null ? String(row[cols.code]).trim() : null,
          rtp: cols.rtp !== -1 && row[cols.rtp] != null ? Number(row[cols.rtp]) : null,
        });
      }

      if (gameRows.length === 0) {
        skippedSheets.push(sheetName);
        continue;
      }

      // Upsert provider
      const existingProvider = await prisma.gameProvider.findUnique({ where: { slug: providerSlug } });
      let provider;
      if (existingProvider) {
        provider = await prisma.gameProvider.update({
          where: { slug: providerSlug },
          data: {
            name: sheetName.replace(/-[下暂].*$/, ''),
            isActive: !isOffline,
            supportedCurrencies: [...currencies],
            config: {
              ...(existingProvider.config || {}),
              supportedLanguages: [...languages],
              excelSheetName: sheetName,
            },
          },
        });
      } else {
        provider = await prisma.gameProvider.create({
          data: {
            name: sheetName.replace(/-[下暂].*$/, ''),
            slug: providerSlug,
            aggregatorId: aggregator.id,
            isActive: !isOffline,
            supportedCurrencies: [...currencies],
            config: {
              supportedLanguages: [...languages],
              excelSheetName: sheetName,
            },
          },
        });
      }

      // Process games
      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const g of gameRows) {
        // Resolve category
        const typeKey = g.type || 'Other';
        if (!categoryCache[typeKey]) {
          categoryCache[typeKey] = await getOrCreateCategory(typeKey);
          if (!categoriesCreated.includes(categoryCache[typeKey].slug)) {
            categoriesCreated.push(categoryCache[typeKey].slug);
          }
        }
        const category = categoryCache[typeKey];

        // Skip lobby entries
        if (category.slug === 'lobby') {
          skipped++;
          continue;
        }

        const gameSlug = `${providerSlug}-${g.uid.slice(0, 8)}`.toLowerCase();

        // RTP: convert from decimal (0.9692) to percentage (96.92) if needed
        let rtp = g.rtp;
        if (rtp !== null && rtp > 0 && rtp < 1) {
          rtp = Math.round(rtp * 10000) / 100; // 0.9692 -> 96.92
        }

        const existing = await prisma.game.findFirst({
          where: { externalGameId: g.uid, providerId: provider.id },
        });

        if (existing) {
          await prisma.game.update({
            where: { id: existing.id },
            data: {
              name: g.name,
              categoryId: category.id,
              isActive: !isOffline,
              ...(rtp !== null ? { rtp } : {}),
              ...(g.code ? { tags: { ...(existing.tags || {}), code: g.code } } : {}),
            },
          });
          updated++;
        } else {
          try {
            await prisma.game.create({
              data: {
                name: g.name,
                slug: gameSlug,
                externalGameId: g.uid,
                providerId: provider.id,
                categoryId: category.id,
                isActive: !isOffline,
                isNew: true,
                ...(rtp !== null ? { rtp } : {}),
                ...(g.code ? { tags: { code: g.code } } : {}),
              },
            });
            created++;
          } catch (err) {
            // Handle slug collision (rare: two different UIDs with same first 8 chars)
            if (err.code === 'P2002') {
              const fallbackSlug = `${providerSlug}-${g.uid.slice(0, 12)}`.toLowerCase();
              await prisma.game.create({
                data: {
                  name: g.name,
                  slug: fallbackSlug,
                  externalGameId: g.uid,
                  providerId: provider.id,
                  categoryId: category.id,
                  isActive: !isOffline,
                  isNew: true,
                  ...(rtp !== null ? { rtp } : {}),
                  ...(g.code ? { tags: { code: g.code } } : {}),
                },
              });
              created++;
            } else {
              throw err;
            }
          }
        }
      }

      totalCreated += created;
      totalUpdated += updated;
      totalSkipped += skipped;

      providerResults.push({
        provider: sheetName,
        slug: providerSlug,
        games: gameRows.length,
        created,
        updated,
        skipped,
        currencies: currencies.size,
        languages: languages.size,
        isActive: !isOffline,
      });

      if (providerResults.length % 20 === 0) {
        console.log(`[Huidu Excel Import] Processed ${providerResults.length}/${sheetNames.length} providers...`);
      }
    }

    // Invalidate caches
    await invalidateProviderCache();
    await invalidateGameCache();

    const totalGames = providerResults.reduce((sum, r) => sum + r.games, 0);

    console.log(`[Huidu Excel Import] Complete: ${totalGames} games, ${providerResults.length} providers, ${totalCreated} created, ${totalUpdated} updated`);

    res.json({
      message: `Import complete: ${totalGames} games across ${providerResults.length} providers`,
      totalGames,
      totalProviders: providerResults.length,
      totalCreated,
      totalUpdated,
      totalSkipped,
      categoriesCreated,
      skippedSheets,
      providerResults,
    });
  } catch (error) {
    console.error('Excel import error:', error);
    res.status(500).json({ error: `Failed to import Excel: ${error.message}` });
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

module.exports = { syncProviders, syncGames, syncAllGames, importExcelGames, getStatus };
