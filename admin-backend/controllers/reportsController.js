const { getDb } = require('../database/init');
const { Parser } = require('json2csv');

// Transaction Reports
const getTransactionReport = async (req, res) => {
  try {
    const db = getDb();
    const { startDate, endDate, type, status, groupBy = 'day' } = req.query;

    let dateFormat;
    switch (groupBy) {
      case 'hour': dateFormat = '%Y-%m-%d %H:00'; break;
      case 'day': dateFormat = '%Y-%m-%d'; break;
      case 'week': dateFormat = '%Y-W%W'; break;
      case 'month': dateFormat = '%Y-%m'; break;
      default: dateFormat = '%Y-%m-%d';
    }

    let query = `
      SELECT
        strftime('${dateFormat}', created_at) as period,
        type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'completed' OR status = 'approved' THEN amount ELSE 0 END) as completed_amount,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
      FROM transactions
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' GROUP BY period, type ORDER BY period DESC, type';

    const data = db.prepare(query).all(...params);

    // Summary
    const summary = db.prepare(`
      SELECT
        type,
        COUNT(*) as count,
        SUM(amount) as total,
        SUM(CASE WHEN status = 'completed' OR status = 'approved' THEN amount ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' OR status = 'cancelled' THEN amount ELSE 0 END) as failed
      FROM transactions
      WHERE 1=1
      ${startDate ? 'AND created_at >= ?' : ''}
      ${endDate ? 'AND created_at <= ?' : ''}
      GROUP BY type
    `).all(...(startDate && endDate ? [startDate, endDate] : startDate ? [startDate] : endDate ? [endDate] : []));

    res.json({ data, summary });
  } catch (error) {
    console.error('Transaction report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Banking Reports
const getBankingReport = async (req, res) => {
  try {
    const db = getDb();
    const { startDate, endDate } = req.query;

    let whereClause = 'WHERE type IN (\'deposit\', \'withdrawal\')';
    const params = [];

    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate);
    }

    // By payment method
    const byPaymentMethod = db.prepare(`
      SELECT
        payment_method,
        type,
        COUNT(*) as count,
        SUM(amount) as total,
        SUM(CASE WHEN status = 'completed' OR status = 'approved' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' OR status = 'rejected' THEN 1 ELSE 0 END) as failed
      FROM transactions
      ${whereClause}
      GROUP BY payment_method, type
      ORDER BY payment_method, type
    `).all(...params);

    // Success rate
    const successRate = db.prepare(`
      SELECT
        type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' OR status = 'approved' THEN 1 ELSE 0 END) as successful,
        ROUND(SUM(CASE WHEN status = 'completed' OR status = 'approved' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as rate
      FROM transactions
      ${whereClause}
      GROUP BY type
    `).all(...params);

    // Pending withdrawals
    const pendingWithdrawals = db.prepare(`
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM transactions
      WHERE type = 'withdrawal' AND status = 'pending'
    `).get();

    res.json({
      byPaymentMethod,
      successRate,
      pendingWithdrawals
    });
  } catch (error) {
    console.error('Banking report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Bonus Reports
const getBonusReport = async (req, res) => {
  try {
    const db = getDb();
    const { startDate, endDate } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (startDate) {
      whereClause += ' AND pb.claimed_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND pb.claimed_at <= ?';
      params.push(endDate);
    }

    // By bonus type
    const byType = db.prepare(`
      SELECT
        b.type,
        COUNT(pb.id) as claims,
        SUM(pb.amount) as total_given,
        SUM(pb.wagered) as total_wagered,
        SUM(CASE WHEN pb.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN pb.status = 'forfeited' THEN 1 ELSE 0 END) as forfeited
      FROM player_bonuses pb
      JOIN bonuses b ON pb.bonus_id = b.id
      ${whereClause}
      GROUP BY b.type
    `).all(...params);

    // By individual bonus
    const byBonus = db.prepare(`
      SELECT
        b.name,
        b.type,
        COUNT(pb.id) as claims,
        SUM(pb.amount) as total_given,
        AVG(pb.wagered / pb.wagering_target * 100) as avg_completion
      FROM player_bonuses pb
      JOIN bonuses b ON pb.bonus_id = b.id
      ${whereClause}
      GROUP BY b.id
      ORDER BY claims DESC
    `).all(...params);

    // Cost summary
    const costSummary = db.prepare(`
      SELECT
        SUM(pb.amount) as total_bonus_cost,
        SUM(pb.wagered) as total_wagered,
        SUM(CASE WHEN pb.status = 'completed' THEN pb.amount ELSE 0 END) as completed_bonus_cost
      FROM player_bonuses pb
      ${whereClause.replace('WHERE 1=1', 'WHERE 1=1')}
    `).get(...params);

    res.json({
      byType,
      byBonus,
      costSummary
    });
  } catch (error) {
    console.error('Bonus report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Player Reports
const getPlayerReport = async (req, res) => {
  try {
    const db = getDb();
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let dateFormat;
    switch (groupBy) {
      case 'day': dateFormat = '%Y-%m-%d'; break;
      case 'week': dateFormat = '%Y-W%W'; break;
      case 'month': dateFormat = '%Y-%m'; break;
      default: dateFormat = '%Y-%m-%d';
    }

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate);
    }

    // New registrations over time
    const registrations = db.prepare(`
      SELECT
        strftime('${dateFormat}', created_at) as period,
        COUNT(*) as new_players
      FROM players
      ${whereClause}
      GROUP BY period
      ORDER BY period DESC
    `).all(...params);

    // Player status breakdown
    const statusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM players
      GROUP BY status
    `).all();

    // KYC status breakdown
    const kycBreakdown = db.prepare(`
      SELECT kyc_status, COUNT(*) as count
      FROM players
      GROUP BY kyc_status
    `).all();

    // Top players by lifetime value (deposits - withdrawals)
    const topPlayers = db.prepare(`
      SELECT
        p.id, p.email, p.first_name, p.last_name,
        COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'completed' THEN t.amount ELSE 0 END), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN t.type = 'withdrawal' AND t.status IN ('completed', 'approved') THEN t.amount ELSE 0 END), 0) as total_withdrawals,
        COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'completed' THEN t.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN t.type = 'withdrawal' AND t.status IN ('completed', 'approved') THEN t.amount ELSE 0 END), 0) as lifetime_value
      FROM players p
      LEFT JOIN transactions t ON p.id = t.player_id
      GROUP BY p.id
      ORDER BY lifetime_value DESC
      LIMIT 20
    `).all();

    // Active players (played in last 30 days)
    const activePlayersCount = db.prepare(`
      SELECT COUNT(DISTINCT player_id) as count
      FROM game_history
      WHERE created_at >= datetime('now', '-30 days')
    `).get();

    res.json({
      registrations,
      statusBreakdown,
      kycBreakdown,
      topPlayers: topPlayers.map(p => ({
        id: p.id,
        email: p.email,
        name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        totalDeposits: p.total_deposits,
        totalWithdrawals: p.total_withdrawals,
        lifetimeValue: p.lifetime_value
      })),
      activePlayersCount: activePlayersCount.count,
      totalPlayers: db.prepare('SELECT COUNT(*) as count FROM players').get().count
    });
  } catch (error) {
    console.error('Player report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Game Reports
const getGameReport = async (req, res) => {
  try {
    const db = getDb();
    const { startDate, endDate } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (startDate) {
      whereClause += ' AND gh.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND gh.created_at <= ?';
      params.push(endDate);
    }

    // Most played games
    const topGames = db.prepare(`
      SELECT
        g.id, g.name, p.name as provider_name,
        COUNT(gh.id) as plays,
        SUM(gh.bet_amount) as total_bets,
        SUM(gh.win_amount) as total_wins,
        SUM(gh.bet_amount) - SUM(gh.win_amount) as ggr,
        COUNT(DISTINCT gh.player_id) as unique_players
      FROM game_history gh
      JOIN games g ON gh.game_id = g.id
      JOIN providers p ON g.provider_id = p.id
      ${whereClause}
      GROUP BY g.id
      ORDER BY plays DESC
      LIMIT 20
    `).all(...params);

    // GGR by provider
    const ggrByProvider = db.prepare(`
      SELECT
        p.name as provider_name,
        a.name as aggregator_name,
        COUNT(gh.id) as plays,
        SUM(gh.bet_amount) as total_bets,
        SUM(gh.win_amount) as total_wins,
        SUM(gh.bet_amount) - SUM(gh.win_amount) as ggr
      FROM game_history gh
      JOIN games g ON gh.game_id = g.id
      JOIN providers p ON g.provider_id = p.id
      JOIN aggregators a ON p.aggregator_id = a.id
      ${whereClause}
      GROUP BY p.id
      ORDER BY ggr DESC
    `).all(...params);

    // Overall GGR
    const overallGgr = db.prepare(`
      SELECT
        SUM(bet_amount) as total_bets,
        SUM(win_amount) as total_wins,
        SUM(bet_amount) - SUM(win_amount) as ggr,
        COUNT(*) as total_rounds,
        COUNT(DISTINCT player_id) as unique_players
      FROM game_history gh
      ${whereClause.replace('gh.', '')}
    `).get(...params);

    res.json({
      topGames: topGames.map(g => ({
        id: g.id,
        name: g.name,
        providerName: g.provider_name,
        plays: g.plays,
        totalBets: g.total_bets,
        totalWins: g.total_wins,
        ggr: g.ggr,
        uniquePlayers: g.unique_players
      })),
      ggrByProvider,
      overallGgr
    });
  } catch (error) {
    console.error('Game report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Dashboard Summary
const getDashboardSummary = async (req, res) => {
  try {
    const db = getDb();

    const today = new Date().toISOString().split('T')[0];

    const summary = {
      // Today's stats
      todayDeposits: db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE type = 'deposit' AND status = 'completed' AND date(created_at) = date('now')
      `).get(),

      todayWithdrawals: db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE type = 'withdrawal' AND status IN ('completed', 'approved') AND date(created_at) = date('now')
      `).get(),

      todayNewPlayers: db.prepare(`
        SELECT COUNT(*) as count FROM players WHERE date(created_at) = date('now')
      `).get(),

      todayGgr: db.prepare(`
        SELECT COALESCE(SUM(bet_amount) - SUM(win_amount), 0) as ggr
        FROM game_history WHERE date(created_at) = date('now')
      `).get(),

      // Pending items
      pendingWithdrawals: db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM transactions WHERE type = 'withdrawal' AND status = 'pending'
      `).get(),

      pendingKyc: db.prepare(`
        SELECT COUNT(*) as count FROM kyc_documents WHERE status = 'pending'
      `).get(),

      // Overall stats
      totalPlayers: db.prepare('SELECT COUNT(*) as count FROM players').get(),
      totalBalance: db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM players').get(),
      totalBonusBalance: db.prepare('SELECT COALESCE(SUM(bonus_balance), 0) as total FROM players').get(),

      // Last 7 days trend
      last7DaysDeposits: db.prepare(`
        SELECT date(created_at) as date, COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE type = 'deposit' AND status = 'completed' AND created_at >= date('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY date
      `).all(),

      last7DaysGgr: db.prepare(`
        SELECT date(created_at) as date, COALESCE(SUM(bet_amount) - SUM(win_amount), 0) as ggr
        FROM game_history
        WHERE created_at >= date('now', '-7 days')
        GROUP BY date(created_at)
        ORDER BY date
      `).all()
    };

    res.json({ summary });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to load dashboard summary' });
  }
};

// Export to CSV
const exportToCsv = async (req, res) => {
  try {
    const { report, startDate, endDate } = req.query;
    const db = getDb();

    let data;
    let filename;

    switch (report) {
      case 'transactions':
        data = db.prepare(`
          SELECT t.id, t.type, t.amount, t.status, t.payment_method, t.reference, t.created_at,
                 p.email as player_email
          FROM transactions t
          JOIN players p ON t.player_id = p.id
          WHERE t.created_at BETWEEN ? AND ?
          ORDER BY t.created_at DESC
        `).all(startDate || '1970-01-01', endDate || '2099-12-31');
        filename = 'transactions';
        break;

      case 'players':
        data = db.prepare(`
          SELECT id, email, first_name, last_name, phone, balance, bonus_balance, status, kyc_status, created_at
          FROM players
          WHERE created_at BETWEEN ? AND ?
          ORDER BY created_at DESC
        `).all(startDate || '1970-01-01', endDate || '2099-12-31');
        filename = 'players';
        break;

      case 'game_history':
        data = db.prepare(`
          SELECT gh.id, p.email as player_email, g.name as game_name, gh.bet_amount, gh.win_amount, gh.created_at
          FROM game_history gh
          JOIN players p ON gh.player_id = p.id
          JOIN games g ON gh.game_id = g.id
          WHERE gh.created_at BETWEEN ? AND ?
          ORDER BY gh.created_at DESC
        `).all(startDate || '1970-01-01', endDate || '2099-12-31');
        filename = 'game_history';
        break;

      case 'bonuses':
        data = db.prepare(`
          SELECT pb.id, p.email as player_email, b.name as bonus_name, b.type, pb.amount, pb.wagered, pb.wagering_target, pb.status, pb.claimed_at
          FROM player_bonuses pb
          JOIN players p ON pb.player_id = p.id
          JOIN bonuses b ON pb.bonus_id = b.id
          WHERE pb.claimed_at BETWEEN ? AND ?
          ORDER BY pb.claimed_at DESC
        `).all(startDate || '1970-01-01', endDate || '2099-12-31');
        filename = 'bonuses';
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified period' });
    }

    const parser = new Parser();
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}_${startDate || 'all'}_${endDate || 'all'}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};

module.exports = {
  getTransactionReport,
  getBankingReport,
  getBonusReport,
  getPlayerReport,
  getGameReport,
  getDashboardSummary,
  exportToCsv
};
