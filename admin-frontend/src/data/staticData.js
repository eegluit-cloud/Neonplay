// Static data for admin frontend - no database required
// Games data is imported from separate file due to size (929 games)

import { games as importedGames, providers as importedProviders, categories as importedCategories } from './gamesData';

// Re-export games data with admin-specific fields added
export const games = importedGames.map(game => ({
  ...game,
  playCount: Math.floor(Math.random() * 5000) + 100,
  totalBets: Math.floor(Math.random() * 500000) + 10000,
  totalWins: Math.floor(Math.random() * 400000) + 8000,
  createdAt: '2024-01-01T10:00:00Z'
}));

export const providers = importedProviders.map(provider => ({
  ...provider,
  status: 'active',
  totalBets: Math.floor(Math.random() * 1000000) + 100000,
  totalWins: Math.floor(Math.random() * 900000) + 90000
}));

export const categories = importedCategories;

export const admins = [
  {
    id: 1,
    email: 'super@casino.com',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    lastLogin: '2024-01-15T09:30:00Z'
  },
  {
    id: 2,
    email: 'manager@casino.com',
    firstName: 'John',
    lastName: 'Manager',
    role: 'manager',
    status: 'active',
    createdAt: '2024-01-02T10:00:00Z',
    lastLogin: '2024-01-15T08:00:00Z'
  },
  {
    id: 3,
    email: 'support@casino.com',
    firstName: 'Sarah',
    lastName: 'Support',
    role: 'support',
    status: 'active',
    createdAt: '2024-01-03T10:00:00Z',
    lastLogin: '2024-01-14T14:00:00Z'
  }
];

export const players = [
  {
    id: 1,
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'Player',
    phone: '+1234567890',
    dob: '1990-05-15',
    balance: 1250.00,
    bonusBalance: 50.00,
    status: 'active',
    kycStatus: 'verified',
    createdAt: '2024-01-05T10:00:00Z',
    lastLogin: '2024-01-15T12:00:00Z',
    tags: [{ id: 1, name: 'VIP', color: '#f59e0b' }]
  },
  {
    id: 2,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1987654321',
    dob: '1985-08-22',
    balance: 500.00,
    bonusBalance: 25.00,
    status: 'active',
    kycStatus: 'pending',
    createdAt: '2024-01-08T14:30:00Z',
    lastLogin: '2024-01-14T18:00:00Z',
    tags: []
  },
  {
    id: 3,
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1555123456',
    dob: '1992-03-10',
    balance: 2500.00,
    bonusBalance: 100.00,
    status: 'active',
    kycStatus: 'verified',
    createdAt: '2024-01-06T09:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z',
    tags: [{ id: 1, name: 'VIP', color: '#f59e0b' }, { id: 2, name: 'High Roller', color: '#6366f1' }]
  },
  {
    id: 4,
    email: 'blocked.user@example.com',
    firstName: 'Blocked',
    lastName: 'User',
    phone: '+1555999888',
    dob: '1988-11-25',
    balance: 0.00,
    bonusBalance: 0.00,
    status: 'blocked',
    kycStatus: 'rejected',
    createdAt: '2024-01-02T11:00:00Z',
    lastLogin: '2024-01-10T15:00:00Z',
    tags: [{ id: 3, name: 'Suspicious', color: '#ef4444' }]
  },
  {
    id: 5,
    email: 'mike.wilson@example.com',
    firstName: 'Mike',
    lastName: 'Wilson',
    phone: '+1555777666',
    dob: '1995-07-18',
    balance: 150.00,
    bonusBalance: 0.00,
    status: 'active',
    kycStatus: 'under_review',
    createdAt: '2024-01-12T16:00:00Z',
    lastLogin: '2024-01-15T11:00:00Z',
    tags: []
  },
  {
    id: 6,
    email: 'sarah.jones@example.com',
    firstName: 'Sarah',
    lastName: 'Jones',
    phone: '+1555444333',
    dob: '1991-12-05',
    balance: 3200.00,
    bonusBalance: 200.00,
    status: 'active',
    kycStatus: 'verified',
    createdAt: '2024-01-04T08:00:00Z',
    lastLogin: '2024-01-15T14:00:00Z',
    tags: [{ id: 1, name: 'VIP', color: '#f59e0b' }]
  },
  {
    id: 7,
    email: 'alex.brown@example.com',
    firstName: 'Alex',
    lastName: 'Brown',
    phone: '+1555222111',
    dob: '1987-04-30',
    balance: 75.00,
    bonusBalance: 10.00,
    status: 'suspended',
    kycStatus: 'pending',
    createdAt: '2024-01-10T13:00:00Z',
    lastLogin: '2024-01-13T09:00:00Z',
    tags: []
  },
  {
    id: 8,
    email: 'emma.davis@example.com',
    firstName: 'Emma',
    lastName: 'Davis',
    phone: '+1555888777',
    dob: '1993-09-12',
    balance: 890.00,
    bonusBalance: 45.00,
    status: 'active',
    kycStatus: 'verified',
    createdAt: '2024-01-07T10:30:00Z',
    lastLogin: '2024-01-15T08:30:00Z',
    tags: []
  }
];

