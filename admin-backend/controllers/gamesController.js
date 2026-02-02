const prisma = require('../lib/prisma');
const { invalidateCategoryCache, invalidateProviderCache, invalidateGameCache } = require('../lib/redis');

// Categories
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.gameCategory.findMany({
      include: {
        _count: {
          select: { games: true }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        icon: c.icon,
        sortOrder: c.sortOrder,
        status: c.isActive ? 'active' : 'inactive',
        gameCount: c._count.games,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to load categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, sortOrder } = req.body;

    const category = await prisma.gameCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        sortOrder: sortOrder || 0,
        isActive: true
      }
    });

    // Invalidate category cache in player-backend
    await invalidateCategoryCache();

    res.status(201).json({
      message: 'Category created',
      category: { id: category.id, name: category.name, slug: category.slug }
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, sortOrder, status } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (icon !== undefined) data.icon = icon;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (status !== undefined) data.isActive = status === 'active';

    await prisma.gameCategory.update({
      where: { id: categoryId },
      data
    });

    // Invalidate category cache in player-backend
    await invalidateCategoryCache();

    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    await prisma.gameCategory.delete({
      where: { id: categoryId }
    });

    // Invalidate category cache in player-backend
    await invalidateCategoryCache();

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { order } = req.body;

    await prisma.$transaction(
      order.map(item =>
        prisma.gameCategory.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    );

    res.json({ message: 'Categories reordered' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
};

// Aggregators
const getAggregators = async (req, res) => {
  try {
    const aggregators = await prisma.gameAggregator.findMany({
      include: {
        providers: {
          include: {
            _count: {
              select: { games: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      aggregators: aggregators.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        apiUrl: a.apiEndpoint,
        status: a.isActive ? 'active' : 'inactive',
        providerCount: a.providers.length,
        gameCount: a.providers.reduce((sum, p) => sum + p._count.games, 0),
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    console.error('Get aggregators error:', error);
    res.status(500).json({ error: 'Failed to load aggregators' });
  }
};

const updateAggregator = async (req, res) => {
  try {
    const { aggregatorId } = req.params;
    const { name, apiUrl, status } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (apiUrl !== undefined) data.apiEndpoint = apiUrl;
    if (status !== undefined) data.isActive = status === 'active';

    await prisma.gameAggregator.update({
      where: { id: aggregatorId },
      data
    });

    res.json({ message: 'Aggregator updated' });
  } catch (error) {
    console.error('Update aggregator error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Aggregator not found' });
    }
    res.status(500).json({ error: 'Failed to update aggregator' });
  }
};

// Providers
const getProviders = async (req, res) => {
  try {
    const { aggregatorId } = req.query;

    const where = {};
    if (aggregatorId) where.aggregatorId = aggregatorId;

    const providers = await prisma.gameProvider.findMany({
      where,
      include: {
        aggregator: true,
        _count: {
          select: { games: true }
        }
      },
      orderBy: [
        { aggregator: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    res.json({
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        aggregatorId: p.aggregatorId,
        aggregatorName: p.aggregator?.name,
        logo: p.logoUrl,
        status: p.isActive ? 'active' : 'inactive',
        gameCount: p._count.games,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ error: 'Failed to load providers' });
  }
};

const updateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { name, status } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.isActive = status === 'active';

    await prisma.gameProvider.update({
      where: { id: providerId },
      data
    });

    // Invalidate provider cache in player-backend
    await invalidateProviderCache();

    res.json({ message: 'Provider updated' });
  } catch (error) {
    console.error('Update provider error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.status(500).json({ error: 'Failed to update provider' });
  }
};

// Games
const getGames = async (req, res) => {
  try {
    const { search, providerId, categoryId, status, page = 1, limit = 50 } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { provider: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (providerId) where.providerId = providerId;
    if (categoryId) where.categoryId = categoryId;

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'maintenance') {
      // Add maintenance flag if needed in schema
    }

    const total = await prisma.game.count({ where });

    const games = await prisma.game.findMany({
      where,
      include: {
        provider: {
          include: {
            aggregator: true
          }
        },
        category: true
      },
      orderBy: { name: 'asc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      games: games.map(g => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
        providerId: g.providerId,
        providerName: g.provider.name,
        aggregatorName: g.provider.aggregator?.name,
        thumbnail: g.thumbnailUrl,
        rtp: Number(g.rtp || 0),
        volatility: g.volatility,
        minBet: Number(g.minBet || 0),
        maxBet: Number(g.maxBet || 0),
        status: g.isActive ? 'active' : 'inactive',
        categories: g.category ? [{ id: g.category.id, name: g.category.name }] : [],
        createdAt: g.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Failed to load games' });
  }
};

const getGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        provider: {
          include: {
            aggregator: true
          }
        },
        category: true
      }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      game: {
        id: game.id,
        name: game.name,
        slug: game.slug,
        providerId: game.providerId,
        providerName: game.provider.name,
        aggregatorName: game.provider.aggregator?.name,
        thumbnail: game.thumbnailUrl,
        description: game.description,
        rtp: Number(game.rtp || 0),
        volatility: game.volatility,
        minBet: Number(game.minBet || 0),
        maxBet: Number(game.maxBet || 0),
        status: game.isActive ? 'active' : 'inactive',
        isFeatured: game.isFeatured,
        isNew: game.isNew,
        isHot: game.isHot,
        categories: game.category ? [{ id: game.category.id, name: game.category.name }] : [],
        createdAt: game.createdAt
      }
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to load game' });
  }
};

const updateGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { name, description, thumbnail, rtp, volatility, minBet, maxBet, status, categoryId, isFeatured, isNew, isHot } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (thumbnail !== undefined) data.thumbnailUrl = thumbnail;
    if (rtp !== undefined) data.rtp = parseFloat(rtp);
    if (volatility !== undefined) data.volatility = volatility;
    if (minBet !== undefined) data.minBet = parseFloat(minBet);
    if (maxBet !== undefined) data.maxBet = parseFloat(maxBet);
    if (status !== undefined) data.isActive = status === 'active';
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isNew !== undefined) data.isNew = isNew;
    if (isHot !== undefined) data.isHot = isHot;

    const game = await prisma.game.update({
      where: { id: gameId },
      data
    });

    // Invalidate game cache in player-backend
    await invalidateGameCache(game.id, game.slug);

    res.json({ message: 'Game updated' });
  } catch (error) {
    console.error('Update game error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.status(500).json({ error: 'Failed to update game' });
  }
};

const bulkUpdateGames = async (req, res) => {
  try {
    const { gameIds, status, categoryId, isFeatured, isNew, isHot } = req.body;

    const data = {};
    if (status !== undefined) data.isActive = status === 'active';
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isNew !== undefined) data.isNew = isNew;
    if (isHot !== undefined) data.isHot = isHot;

    await prisma.game.updateMany({
      where: {
        id: { in: gameIds }
      },
      data
    });

    // Invalidate game cache in player-backend (bulk update affects featured/hot/new lists)
    await invalidateGameCache();

    res.json({ message: `${gameIds.length} games updated` });
  } catch (error) {
    console.error('Bulk update games error:', error);
    res.status(500).json({ error: 'Failed to update games' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getAggregators,
  updateAggregator,
  getProviders,
  updateProvider,
  getGames,
  getGame,
  updateGame,
  bulkUpdateGames
};
