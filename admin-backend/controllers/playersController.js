const { getDb } = require('../database/init');

const getPlayers = async (req, res) => {
  try {
    const db = getDb();
    const { search, status, kycStatus, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    let query = `
      SELECT p.id, p.email, p.first_name, p.last_name, p.phone, p.balance, p.bonus_balance,
             p.status, p.kyc_status, p.created_at
      FROM players p
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (p.email LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (kycStatus) {
      query += ' AND p.kyc_status = ?';
      params.push(kycStatus);
    }

    // Get total count
    const countQuery = query.replace(/SELECT p\.id.*FROM players p/, 'SELECT COUNT(*) as total FROM players p');
    const { total } = db.prepare(countQuery).get(...params);

    // Add sorting and pagination
    const validSortColumns = ['created_at', 'email', 'balance', 'status'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY p.${sortColumn} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const players = db.prepare(query).all(...params);

    // Get tags for each player
    const getPlayerTags = db.prepare(`
      SELECT pt.id, pt.name, pt.color
      FROM player_tags pt
      JOIN player_tag_assignments pta ON pt.id = pta.tag_id
      WHERE pta.player_id = ?
    `);

    const playersWithTags = players.map(p => {
      const tags = getPlayerTags.all(p.id);
      return {
        id: p.id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        phone: p.phone,
        balance: p.balance,
        bonusBalance: p.bonus_balance,
        status: p.status,
        kycStatus: p.kyc_status,
        createdAt: p.created_at,
        tags
      };
    });

    res.json({
      players: playersWithTags,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Failed to load players' });
  }
};

const getPlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const db = getDb();

    const player = db.prepare(`
      SELECT id, email, first_name, last_name, phone, dob, balance, bonus_balance,
             status, kyc_status, created_at, updated_at
      FROM players WHERE id = ?
    `).get(playerId);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Get tags
    const tags = db.prepare(`
      SELECT pt.id, pt.name, pt.color
      FROM player_tags pt
      JOIN player_tag_assignments pta ON pt.id = pta.tag_id
      WHERE pta.player_id = ?
    `).all(playerId);

    // Get recent transactions
    const transactions = db.prepare(`
      SELECT id, type, amount, status, payment_method, created_at
      FROM transactions WHERE player_id = ?
      ORDER BY created_at DESC LIMIT 10
    `).all(playerId);

    // Get active bonuses
    const bonuses = db.prepare(`
      SELECT pb.*, b.name, b.type as bonus_type
      FROM player_bonuses pb
      JOIN bonuses b ON pb.bonus_id = b.id
      WHERE pb.player_id = ? AND pb.status = 'active'
    `).all(playerId);

    // Get stats
    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM transactions WHERE player_id = ? AND type = 'deposit' AND status = 'completed') as total_deposits,
        (SELECT SUM(amount) FROM transactions WHERE player_id = ? AND type = 'deposit' AND status = 'completed') as deposit_total,
        (SELECT COUNT(*) FROM transactions WHERE player_id = ? AND type = 'withdrawal' AND status IN ('completed', 'approved')) as total_withdrawals,
        (SELECT SUM(amount) FROM transactions WHERE player_id = ? AND type = 'withdrawal' AND status IN ('completed', 'approved')) as withdrawal_total,
        (SELECT COUNT(*) FROM game_history WHERE player_id = ?) as total_bets,
        (SELECT SUM(bet_amount) FROM game_history WHERE player_id = ?) as total_wagered,
        (SELECT SUM(win_amount) FROM game_history WHERE player_id = ?) as total_wins
    `).get(playerId, playerId, playerId, playerId, playerId, playerId, playerId);

    // Get notes
    const notes = db.prepare(`
      SELECT pn.*, a.email as admin_email
      FROM player_notes pn
      JOIN admins a ON pn.admin_id = a.id
      WHERE pn.player_id = ?
      ORDER BY pn.created_at DESC
    `).all(playerId);

    res.json({
      player: {
        id: player.id,
        email: player.email,
        firstName: player.first_name,
        lastName: player.last_name,
        phone: player.phone,
        dob: player.dob,
        balance: player.balance,
        bonusBalance: player.bonus_balance,
        status: player.status,
        kycStatus: player.kyc_status,
        createdAt: player.created_at,
        updatedAt: player.updated_at,
        tags
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        paymentMethod: t.payment_method,
        createdAt: t.created_at
      })),
      bonuses: bonuses.map(b => ({
        id: b.id,
        name: b.name,
        type: b.bonus_type,
        amount: b.amount,
        wagered: b.wagered,
        wageringTarget: b.wagering_target,
        status: b.status
      })),
      stats: {
        totalDeposits: stats.total_deposits || 0,
        depositTotal: stats.deposit_total || 0,
        totalWithdrawals: stats.total_withdrawals || 0,
        withdrawalTotal: stats.withdrawal_total || 0,
        totalBets: stats.total_bets || 0,
        totalWagered: stats.total_wagered || 0,
        totalWins: stats.total_wins || 0,
        ggr: (stats.total_wagered || 0) - (stats.total_wins || 0)
      },
      notes: notes.map(n => ({
        id: n.id,
        note: n.note,
        adminEmail: n.admin_email,
        createdAt: n.created_at
      }))
    });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Failed to load player' });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { firstName, lastName, phone, dob } = req.body;
    const db = getDb();

    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    db.prepare(`
      UPDATE players
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          dob = COALESCE(?, dob),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(firstName, lastName, phone, dob, playerId);

    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
};

const updatePlayerStatus = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { status, reason } = req.body;
    const db = getDb();

    const player = db.prepare('SELECT id, status FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    db.prepare('UPDATE players SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, playerId);

    // Add note about status change
    if (reason) {
      db.prepare('INSERT INTO player_notes (player_id, admin_id, note) VALUES (?, ?, ?)')
        .run(playerId, req.admin.id, `Status changed from ${player.status} to ${status}. Reason: ${reason}`);
    }

    res.json({ message: `Player ${status === 'blocked' ? 'blocked' : status === 'suspended' ? 'suspended' : 'activated'} successfully` });
  } catch (error) {
    console.error('Update player status error:', error);
    res.status(500).json({ error: 'Failed to update player status' });
  }
};

const adjustBalance = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { amount, type, reason } = req.body;
    const db = getDb();

    const player = db.prepare('SELECT id, balance, bonus_balance FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const balanceType = type === 'bonus' ? 'bonus_balance' : 'balance';
    const currentBalance = type === 'bonus' ? player.bonus_balance : player.balance;
    const newBalance = currentBalance + amount;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Insufficient balance for this adjustment' });
    }

    // Update balance
    db.prepare(`UPDATE players SET ${balanceType} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(newBalance, playerId);

    // Create adjustment transaction
    db.prepare(`
      INSERT INTO transactions (player_id, type, amount, status, notes, processed_by)
      VALUES (?, 'adjustment', ?, 'completed', ?, ?)
    `).run(playerId, amount, reason, req.admin.id);

    // Add note
    db.prepare('INSERT INTO player_notes (player_id, admin_id, note) VALUES (?, ?, ?)')
      .run(playerId, req.admin.id, `Balance adjustment: ${amount > 0 ? '+' : ''}${amount} (${type}). Reason: ${reason}`);

    res.json({
      message: 'Balance adjusted successfully',
      newBalance
    });
  } catch (error) {
    console.error('Adjust balance error:', error);
    res.status(500).json({ error: 'Failed to adjust balance' });
  }
};