export const transactions = [
  {
    id: 1,
    playerId: 1,
    playerEmail: 'demo@example.com',
    playerName: 'Demo Player',
    type: 'deposit',
    amount: 500.00,
    status: 'completed',
    paymentMethod: 'credit_card',
    reference: 'TXN001234',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    playerId: 3,
    playerEmail: 'jane.smith@example.com',
    playerName: 'Jane Smith',
    type: 'withdrawal',
    amount: 200.00,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    reference: 'TXN001235',
    createdAt: '2024-01-15T09:30:00Z'
  },
  {
    id: 3,
    playerId: 1,
    playerEmail: 'demo@example.com',
    playerName: 'Demo Player',
    type: 'bet',
    amount: 50.00,
    status: 'completed',
    paymentMethod: null,
    reference: 'BET001234',
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 4,
    playerId: 1,
    playerEmail: 'demo@example.com',
    playerName: 'Demo Player',
    type: 'win',
    amount: 125.00,
    status: 'completed',
    paymentMethod: null,
    reference: 'WIN001234',
    createdAt: '2024-01-15T11:05:00Z'
  },
  {
    id: 5,
    playerId: 2,
    playerEmail: 'john.doe@example.com',
    playerName: 'John Doe',
    type: 'deposit',
    amount: 100.00,
    status: 'completed',
    paymentMethod: 'crypto',
    reference: 'TXN001236',
    createdAt: '2024-01-14T14:00:00Z'
  },
  {
    id: 6,
    playerId: 6,
    playerEmail: 'sarah.jones@example.com',
    playerName: 'Sarah Jones',
    type: 'withdrawal',
    amount: 500.00,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    reference: 'TXN001237',
    createdAt: '2024-01-15T08:00:00Z'
  },
  {
    id: 7,
    playerId: 8,
    playerEmail: 'emma.davis@example.com',
    playerName: 'Emma Davis',
    type: 'bonus',
    amount: 50.00,
    status: 'completed',
    paymentMethod: null,
    reference: 'BON001234',
    createdAt: '2024-01-14T10:00:00Z'
  },
  {
    id: 8,
    playerId: 5,
    playerEmail: 'mike.wilson@example.com',
    playerName: 'Mike Wilson',
    type: 'deposit',
    amount: 150.00,
    status: 'completed',
    paymentMethod: 'e_wallet',
    reference: 'TXN001238',
    createdAt: '2024-01-13T16:00:00Z'
  },
  {
    id: 9,
    playerId: 3,
    playerEmail: 'jane.smith@example.com',
    playerName: 'Jane Smith',
    type: 'bet',
    amount: 100.00,
    status: 'completed',
    paymentMethod: null,
    reference: 'BET001235',
    createdAt: '2024-01-14T20:00:00Z'
  },
  {
    id: 10,
    playerId: 3,
    playerEmail: 'jane.smith@example.com',
    playerName: 'Jane Smith',
    type: 'win',
    amount: 350.00,
    status: 'completed',
    paymentMethod: null,
    reference: 'WIN001235',
    createdAt: '2024-01-14T20:15:00Z'
  }
];

