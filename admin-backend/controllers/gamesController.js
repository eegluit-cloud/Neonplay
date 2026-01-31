const { getDb } = require('../database/init');

// Categories
const getCategories = async (req, res) => {
  try {
    const db = getDb();

    const categories = db.prepare(`
      SELECT c.*, COUNT(gc.game_id) as game_count
      FROM categories c
      LEFT JOIN game_categories gc ON c.id = gc.category_id
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();

    res.json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        type: c.type,
        description: c.description,
        icon: c.icon,
        sortOrder: c.sort_order,
        status: c.status,
        gameCount: c.game_count,
        createdAt: c.created_at
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
    const db = getDb();

    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existing) {
      return res.status(400).json({ error: 'Category slug already exists' });
    }

    const result = db.prepare(`
      INSERT INTO categories (name, slug, type, description, icon, sort_order)
      VALUES (?, ?, 'custom', ?, ?, ?)
    `).run(name, slug, description, icon, sortOrder || 0);

    res.status(201).json({
      message: 'Category created',
      category: { id: result.lastInsertRowid, name, slug }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, sortOrder, status } = req.body;
    const db = getDb();

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.prepare(`
      UPDATE categories
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          icon = COALESCE(?, icon),
          sort_order = COALESCE(?, sort_order),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, icon, sortOrder, status, categoryId);

    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const db = getDb();

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.type === 'system') {
      return res.status(400).json({ error: 'Cannot delete system categories' });
    }

    db.prepare('DELETE FROM game_categories WHERE category_id = ?').run(categoryId);
    db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { order } = req.body; // Array of { id, sortOrder }
    const db = getDb();

    const updateStmt = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
    const updateMany = db.transaction((items) => {
      for (const item of items) {
        updateStmt.run(item.sortOrder, item.id);
      }
    });

    updateMany(order);

    res.json({ message: 'Categories reordered' });
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
};

