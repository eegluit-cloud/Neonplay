const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

let db;

function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'admin.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initDatabase() {
  const db = getDb();

  // Create tables
  db.exec(`
    -- Admins table
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'support' CHECK(role IN ('super_admin', 'manager', 'support', 'viewer')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Admin activity logs
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id)
    );

    -- Players table (for admin management)
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      dob TEXT,
      balance REAL DEFAULT 0,
      bonus_balance REAL DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended', 'blocked')),
      kyc_status TEXT DEFAULT 'pending' CHECK(kyc_status IN ('pending', 'under_review', 'verified', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Player tags
    CREATE TABLE IF NOT EXISTS player_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Player tag assignments
    CREATE TABLE IF NOT EXISTS player_tag_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      assigned_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (tag_id) REFERENCES player_tags(id),
      FOREIGN KEY (assigned_by) REFERENCES admins(id),
      UNIQUE(player_id, tag_id)
    );

    -- Player notes
    CREATE TABLE IF NOT EXISTS player_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      admin_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (admin_id) REFERENCES admins(id)
    );

    -- Transactions
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal', 'bet', 'win', 'bonus', 'adjustment')),
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'cancelled')),
      payment_method TEXT,
      reference TEXT,
      notes TEXT,
      processed_by INTEGER,
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (processed_by) REFERENCES admins(id)
    );

    -- KYC Documents
    CREATE TABLE IF NOT EXISTS kyc_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      document_type TEXT NOT NULL CHECK(document_type IN ('id_card', 'passport', 'drivers_license', 'address_proof', 'selfie')),
      document_url TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewed_by INTEGER,
      notes TEXT,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (reviewed_by) REFERENCES admins(id)
    );

    -- Game categories
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Aggregators
    CREATE TABLE IF NOT EXISTS aggregators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      api_endpoint TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      last_sync DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Providers
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      aggregator_id INTEGER,
      logo TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      game_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aggregator_id) REFERENCES aggregators(id)
    );

    -- Games
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      provider_id INTEGER NOT NULL,
      category_id INTEGER,
      thumbnail TEXT,
      description TEXT,
      rtp REAL,
      volatility TEXT CHECK(volatility IN ('low', 'medium', 'high')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance')),
      is_featured INTEGER DEFAULT 0,
      is_new INTEGER DEFAULT 0,
      play_count INTEGER DEFAULT 0,
      total_bets REAL DEFAULT 0,
      total_wins REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    -- Game-category assignments (many-to-many)
    CREATE TABLE IF NOT EXISTS game_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      UNIQUE(game_id, category_id)
    );

    -- Bonuses
    CREATE TABLE IF NOT EXISTS bonuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('joining', 'deposit', 'reload', 'free_spins', 'cashback', 'loyalty', 'referral')),
      amount REAL,
      percentage REAL,
      min_deposit REAL,
      max_bonus REAL,
      wagering_req REAL DEFAULT 1,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'expired')),
      start_date DATETIME,
      end_date DATETIME,
      max_claims INTEGER,
      current_claims INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Player bonuses
    CREATE TABLE IF NOT EXISTS player_bonuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      bonus_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      wagered REAL DEFAULT 0,
      wagering_target REAL NOT NULL,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'forfeited', 'expired')),
      claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (bonus_id) REFERENCES bonuses(id)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
    CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
    CREATE INDEX IF NOT EXISTS idx_players_kyc_status ON players(kyc_status);
    CREATE INDEX IF NOT EXISTS idx_transactions_player_id ON transactions(player_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_kyc_documents_player_id ON kyc_documents(player_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);
    CREATE INDEX IF NOT EXISTS idx_games_provider_id ON games(provider_id);
    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    CREATE INDEX IF NOT EXISTS idx_player_bonuses_player_id ON player_bonuses(player_id);
    CREATE INDEX IF NOT EXISTS idx_player_bonuses_status ON player_bonuses(status);
  `);

  // Seed default data if empty
  seedDefaultData(db);

  console.log('Admin backend database initialized');
}