export const kycDocuments = [
  {
    id: 1,
    playerId: 1,
    playerEmail: 'demo@example.com',
    playerName: 'Demo Player',
    documentType: 'id_card',
    status: 'approved',
    documentUrl: '/uploads/kyc/doc1.jpg',
    submittedAt: '2024-01-06T10:00:00Z',
    reviewedAt: '2024-01-06T14:00:00Z',
    reviewedBy: 'John Manager',
    notes: 'Document verified'
  },
  {
    id: 2,
    playerId: 2,
    playerEmail: 'john.doe@example.com',
    playerName: 'John Doe',
    documentType: 'passport',
    status: 'pending',
    documentUrl: '/uploads/kyc/doc2.jpg',
    submittedAt: '2024-01-14T15:00:00Z',
    reviewedAt: null,
    reviewedBy: null,
    notes: null
  },
  {
    id: 3,
    playerId: 5,
    playerEmail: 'mike.wilson@example.com',
    playerName: 'Mike Wilson',
    documentType: 'drivers_license',
    status: 'pending',
    documentUrl: '/uploads/kyc/doc3.jpg',
    submittedAt: '2024-01-13T12:00:00Z',
    reviewedAt: null,
    reviewedBy: null,
    notes: null
  },
  {
    id: 4,
    playerId: 4,
    playerEmail: 'blocked.user@example.com',
    playerName: 'Blocked User',
    documentType: 'id_card',
    status: 'rejected',
    documentUrl: '/uploads/kyc/doc4.jpg',
    submittedAt: '2024-01-08T10:00:00Z',
    reviewedAt: '2024-01-09T11:00:00Z',
    reviewedBy: 'John Manager',
    notes: 'Document appears to be altered'
  },
  {
    id: 5,
    playerId: 3,
    playerEmail: 'jane.smith@example.com',
    playerName: 'Jane Smith',
    documentType: 'address_proof',
    status: 'approved',
    documentUrl: '/uploads/kyc/doc5.jpg',
    submittedAt: '2024-01-07T09:00:00Z',
    reviewedAt: '2024-01-07T15:00:00Z',
    reviewedBy: 'John Manager',
    notes: 'Utility bill verified'
  }
];

export const bonuses = [
  {
    id: 1,
    name: 'Welcome Bonus',
    type: 'joining',
    amount: 50.00,
    percentage: null,
    minDeposit: null,
    maxBonus: null,
    wageringReq: 10,
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    maxClaims: null,
    currentClaims: 45,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'First Deposit Bonus',
    type: 'deposit',
    amount: null,
    percentage: 100,
    minDeposit: 50.00,
    maxBonus: 500.00,
    wageringReq: 20,
    status: 'active',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    maxClaims: 1,
    currentClaims: 32,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 3,
    name: 'Weekend Reload',
    type: 'reload',
    amount: null,
    percentage: 50,
    minDeposit: 25.00,
    maxBonus: 200.00,
    wageringReq: 15,
    status: 'active',
    startDate: '2024-01-06T00:00:00Z',
    endDate: '2024-01-07T23:59:59Z',
    maxClaims: null,
    currentClaims: 18,
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 4,
    name: 'Free Spins Friday',
    type: 'free_spins',
    amount: 20.00,
    percentage: null,
    minDeposit: 20.00,
    maxBonus: null,
    wageringReq: 30,
    status: 'inactive',
    startDate: '2024-01-12T00:00:00Z',
    endDate: '2024-01-12T23:59:59Z',
    maxClaims: 100,
    currentClaims: 100,
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 5,
    name: 'VIP Cashback',
    type: 'cashback',
    amount: null,
    percentage: 10,
    minDeposit: null,
    maxBonus: 1000.00,
    wageringReq: 5,
    status: 'active',
    startDate: null,
    endDate: null,
    maxClaims: null,
    currentClaims: 12,
    createdAt: '2024-01-01T10:00:00Z'
  }
];