// Aggregators
const getAggregators = async (req, res) => {
  try {
    const db = getDb();

    const aggregators = db.prepare(`
      SELECT a.*, COUNT(DISTINCT p.id) as provider_count, COUNT(DISTINCT g.id) as game_count
      FROM aggregators a
      LEFT JOIN providers p ON a.id = p.aggregator_id
      LEFT JOIN games g ON p.id = g.provider_id
      GROUP BY a.id
      ORDER BY a.name ASC
    `).all();

    res.json({
      aggregators: aggregators.map(a => ({
        id: a.id,
        name: a.name,
        apiUrl: a.api_url,
        status: a.status,
        providerCount: a.provider_count,
        gameCount: a.game_count,
        createdAt: a.created_at
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
    const db = getDb();

    const aggregator = db.prepare('SELECT id FROM aggregators WHERE id = ?').get(aggregatorId);
    if (!aggregator) {
      return res.status(404).json({ error: 'Aggregator not found' });
    }

    db.prepare(`
      UPDATE aggregators
      SET name = COALESCE(?, name),
          api_url = COALESCE(?, api_url),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, apiUrl, status, aggregatorId);

    res.json({ message: 'Aggregator updated' });
  } catch (error) {
    console.error('Update aggregator error:', error);
    res.status(500).json({ error: 'Failed to update aggregator' });
  }
};

// Providers
const getProviders = async (req, res) => {
  try {
    const db = getDb();
    const { aggregatorId } = req.query;

    let query = `
      SELECT p.*, a.name as aggregator_name, COUNT(g.id) as game_count
      FROM providers p
      JOIN aggregators a ON p.aggregator_id = a.id
      LEFT JOIN games g ON p.id = g.provider_id
    `;
    const params = [];

    if (aggregatorId) {
      query += ' WHERE p.aggregator_id = ?';
      params.push(aggregatorId);
    }

    query += ' GROUP BY p.id ORDER BY a.name, p.name';

    const providers = db.prepare(query).all(...params);

    res.json({
      providers: providers.map(p => ({
        id: p.id,
        name: p.name,
        aggregatorId: p.aggregator_id,
        aggregatorName: p.aggregator_name,
        commissionRate: p.commission_rate,
        status: p.status,
        gameCount: p.game_count,
        createdAt: p.created_at
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
    const { name, commissionRate, status } = req.body;
    const db = getDb();

    const provider = db.prepare('SELECT id FROM providers WHERE id = ?').get(providerId);
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    db.prepare(`
      UPDATE providers
      SET name = COALESCE(?, name),
          commission_rate = COALESCE(?, commission_rate),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, commissionRate, status, providerId);

    res.json({ message: 'Provider updated' });
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ error: 'Failed to update provider' });
  }
};

// Games
const getGames = async (req, res) => {
  try {
    const db = getDb();
    const { search, providerId, categoryId, status, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT DISTINCT g.*, p.name as provider_name, a.name as aggregator_name
      FROM games g
      JOIN providers p ON g.provider_id = p.id
      JOIN aggregators a ON p.aggregator_id = a.id
    `;
    const params = [];

    if (categoryId) {
      query += ' JOIN game_categories gc ON g.id = gc.game_id AND gc.category_id = ?';
      params.push(categoryId);
    }

    query += ' WHERE 1=1';

    if (search) {
      query += ' AND (g.name LIKE ? OR p.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (providerId) {
      query += ' AND g.provider_id = ?';
      params.push(providerId);
    }

    if (status) {
      query += ' AND g.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT DISTINCT g\.\*, p\.name.*/, 'SELECT COUNT(DISTINCT g.id) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY g.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const games = db.prepare(query).all(...params);

    // Get categories for each game
    const getGameCategories = db.prepare(`
      SELECT c.id, c.name FROM categories c
      JOIN game_categories gc ON c.id = gc.category_id
      WHERE gc.game_id = ?
    `);

    const gamesWithCategories = games.map(g => {
      const categories = getGameCategories.all(g.id);
      return {
        id: g.id,
        name: g.name,
        slug: g.slug,
        providerId: g.provider_id,
        providerName: g.provider_name,
        aggregatorName: g.aggregator_name,
        thumbnail: g.thumbnail,
        rtp: g.rtp,
        volatility: g.volatility,
        minBet: g.min_bet,
        maxBet: g.max_bet,
        status: g.status,
        categories,
        createdAt: g.created_at
      };
    });

    res.json({
      games: gamesWithCategories,
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
    const db = getDb();

    const game = db.prepare(`
      SELECT g.*, p.name as provider_name, a.name as aggregator_name
      FROM games g
      JOIN providers p ON g.provider_id = p.id
      JOIN aggregators a ON p.aggregator_id = a.id
      WHERE g.id = ?
    `).get(gameId);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const categories = db.prepare(`
      SELECT c.id, c.name FROM categories c
      JOIN game_categories gc ON c.id = gc.category_id
      WHERE gc.game_id = ?
    `).all(gameId);

    res.json({
      game: {
        id: game.id,
        name: game.name,
        slug: game.slug,
        providerId: game.provider_id,
        providerName: game.provider_name,
        aggregatorName: game.aggregator_name,
        thumbnail: game.thumbnail,
        description: game.description,
        gameUrl: game.game_url,
        rtp: game.rtp,
        volatility: game.volatility,
        minBet: game.min_bet,
        maxBet: game.max_bet,
        status: game.status,
        categories,
        createdAt: game.created_at
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
    const { name, description, thumbnail, rtp, volatility, minBet, maxBet, status, categoryIds } = req.body;
    const db = getDb();

    const game = db.prepare('SELECT id FROM games WHERE id = ?').get(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    db.prepare(`
      UPDATE games
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          thumbnail = COALESCE(?, thumbnail),
          rtp = COALESCE(?, rtp),
          volatility = COALESCE(?, volatility),
          min_bet = COALESCE(?, min_bet),
          max_bet = COALESCE(?, max_bet),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, description, thumbnail, rtp, volatility, minBet, maxBet, status, gameId);

    // Update categories if provided
    if (categoryIds && Array.isArray(categoryIds)) {
      db.prepare('DELETE FROM game_categories WHERE game_id = ?').run(gameId);
      const insertCategory = db.prepare('INSERT INTO game_categories (game_id, category_id) VALUES (?, ?)');
      categoryIds.forEach(catId => {
        insertCategory.run(gameId, catId);
      });
    }

    res.json({ message: 'Game updated' });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
};

const bulkUpdateGames = async (req, res) => {
  try {
    const { gameIds, status, categoryId, action } = req.body;
    const db = getDb();

    if (status) {
      const updateStmt = db.prepare('UPDATE games SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      gameIds.forEach(id => updateStmt.run(status, id));
    }

    if (categoryId && action) {
      if (action === 'add') {
        const insertStmt = db.prepare('INSERT OR IGNORE INTO game_categories (game_id, category_id) VALUES (?, ?)');
        gameIds.forEach(id => insertStmt.run(id, categoryId));
      } else if (action === 'remove') {
        const deleteStmt = db.prepare('DELETE FROM game_categories WHERE game_id = ? AND category_id = ?');
        gameIds.forEach(id => deleteStmt.run(id, categoryId));
      }
    }

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
