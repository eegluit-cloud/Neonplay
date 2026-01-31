const { getDb } = require('../database/init');

const getBonuses = async (req, res) => {
  try {
    const db = getDb();
    const { type, status, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM bonuses WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const bonuses = db.prepare(query).all(...params);

    res.json({
      bonuses: bonuses.map(b => ({
        id: b.id,
        name: b.name,
        code: b.code,
        type: b.type,
        amount: b.amount,
        percentage: b.percentage,
        wageringReq: b.wagering_req,
        minDeposit: b.min_deposit,
        maxCap: b.max_cap,
        startDate: b.start_date,
        endDate: b.end_date,
        eligibleGames: b.eligible_games ? JSON.parse(b.eligible_games) : null,
        playerSegments: b.player_segments ? JSON.parse(b.player_segments) : null,
        maxClaims: b.max_claims,
        currentClaims: b.current_claims,
        description: b.description,
        terms: b.terms,
        status: b.status,
        createdAt: b.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get bonuses error:', error);
    res.status(500).json({ error: 'Failed to load bonuses' });
  }
};

const getBonus = async (req, res) => {
  try {
    const { bonusId } = req.params;
    const db = getDb();

    const bonus = db.prepare('SELECT * FROM bonuses WHERE id = ?').get(bonusId);
    if (!bonus) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    // Get claim stats
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_claims,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_claims,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_claims,
        SUM(amount) as total_amount_given,
        SUM(wagered) as total_wagered
      FROM player_bonuses
      WHERE bonus_id = ?
    `).get(bonusId);

    res.json({
      bonus: {
        id: bonus.id,
        name: bonus.name,
        code: bonus.code,
        type: bonus.type,
        amount: bonus.amount,
        percentage: bonus.percentage,
        wageringReq: bonus.wagering_req,
        minDeposit: bonus.min_deposit,
        maxCap: bonus.max_cap,
        startDate: bonus.start_date,
        endDate: bonus.end_date,
        eligibleGames: bonus.eligible_games ? JSON.parse(bonus.eligible_games) : null,
        playerSegments: bonus.player_segments ? JSON.parse(bonus.player_segments) : null,
        maxClaims: bonus.max_claims,
        currentClaims: bonus.current_claims,
        description: bonus.description,
        terms: bonus.terms,
        status: bonus.status,
        createdAt: bonus.created_at
      },
      stats: {
        totalClaims: stats.total_claims || 0,
        activeClaims: stats.active_claims || 0,
        completedClaims: stats.completed_claims || 0,
        totalAmountGiven: stats.total_amount_given || 0,
        totalWagered: stats.total_wagered || 0
      }
    });
  } catch (error) {
    console.error('Get bonus error:', error);
    res.status(500).json({ error: 'Failed to load bonus' });
  }
};

const createBonus = async (req, res) => {
  try {
    const {
      name, code, type, amount, percentage, wageringReq, minDeposit, maxCap,
      startDate, endDate, eligibleGames, playerSegments, maxClaims, description, terms
    } = req.body;
    const db = getDb();

    // Check for duplicate code
    if (code) {
      const existing = db.prepare('SELECT id FROM bonuses WHERE code = ?').get(code.toUpperCase());
      if (existing) {
        return res.status(400).json({ error: 'Bonus code already exists' });
      }
    }

    const result = db.prepare(`
      INSERT INTO bonuses (
        name, code, type, amount, percentage, wagering_req, min_deposit, max_cap,
        start_date, end_date, eligible_games, player_segments, max_claims, description, terms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      code ? code.toUpperCase() : null,
      type,
      amount || 0,
      percentage || 0,
      wageringReq || 1,
      minDeposit || 0,
      maxCap,
      startDate,
      endDate,
      eligibleGames ? JSON.stringify(eligibleGames) : null,
      playerSegments ? JSON.stringify(playerSegments) : null,
      maxClaims,
      description,
      terms
    );

    res.status(201).json({
      message: 'Bonus created',
      bonusId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create bonus error:', error);
    res.status(500).json({ error: 'Failed to create bonus' });
  }
};

const updateBonus = async (req, res) => {
  try {
    const { bonusId } = req.params;
    const {
      name, code, amount, percentage, wageringReq, minDeposit, maxCap,
      startDate, endDate, eligibleGames, playerSegments, maxClaims, description, terms, status
    } = req.body;
    const db = getDb();

    const bonus = db.prepare('SELECT id FROM bonuses WHERE id = ?').get(bonusId);
    if (!bonus) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    // Check for duplicate code if changing
    if (code) {
      const existing = db.prepare('SELECT id FROM bonuses WHERE code = ? AND id != ?').get(code.toUpperCase(), bonusId);
      if (existing) {
        return res.status(400).json({ error: 'Bonus code already exists' });
      }
    }

    db.prepare(`
      UPDATE bonuses
      SET name = COALESCE(?, name),
          code = COALESCE(?, code),
          amount = COALESCE(?, amount),
          percentage = COALESCE(?, percentage),
          wagering_req = COALESCE(?, wagering_req),
          min_deposit = COALESCE(?, min_deposit),
          max_cap = ?,
          start_date = ?,
          end_date = ?,
          eligible_games = ?,
          player_segments = ?,
          max_claims = ?,
          description = COALESCE(?, description),
          terms = COALESCE(?, terms),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name,
      code ? code.toUpperCase() : null,
      amount,
      percentage,
      wageringReq,
      minDeposit,
      maxCap,
      startDate,
      endDate,
      eligibleGames ? JSON.stringify(eligibleGames) : null,
      playerSegments ? JSON.stringify(playerSegments) : null,
      maxClaims,
      description,
      terms,
      status,
      bonusId
    );

    res.json({ message: 'Bonus updated' });
  } catch (error) {
    console.error('Update bonus error:', error);
    res.status(500).json({ error: 'Failed to update bonus' });
  }
};

const deleteBonus = async (req, res) => {
  try {
    const { bonusId } = req.params;
    const db = getDb();

    const bonus = db.prepare('SELECT id FROM bonuses WHERE id = ?').get(bonusId);
    if (!bonus) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    // Check for active claims
    const activeClaims = db.prepare(`
      SELECT COUNT(*) as count FROM player_bonuses WHERE bonus_id = ? AND status = 'active'
    `).get(bonusId);

    if (activeClaims.count > 0) {
      return res.status(400).json({ error: 'Cannot delete bonus with active claims' });
    }

    db.prepare('DELETE FROM player_bonuses WHERE bonus_id = ?').run(bonusId);
    db.prepare('DELETE FROM bonuses WHERE id = ?').run(bonusId);

    res.json({ message: 'Bonus deleted' });
  } catch (error) {
    console.error('Delete bonus error:', error);
    res.status(500).json({ error: 'Failed to delete bonus' });
  }
};

const getPlayerBonuses = async (req, res) => {
  try {
    const db = getDb();
    const { playerId, status, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT pb.*, b.name, b.type, b.wagering_req, p.email as player_email
      FROM player_bonuses pb
      JOIN bonuses b ON pb.bonus_id = b.id
      JOIN players p ON pb.player_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (playerId) {
      query += ' AND pb.player_id = ?';
      params.push(playerId);
    }

    if (status) {
      query += ' AND pb.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT pb\.\*, b\.name.*/, 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY pb.claimed_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const bonuses = db.prepare(query).all(...params);

    res.json({
      playerBonuses: bonuses.map(pb => ({
        id: pb.id,
        playerId: pb.player_id,
        playerEmail: pb.player_email,
        bonusId: pb.bonus_id,
        bonusName: pb.name,
        bonusType: pb.type,
        amount: pb.amount,
        wagered: pb.wagered,
        wageringTarget: pb.wagering_target,
        wageringReq: pb.wagering_req,
        progress: pb.wagering_target > 0 ? ((pb.wagered / pb.wagering_target) * 100).toFixed(2) : 100,
        status: pb.status,
        claimedAt: pb.claimed_at,
        completedAt: pb.completed_at,
        expiresAt: pb.expires_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get player bonuses error:', error);
    res.status(500).json({ error: 'Failed to load player bonuses' });
  }
};

const awardBonus = async (req, res) => {
  try {
    const { playerId, bonusId, amount, wageringTarget } = req.body;
    const db = getDb();

    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    let bonus;
    if (bonusId) {
      bonus = db.prepare('SELECT * FROM bonuses WHERE id = ?').get(bonusId);
      if (!bonus) {
        return res.status(404).json({ error: 'Bonus not found' });
      }
    }

    const bonusAmount = amount || (bonus ? bonus.amount : 0);
    const target = wageringTarget || (bonus ? bonusAmount * bonus.wagering_req : bonusAmount);

    const result = db.prepare(`
      INSERT INTO player_bonuses (player_id, bonus_id, amount, wagering_target, expires_at)
      VALUES (?, ?, ?, ?, datetime('now', '+30 days'))
    `).run(playerId, bonusId, bonusAmount, target);

    db.prepare('UPDATE players SET bonus_balance = bonus_balance + ? WHERE id = ?')
      .run(bonusAmount, playerId);

    // Add note
    db.prepare('INSERT INTO player_notes (player_id, admin_id, note) VALUES (?, ?, ?)')
      .run(playerId, req.admin.id, `Manual bonus awarded: $${bonusAmount} (wagering: ${target})`);

    res.status(201).json({
      message: 'Bonus awarded',
      playerBonusId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Award bonus error:', error);
    res.status(500).json({ error: 'Failed to award bonus' });
  }
};

const cancelPlayerBonus = async (req, res) => {
  try {
    const { playerBonusId } = req.params;
    const { reason } = req.body;
    const db = getDb();

    const playerBonus = db.prepare(`
      SELECT * FROM player_bonuses WHERE id = ? AND status = 'active'
    `).get(playerBonusId);

    if (!playerBonus) {
      return res.status(404).json({ error: 'Active bonus not found' });
    }

    db.prepare(`UPDATE player_bonuses SET status = 'forfeited' WHERE id = ?`)
      .run(playerBonusId);

    // Deduct remaining bonus
    const remaining = playerBonus.amount - (playerBonus.wagered / playerBonus.wagering_target * playerBonus.amount);
    if (remaining > 0) {
      db.prepare('UPDATE players SET bonus_balance = MAX(0, bonus_balance - ?) WHERE id = ?')
        .run(remaining, playerBonus.player_id);
    }

    // Add note
    db.prepare('INSERT INTO player_notes (player_id, admin_id, note) VALUES (?, ?, ?)')
      .run(playerBonus.player_id, req.admin.id, `Bonus cancelled. Reason: ${reason}`);

    res.json({ message: 'Bonus cancelled' });
  } catch (error) {
    console.error('Cancel bonus error:', error);
    res.status(500).json({ error: 'Failed to cancel bonus' });
  }
};

const getBonusStats = async (req, res) => {
  try {
    const db = getDb();

    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM bonuses WHERE status = 'active') as active_bonuses,
        (SELECT COUNT(*) FROM player_bonuses WHERE status = 'active') as active_player_bonuses,
        (SELECT SUM(amount) FROM player_bonuses) as total_bonus_given,
        (SELECT SUM(amount) FROM player_bonuses WHERE status = 'completed') as total_bonus_completed,
        (SELECT SUM(wagered) FROM player_bonuses) as total_wagered_on_bonuses,
        (SELECT AVG(wagered / wagering_target * 100) FROM player_bonuses WHERE wagering_target > 0) as avg_completion_rate
    `).get();

    res.json({ stats });
  } catch (error) {
    console.error('Get bonus stats error:', error);
    res.status(500).json({ error: 'Failed to load bonus stats' });
  }
};

module.exports = {
  getBonuses,
  getBonus,
  createBonus,
  updateBonus,
  deleteBonus,
  getPlayerBonuses,
  awardBonus,
  cancelPlayerBonus,
  getBonusStats
};