export const playerBonuses = [
  {
    id: 1,
    playerId: 1,
    bonusId: 1,
    bonusName: 'Welcome Bonus',
    amount: 50.00,
    wagered: 500.00,
    wageringTarget: 500.00,
    status: 'completed',
    claimedAt: '2024-01-05T10:00:00Z',
    expiresAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 2,
    playerId: 1,
    bonusId: 2,
    bonusName: 'First Deposit Bonus',
    amount: 100.00,
    wagered: 1200.00,
    wageringTarget: 2000.00,
    status: 'active',
    claimedAt: '2024-01-10T14:00:00Z',
    expiresAt: '2024-02-10T14:00:00Z'
  },
  {
    id: 3,
    playerId: 3,
    bonusId: 1,
    bonusName: 'Welcome Bonus',
    amount: 50.00,
    wagered: 500.00,
    wageringTarget: 500.00,
    status: 'completed',
    claimedAt: '2024-01-06T09:00:00Z',
    expiresAt: '2024-02-06T09:00:00Z'
  }
];

export const gameHistory = [
  {
    id: 1,
    playerId: 1,
    gameId: 1,
    gameName: 'Mega Fortune',
    providerName: 'NetEnt',
    betAmount: 10.00,
    winAmount: 25.00,
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 2,
    playerId: 1,
    gameId: 5,
    gameName: 'Starburst',
    providerName: 'NetEnt',
    betAmount: 5.00,
    winAmount: 0.00,
    createdAt: '2024-01-15T10:45:00Z'
  },
  {
    id: 3,
    playerId: 3,
    gameId: 8,
    gameName: 'Sweet Bonanza',
    providerName: 'Pragmatic Play',
    betAmount: 20.00,
    winAmount: 85.00,
    createdAt: '2024-01-14T20:00:00Z'
  },
  {
    id: 4,
    playerId: 1,
    gameId: 4,
    gameName: 'Lightning Roulette',
    providerName: 'Evolution',
    betAmount: 25.00,
    winAmount: 0.00,
    createdAt: '2024-01-14T18:30:00Z'
  },
  {
    id: 5,
    playerId: 6,
    gameId: 7,
    gameName: 'Crazy Time',
    providerName: 'Evolution',
    betAmount: 50.00,
    winAmount: 250.00,
    createdAt: '2024-01-14T21:00:00Z'
  }
];

export const playerNotes = [
  {
    id: 1,
    playerId: 1,
    adminId: 2,
    adminName: 'John Manager',
    note: 'VIP player, handle with care. Prefers slot games.',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    playerId: 4,
    adminId: 2,
    adminName: 'John Manager',
    note: 'Account blocked due to suspicious activity. Multiple failed KYC attempts.',
    createdAt: '2024-01-09T11:00:00Z'
  },
  {
    id: 3,
    playerId: 3,
    adminId: 3,
    adminName: 'Sarah Support',
    note: 'Requested higher deposit limits. Forwarded to manager.',
    createdAt: '2024-01-12T14:00:00Z'
  }
];

export const dashboardStats = {
  today: {
    deposits: 2500.00,
    withdrawals: 700.00,
    bets: 5200.00,
    wins: 4800.00,
    ggr: 400.00,
    newPlayers: 3,
    activeBonus: 850.00
  },
  pendingWithdrawals: 2,
  pendingKyc: 2,
  trends: [
    { date: '2024-01-09', deposits: 1800, withdrawals: 500, ggr: 320 },
    { date: '2024-01-10', deposits: 2200, withdrawals: 800, ggr: 450 },
    { date: '2024-01-11', deposits: 1500, withdrawals: 600, ggr: 280 },
    { date: '2024-01-12', deposits: 3000, withdrawals: 1200, ggr: 520 },
    { date: '2024-01-13', deposits: 2800, withdrawals: 900, ggr: 480 },
    { date: '2024-01-14', deposits: 2400, withdrawals: 700, ggr: 380 },
    { date: '2024-01-15', deposits: 2500, withdrawals: 700, ggr: 400 }
  ]
};

// Helper to get player by ID
export const getPlayerById = (id) => players.find(p => p.id === parseInt(id));