const addNote = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { note } = req.body;
    const db = getDb();

    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const result = db.prepare('INSERT INTO player_notes (player_id, admin_id, note) VALUES (?, ?, ?)')
      .run(playerId, req.admin.id, note);

    res.status(201).json({
      message: 'Note added successfully',
      noteId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

const getTags = async (req, res) => {
  try {
    const db = getDb();
    const tags = db.prepare('SELECT * FROM player_tags ORDER BY name').all();

    res.json({
      tags: tags.map(t => ({
        id: t.id,
        name: t.name,
        color: t.color
      }))
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to load tags' });
  }
};

const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM player_tags WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'Tag already exists' });
    }

    const result = db.prepare('INSERT INTO player_tags (name, color) VALUES (?, ?)')
      .run(name, color || '#666666');

    res.status(201).json({
      message: 'Tag created successfully',
      tag: {
        id: result.lastInsertRowid,
        name,
        color: color || '#666666'
      }
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

const assignTag = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { tagId } = req.body;
    const db = getDb();

    const player = db.prepare('SELECT id FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const tag = db.prepare('SELECT id FROM player_tags WHERE id = ?').get(tagId);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    // Check if already assigned
    const existing = db.prepare('SELECT 1 FROM player_tag_assignments WHERE player_id = ? AND tag_id = ?')
      .get(playerId, tagId);

    if (existing) {
      return res.status(400).json({ error: 'Tag already assigned' });
    }

    db.prepare('INSERT INTO player_tag_assignments (player_id, tag_id, assigned_by) VALUES (?, ?, ?)')
      .run(playerId, tagId, req.admin.id);

    res.json({ message: 'Tag assigned successfully' });
  } catch (error) {
    console.error('Assign tag error:', error);
    res.status(500).json({ error: 'Failed to assign tag' });
  }
};

const removeTag = async (req, res) => {
  try {
    const { playerId, tagId } = req.params;
    const db = getDb();

    db.prepare('DELETE FROM player_tag_assignments WHERE player_id = ? AND tag_id = ?')
      .run(playerId, tagId);

    res.json({ message: 'Tag removed successfully' });
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
};

const getPlayerTransactions = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { type, status, page = 1, limit = 20 } = req.query;
    const db = getDb();

    let query = `
      SELECT t.*, a.email as processed_by_email
      FROM transactions t
      LEFT JOIN admins a ON t.processed_by = a.id
      WHERE t.player_id = ?
    `;
    const params = [playerId];

    if (type) {
      query += ' AND t.type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT t\.\*, a\.email as processed_by_email/, 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const transactions = db.prepare(query).all(...params);

    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        paymentMethod: t.payment_method,
        reference: t.reference,
        notes: t.notes,
        processedBy: t.processed_by_email,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get player transactions error:', error);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
};

const processWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { action, notes } = req.body;
    const db = getDb();

    const transaction = db.prepare(`
      SELECT * FROM transactions WHERE id = ? AND type = 'withdrawal' AND status = 'pending'
    `).get(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Pending withdrawal not found' });
    }

    if (action === 'approve') {
      db.prepare(`
        UPDATE transactions
        SET status = 'approved', notes = ?, processed_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(notes, req.admin.id, transactionId);

      res.json({ message: 'Withdrawal approved' });
    } else if (action === 'reject') {
      // Return funds to player
      db.prepare('UPDATE players SET balance = balance + ? WHERE id = ?')
        .run(transaction.amount, transaction.player_id);

      db.prepare(`
        UPDATE transactions
        SET status = 'rejected', notes = ?, processed_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(notes, req.admin.id, transactionId);

      res.json({ message: 'Withdrawal rejected and funds returned' });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Process withdrawal error:', error);
    res.status(500).json({ error: 'Failed to process withdrawal' });
  }
};

module.exports = {
  getPlayers,
  getPlayer,
  updatePlayer,
  updatePlayerStatus,
  adjustBalance,
  addNote,
  getTags,
  createTag,
  assignTag,
  removeTag,
  getPlayerTransactions,
  processWithdrawal
};