async function seedDefaultData(db) {
  // Check if admins exist
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();

  if (adminCount.count === 0) {
    console.log('Seeding default admin data...');

    // Create default super admin (password: Admin@123)
    const passwordHash = bcrypt.hashSync('Admin@123', 12);

    db.prepare(`
      INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('super@casino.com', passwordHash, 'Super', 'Admin', 'super_admin', 'active');

    db.prepare(`
      INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('manager@casino.com', passwordHash, 'John', 'Manager', 'manager', 'active');

    db.prepare(`
      INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('support@casino.com', passwordHash, 'Sarah', 'Support', 'support', 'active');

    console.log('Default admins created:');
    console.log('  super@casino.com / Admin@123 (Super Admin)');
    console.log('  manager@casino.com / Admin@123 (Manager)');
    console.log('  support@casino.com / Admin@123 (Support)');
  }

  // Check if categories exist
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();

  if (categoryCount.count === 0) {
    const categories = [
      ['Slots', 'slots', 'Slot machine games', 'slot-machine', 1],
      ['Table Games', 'table-games', 'Classic table games', 'table', 2],
      ['Live Casino', 'live-casino', 'Live dealer games', 'video', 3],
      ['Jackpot', 'jackpot', 'Progressive jackpot games', 'trophy', 4],
      ['Crash Games', 'crash', 'Crash and instant games', 'rocket', 5]
    ];

    const insertCategory = db.prepare(`
      INSERT INTO categories (name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)
    `);

    categories.forEach(cat => insertCategory.run(...cat));
  }

  // Check if aggregators exist
  const aggregatorCount = db.prepare('SELECT COUNT(*) as count FROM aggregators').get();

  if (aggregatorCount.count === 0) {
    const aggregators = [
      ['Alea Gaming', 'alea', 'https://api.alea.com/v1'],
      ['SoftSwiss', 'softswiss', 'https://api.softswiss.com/v2'],
      ['EveryMatrix', 'everymatrix', 'https://api.everymatrix.com/v3']
    ];

    const insertAggregator = db.prepare(`
      INSERT INTO aggregators (name, slug, api_endpoint) VALUES (?, ?, ?)
    `);

    aggregators.forEach(agg => insertAggregator.run(...agg));
  }

  // Check if providers exist
  const providerCount = db.prepare('SELECT COUNT(*) as count FROM providers').get();

  if (providerCount.count === 0) {
    const providers = [
      ['Kalamba', 'kalamba', 1, 'active', 85],
      ['Betsoft', 'betsoft', 1, 'active', 120],
      ['Hacksaw Gaming', 'hacksaw', 1, 'active', 65],
      ['Pragmatic Play', 'pragmatic', 2, 'active', 250],
      ['Evolution', 'evolution', 2, 'active', 180],
      ['NetEnt', 'netent', 2, 'active', 200],
      ['Play\'n GO', 'playngo', 3, 'active', 175]
    ];

    const insertProvider = db.prepare(`
      INSERT INTO providers (name, slug, aggregator_id, status, game_count) VALUES (?, ?, ?, ?, ?)
    `);

    providers.forEach(prov => insertProvider.run(...prov));
  }

  // Check if player tags exist
  const tagCount = db.prepare('SELECT COUNT(*) as count FROM player_tags').get();

  if (tagCount.count === 0) {
    const tags = [
      ['VIP', '#f59e0b'],
      ['High Roller', '#6366f1'],
      ['New Player', '#10b981'],
      ['Suspicious', '#ef4444'],
      ['Whale', '#8b5cf6']
    ];

    const insertTag = db.prepare('INSERT INTO player_tags (name, color) VALUES (?, ?)');
    tags.forEach(tag => insertTag.run(...tag));
  }

  // Check if bonuses exist
  const bonusCount = db.prepare('SELECT COUNT(*) as count FROM bonuses').get();

  if (bonusCount.count === 0) {
    const bonuses = [
      ['Welcome Bonus', 'WELCOME50', 'joining', 50, null, null, null, 10],
      ['First Deposit', 'FIRST100', 'deposit', null, 100, 50, 500, 20],
      ['Weekend Reload', 'WEEKEND50', 'reload', null, 50, 25, 200, 15],
      ['VIP Cashback', null, 'cashback', null, 10, null, 1000, 5]
    ];

    const insertBonus = db.prepare(`
      INSERT INTO bonuses (name, code, type, amount, percentage, min_deposit, max_bonus, wagering_req)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    bonuses.forEach(bonus => insertBonus.run(...bonus));
  }

  // Seed sample players if empty
  const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get();

  if (playerCount.count === 0) {
    const players = [
      ['demo@example.com', 'Demo', 'Player', '+1234567890', '1990-05-15', 1250.00, 50.00, 'active', 'verified'],
      ['john.doe@example.com', 'John', 'Doe', '+1987654321', '1985-08-22', 500.00, 25.00, 'active', 'pending'],
      ['jane.smith@example.com', 'Jane', 'Smith', '+1555123456', '1992-03-10', 2500.00, 100.00, 'active', 'verified'],
      ['mike.wilson@example.com', 'Mike', 'Wilson', '+1555777666', '1995-07-18', 150.00, 0, 'active', 'under_review'],
      ['sarah.jones@example.com', 'Sarah', 'Jones', '+1555444333', '1991-12-05', 3200.00, 200.00, 'active', 'verified']
    ];

    const insertPlayer = db.prepare(`
      INSERT INTO players (email, first_name, last_name, phone, dob, balance, bonus_balance, status, kyc_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    players.forEach(player => insertPlayer.run(...player));

    // Add some transactions
    const transactions = [
      [1, 'deposit', 500.00, 'completed', 'credit_card', 'TXN001234'],
      [1, 'bet', 50.00, 'completed', null, 'BET001234'],
      [1, 'win', 125.00, 'completed', null, 'WIN001234'],
      [3, 'withdrawal', 200.00, 'pending', 'bank_transfer', 'TXN001235'],
      [2, 'deposit', 100.00, 'completed', 'crypto', 'TXN001236'],
      [5, 'withdrawal', 500.00, 'pending', 'bank_transfer', 'TXN001237']
    ];

    const insertTransaction = db.prepare(`
      INSERT INTO transactions (player_id, type, amount, status, payment_method, reference)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    transactions.forEach(tx => insertTransaction.run(...tx));

    // Add KYC documents
    const kycDocs = [
      [1, 'id_card', '/uploads/kyc/doc1.jpg', 'approved'],
      [2, 'passport', '/uploads/kyc/doc2.jpg', 'pending'],
      [4, 'drivers_license', '/uploads/kyc/doc3.jpg', 'pending']
    ];

    const insertKyc = db.prepare(`
      INSERT INTO kyc_documents (player_id, document_type, document_url, status)
      VALUES (?, ?, ?, ?)
    `);

    kycDocs.forEach(doc => insertKyc.run(...doc));

    // Assign VIP tag to some players
    db.prepare('INSERT INTO player_tag_assignments (player_id, tag_id, assigned_by) VALUES (1, 1, 1)').run();
    db.prepare('INSERT INTO player_tag_assignments (player_id, tag_id, assigned_by) VALUES (3, 1, 1)').run();
    db.prepare('INSERT INTO player_tag_assignments (player_id, tag_id, assigned_by) VALUES (3, 2, 1)').run();
  }

  // Seed sample games if empty
  const gameCount = db.prepare('SELECT COUNT(*) as count FROM games').get();

  if (gameCount.count === 0) {
    const games = [
      ['Mega Fortune', 'mega-fortune', 6, 1, 'https://example.com/mega-fortune.jpg', 96.4, 'high'],
      ['Starburst', 'starburst', 6, 1, 'https://example.com/starburst.jpg', 96.1, 'low'],
      ['Book of Dead', 'book-of-dead', 7, 1, 'https://example.com/book-of-dead.jpg', 96.2, 'high'],
      ['Sweet Bonanza', 'sweet-bonanza', 4, 1, 'https://example.com/sweet-bonanza.jpg', 96.5, 'high'],
      ['Lightning Roulette', 'lightning-roulette', 5, 3, 'https://example.com/lightning-roulette.jpg', 97.3, 'medium'],
      ['Crazy Time', 'crazy-time', 5, 3, 'https://example.com/crazy-time.jpg', 95.5, 'high'],
      ['Gates of Olympus', 'gates-of-olympus', 4, 1, 'https://example.com/gates-of-olympus.jpg', 96.5, 'high'],
      ['The Dog House', 'the-dog-house', 4, 1, 'https://example.com/dog-house.jpg', 96.5, 'high']
    ];

    const insertGame = db.prepare(`
      INSERT INTO games (name, slug, provider_id, category_id, thumbnail, rtp, volatility)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    games.forEach(game => insertGame.run(...game));
  }
}

module.exports = { getDb, initDatabase };