// Helper to get transactions by player ID
export const getTransactionsByPlayerId = (playerId) =>
  transactions.filter(t => t.playerId === parseInt(playerId));

// Helper to get player bonuses by player ID
export const getPlayerBonusesByPlayerId = (playerId) =>
  playerBonuses.filter(pb => pb.playerId === parseInt(playerId));

// Helper to get notes by player ID
export const getNotesByPlayerId = (playerId) =>
  playerNotes.filter(n => n.playerId === parseInt(playerId));

// Helper to get game history by player ID
export const getGameHistoryByPlayerId = (playerId) =>
  gameHistory.filter(gh => gh.playerId === parseInt(playerId));

// ============================================
// CASINO MANAGEMENT DATA
// ============================================

// Aggregators - companies that aggregate multiple game providers
export const aggregators = [
  {
    id: 1,
    name: 'Alea Gaming',
    slug: 'alea',
    status: 'active',
    apiEndpoint: 'https://api.alea.com/v1',
    providerCount: 10,
    gameCount: 929,
    lastSync: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'SoftSwiss',
    slug: 'softswiss',
    status: 'active',
    apiEndpoint: 'https://api.softswiss.com/v2',
    providerCount: 45,
    gameCount: 5200,
    lastSync: '2024-01-15T09:30:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Slotegrator',
    slug: 'slotegrator',
    status: 'inactive',
    apiEndpoint: 'https://api.slotegrator.com/v1',
    providerCount: 60,
    gameCount: 7500,
    lastSync: '2024-01-10T14:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'EveryMatrix',
    slug: 'everymatrix',
    status: 'active',
    apiEndpoint: 'https://api.everymatrix.com/v3',
    providerCount: 80,
    gameCount: 12000,
    lastSync: '2024-01-15T08:00:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Custom categories - admin-created categories for organizing/featuring games
export const customCategories = [
  {
    id: 1,
    name: 'Weekly Featured',
    slug: 'weekly-featured',
    description: 'Hand-picked games featured this week',
    icon: 'star',
    displayOrder: 1,
    status: 'active',
    showOnHomepage: true,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'High RTP',
    slug: 'high-rtp',
    description: 'Games with RTP above 96%',
    icon: 'trending-up',
    displayOrder: 2,
    status: 'active',
    showOnHomepage: true,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 3,
    name: 'New Releases',
    slug: 'new-releases',
    description: 'Latest games added to the platform',
    icon: 'sparkles',
    displayOrder: 3,
    status: 'active',
    showOnHomepage: true,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 4,
    name: 'Jackpot Games',
    slug: 'jackpot-games',
    description: 'Progressive jackpot games',
    icon: 'diamond',
    displayOrder: 4,
    status: 'active',
    showOnHomepage: true,
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 5,
    name: 'Top Performers',
    slug: 'top-performers',
    description: 'Most played games this month',
    icon: 'fire',
    displayOrder: 5,
    status: 'active',
    showOnHomepage: false,
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 6,
    name: 'Bonus Buy',
    slug: 'bonus-buy',
    description: 'Games with bonus buy feature',
    icon: 'gift',
    displayOrder: 6,
    status: 'inactive',
    showOnHomepage: false,
    createdAt: '2024-01-08T10:00:00Z'
  }
];

// Game-to-custom-category assignments
export const gameCategoryAssignments = [
  // Weekly Featured games
  { id: 1, gameId: 741, categoryId: 1 },
  { id: 2, gameId: 744, categoryId: 1 },
  { id: 3, gameId: 750, categoryId: 1 },
  { id: 4, gameId: 1474, categoryId: 1 },
  { id: 5, gameId: 741, categoryId: 2 }, // High RTP
  { id: 6, gameId: 744, categoryId: 2 },
  { id: 7, gameId: 750, categoryId: 3 }, // New Releases
  { id: 8, gameId: 1474, categoryId: 4 }, // Jackpot Games
  { id: 9, gameId: 741, categoryId: 5 }, // Top Performers
  { id: 10, gameId: 744, categoryId: 5 }
];

// Provider-to-aggregator mapping (which aggregator provides which provider)
export const providerAggregatorMap = [
  { providerId: 1, aggregatorId: 1 },  // Kalamba via Alea
  { providerId: 2, aggregatorId: 1 },  // Betsoft via Alea
  { providerId: 3, aggregatorId: 1 },  // Hacksaw via Alea
  { providerId: 4, aggregatorId: 1 },  // Caleta via Alea
  { providerId: 5, aggregatorId: 1 },  // TurboGames via Alea
  { providerId: 6, aggregatorId: 1 },  // Gamzix via Alea
  { providerId: 7, aggregatorId: 1 },  // Boldplay via Alea
  { providerId: 8, aggregatorId: 1 },  // ElaGames via Alea
  { providerId: 9, aggregatorId: 1 },  // 3 Oaks via Alea
  { providerId: 10, aggregatorId: 1 }  // Felix Gaming via Alea
];

// ============================================
// BONUS MANAGEMENT DATA
// ============================================

// Bonus categories - types of bonuses available
export const bonusCategories = [
  {
    id: 1,
    name: 'Joining Bonus',
    slug: 'joining',
    description: 'One-time bonus for new players upon registration',
    icon: 'user-plus',
    status: 'active'
  },
  {
    id: 2,
    name: 'Deposit Bonus',
    slug: 'deposit',
    description: 'Bonus awarded on qualifying deposits',
    icon: 'credit-card',
    status: 'active'
  },
  {
    id: 3,
    name: 'Reload Bonus',
    slug: 'reload',
    description: 'Recurring deposit bonus for existing players',
    icon: 'refresh',
    status: 'active'
  },
  {
    id: 4,
    name: 'Losing Bonus',
    slug: 'losing',
    description: 'Cashback bonus based on net losses',
    icon: 'shield',
    status: 'active'
  },
  {
    id: 5,
    name: 'Free Spins',
    slug: 'free-spins',
    description: 'Free game rounds on selected slots',
    icon: 'rotate',
    status: 'active'
  },
  {
    id: 6,
    name: 'Loyalty Reward',
    slug: 'loyalty',
    description: 'Points-based loyalty program rewards',
    icon: 'award',
    status: 'active'
  },
  {
    id: 7,
    name: 'Referral Bonus',
    slug: 'referral',
    description: 'Bonus for referring new players',
    icon: 'users',
    status: 'inactive'
  }
];

// Bonus auto-trigger rules
export const bonusRules = [
  {
    id: 1,
    name: 'First Deposit Trigger',
    bonusId: 2,
    bonusName: 'First Deposit Bonus',
    triggerType: 'first_deposit',
    conditions: { minDeposit: 50, maxDeposit: null },
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Welcome Bonus Trigger',
    bonusId: 1,
    bonusName: 'Welcome Bonus',
    triggerType: 'registration',
    conditions: { kycRequired: false },
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 3,
    name: 'Weekly Loss Cashback',
    bonusId: 5,
    bonusName: 'VIP Cashback',
    triggerType: 'weekly_loss',
    conditions: { minLoss: 100, maxCashback: 500, percentage: 10 },
    status: 'active',
    createdAt: '2024-01-05T10:00:00Z'
  },
  {
    id: 4,
    name: 'Weekend Reload Trigger',
    bonusId: 3,
    bonusName: 'Weekend Reload',
    triggerType: 'deposit_day',
    conditions: { days: ['saturday', 'sunday'], minDeposit: 25 },
    status: 'active',
    createdAt: '2024-01-05T10:00:00Z'
  }
];

// ============================================
// REPORTS DATA
// ============================================

// KYC report statistics
export const kycReportStats = {
  summary: {
    totalSubmissions: 156,
    pending: 23,
    approved: 112,
    rejected: 21,
    avgProcessingHours: 4.2
  },
  byDocumentType: [
    { type: 'ID Card', submissions: 65, approved: 52, rejected: 8, pending: 5 },
    { type: 'Passport', submissions: 45, approved: 38, rejected: 4, pending: 3 },
    { type: 'Drivers License', submissions: 28, approved: 15, rejected: 6, pending: 7 },
    { type: 'Address Proof', submissions: 18, approved: 7, rejected: 3, pending: 8 }
  ],
  weeklyTrend: [
    { week: 'Jan 1-7', submissions: 18, approved: 14, rejected: 3 },
    { week: 'Jan 8-14', submissions: 25, approved: 20, rejected: 4 },
    { week: 'Jan 15-21', submissions: 32, approved: 26, rejected: 5 }
  ]
};

// NGR (Net Gaming Revenue) data by provider
export const ngrData = {
  byProvider: [
    { providerId: 1, providerName: 'Kalamba', bets: 125000, wins: 112500, ggr: 12500, bonusCost: 1250, ngr: 11250 },
    { providerId: 2, providerName: 'Betsoft', bets: 98000, wins: 88200, ggr: 9800, bonusCost: 980, ngr: 8820 },
    { providerId: 3, providerName: 'Hacksaw Gaming', bets: 210000, wins: 189000, ggr: 21000, bonusCost: 2100, ngr: 18900 },
    { providerId: 4, providerName: 'Caleta', bets: 45000, wins: 40500, ggr: 4500, bonusCost: 450, ngr: 4050 },
    { providerId: 5, providerName: 'TurboGames', bets: 67000, wins: 60300, ggr: 6700, bonusCost: 670, ngr: 6030 }
  ],
  byGame: [
    { gameId: 741, gameName: 'Hong Bao', bets: 35000, wins: 31500, ggr: 3500, playCount: 1250 },
    { gameId: 744, gameName: 'Caribbean Anne', bets: 28000, wins: 25200, ggr: 2800, playCount: 980 },
    { gameId: 750, gameName: 'Blazing Bull', bets: 42000, wins: 37800, ggr: 4200, playCount: 1450 }
  ],
  totals: {
    totalBets: 545000,
    totalWins: 490500,
    totalGgr: 54500,
    totalBonusCost: 5450,
    totalNgr: 49050
  }
};

// Banking report data
export const bankingReportData = {
  byMethod: [
    { method: 'Credit Card', deposits: 85000, withdrawals: 32000, depositCount: 450, withdrawalCount: 120 },
    { method: 'Bank Transfer', deposits: 120000, withdrawals: 78000, depositCount: 280, withdrawalCount: 95 },
    { method: 'Crypto', deposits: 95000, withdrawals: 45000, depositCount: 180, withdrawalCount: 85 },
    { method: 'E-Wallet', deposits: 65000, withdrawals: 28000, depositCount: 320, withdrawalCount: 145 }
  ],
  pendingTransactions: {
    withdrawals: 12,
    totalAmount: 15800,
    oldestPending: '2024-01-13T10:00:00Z'
  },
  dailyTrend: [
    { date: '2024-01-09', deposits: 18500, withdrawals: 8200 },
    { date: '2024-01-10', deposits: 22000, withdrawals: 11500 },
    { date: '2024-01-11', deposits: 15800, withdrawals: 7800 },
    { date: '2024-01-12', deposits: 28000, withdrawals: 14200 },
    { date: '2024-01-13', deposits: 24500, withdrawals: 12800 },
    { date: '2024-01-14', deposits: 21000, withdrawals: 9500 },
    { date: '2024-01-15', deposits: 25200, withdrawals: 11200 }
  ]
};

// Helper functions for casino management
export const getProvidersByAggregator = (aggregatorId) => {
  const providerIds = providerAggregatorMap
    .filter(m => m.aggregatorId === aggregatorId)
    .map(m => m.providerId);
  return providers.filter(p => providerIds.includes(p.id));
};

export const getGamesByCustomCategory = (categoryId) => {
  const gameIds = gameCategoryAssignments
    .filter(a => a.categoryId === categoryId)
    .map(a => a.gameId);
  return games.filter(g => gameIds.includes(g.id));
};

export const getCustomCategoriesForGame = (gameId) => {
  const categoryIds = gameCategoryAssignments
    .filter(a => a.gameId === gameId)
    .map(a => a.categoryId);
  return customCategories.filter(c => categoryIds.includes(c.id));
};
