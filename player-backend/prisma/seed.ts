import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // VIP TIERS
  // ============================================
  console.log('Creating VIP tiers...');
  await Promise.all([
    prisma.vipTier.upsert({
      where: { slug: 'bronze' },
      update: {},
      create: {
        name: 'Bronze',
        slug: 'bronze',
        level: 1,
        minXp: BigInt(0),
        iconUrl: '/icons/vip/bronze.png',
        color: '#CD7F32',
        cashbackPercent: 0,
        redemptionBonusPercent: 0,
        benefits: {
          dailyBonus: 1,
          weeklyBonus: 5,
          features: ['Daily Bonus', 'Weekly Bonus', 'Standard Support'],
        },
      },
    }),
    prisma.vipTier.upsert({
      where: { slug: 'silver' },
      update: {},
      create: {
        name: 'Silver',
        slug: 'silver',
        level: 2,
        minXp: BigInt(10000),
        iconUrl: '/icons/vip/silver.png',
        color: '#C0C0C0',
        cashbackPercent: 5,
        redemptionBonusPercent: 2,
        benefits: {
          dailyBonus: 2,
          weeklyBonus: 10,
          features: ['Enhanced Daily Bonus', 'Weekly Bonus', 'Priority Support', '5% Cashback'],
        },
      },
    }),
    prisma.vipTier.upsert({
      where: { slug: 'gold' },
      update: {},
      create: {
        name: 'Gold',
        slug: 'gold',
        level: 3,
        minXp: BigInt(50000),
        iconUrl: '/icons/vip/gold.png',
        color: '#FFD700',
        cashbackPercent: 10,
        redemptionBonusPercent: 5,
        benefits: {
          dailyBonus: 5,
          weeklyBonus: 25,
          features: ['Premium Daily Bonus', 'Premium Weekly Bonus', 'VIP Support', '10% Cashback', 'Exclusive Games'],
        },
      },
    }),
    prisma.vipTier.upsert({
      where: { slug: 'platinum' },
      update: {},
      create: {
        name: 'Platinum',
        slug: 'platinum',
        level: 4,
        minXp: BigInt(200000),
        iconUrl: '/icons/vip/platinum.png',
        color: '#E5E4E2',
        cashbackPercent: 15,
        redemptionBonusPercent: 10,
        benefits: {
          dailyBonus: 10,
          weeklyBonus: 50,
          monthlyBonus: 100,
          features: ['Elite Daily Bonus', 'Elite Weekly/Monthly Bonus', 'Dedicated Account Manager', '15% Cashback', 'All Games Access', 'Priority Withdrawals'],
        },
      },
    }),
    prisma.vipTier.upsert({
      where: { slug: 'diamond' },
      update: {},
      create: {
        name: 'Diamond',
        slug: 'diamond',
        level: 5,
        minXp: BigInt(1000000),
        iconUrl: '/icons/vip/diamond.png',
        color: '#B9F2FF',
        cashbackPercent: 20,
        redemptionBonusPercent: 15,
        benefits: {
          dailyBonus: 25,
          weeklyBonus: 100,
          monthlyBonus: 500,
          features: ['Ultimate Daily Bonus', 'Ultimate Weekly/Monthly Bonus', 'Personal VIP Host', '20% Cashback', 'Exclusive Events', 'Instant Withdrawals', 'Custom Limits'],
        },
      },
    }),
  ]);

  // ============================================
  // GAME CATEGORIES
  // ============================================
  console.log('Creating game categories...');
  const categories = await Promise.all([
    prisma.gameCategory.upsert({
      where: { slug: 'slots' },
      update: {},
      create: { id: 'cat-slots', name: 'Slots', slug: 'slots', description: 'Classic and video slot games', sortOrder: 1 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'table-games' },
      update: {},
      create: { id: 'cat-table', name: 'Table Games', slug: 'table-games', description: 'Classic table games', sortOrder: 2 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'live-casino' },
      update: {},
      create: { id: 'cat-live', name: 'Live Casino', slug: 'live-casino', description: 'Live dealer games', sortOrder: 3 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'crash-games' },
      update: {},
      create: { id: 'cat-crash', name: 'Crash Games', slug: 'crash-games', description: 'Multiplier crash games', sortOrder: 4 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'game-shows' },
      update: {},
      create: { id: 'cat-shows', name: 'Game Shows', slug: 'game-shows', description: 'Interactive game shows', sortOrder: 5 },
    }),
  ]);

  // ============================================
  // GAME PROVIDERS
  // ============================================
  console.log('Creating game providers...');
  const providers = await Promise.all([
    prisma.gameProvider.upsert({
      where: { slug: 'pragmatic-play' },
      update: {},
      create: { id: 'prov-pragmatic', name: 'Pragmatic Play', slug: 'pragmatic-play', logoUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2020/05/Pragmatic-Play-logo.png', sortOrder: 1 },
    }),
    prisma.gameProvider.upsert({
      where: { slug: 'netent' },
      update: {},
      create: { id: 'prov-netent', name: 'NetEnt', slug: 'netent', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/NetEnt_logo.png', sortOrder: 2 },
    }),
    prisma.gameProvider.upsert({
      where: { slug: 'evolution' },
      update: {},
      create: { id: 'prov-evolution', name: 'Evolution Gaming', slug: 'evolution', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Evolution_Gaming_logo.png', sortOrder: 3 },
    }),
    prisma.gameProvider.upsert({
      where: { slug: 'play-n-go' },
      update: {},
      create: { id: 'prov-playgo', name: "Play'n GO", slug: 'play-n-go', logoUrl: 'https://www.playngo.com/hubfs/Play-n-GO-1.png', sortOrder: 4 },
    }),
    prisma.gameProvider.upsert({
      where: { slug: 'hacksaw' },
      update: {},
      create: { id: 'prov-hacksaw', name: 'Hacksaw Gaming', slug: 'hacksaw', logoUrl: 'https://hacksawgaming.com/assets/img/hacksaw-logo.svg', sortOrder: 5 },
    }),
  ]);

  // ============================================
  // SAMPLE GAMES
  // ============================================
  console.log('Creating sample games...');
  const sampleGames = [
    { id: 'game-1', name: 'Gates of Olympus', slug: 'gates-of-olympus', categoryId: 'cat-slots', providerId: 'prov-pragmatic', rtp: '96.50', volatility: 'high', isFeatured: true, isHot: true },
    { id: 'game-2', name: 'Sweet Bonanza', slug: 'sweet-bonanza', categoryId: 'cat-slots', providerId: 'prov-pragmatic', rtp: '96.48', volatility: 'medium-high', isFeatured: true, isNew: true },
    { id: 'game-3', name: 'Starburst', slug: 'starburst', categoryId: 'cat-slots', providerId: 'prov-netent', rtp: '96.09', volatility: 'low', isFeatured: true },
    { id: 'game-4', name: 'Book of Dead', slug: 'book-of-dead', categoryId: 'cat-slots', providerId: 'prov-playgo', rtp: '96.21', volatility: 'high', isHot: true },
    { id: 'game-5', name: 'Wanted Dead or a Wild', slug: 'wanted-dead-or-wild', categoryId: 'cat-slots', providerId: 'prov-hacksaw', rtp: '96.38', volatility: 'very-high', isFeatured: true, isNew: true },
    { id: 'game-6', name: 'Crazy Time', slug: 'crazy-time', categoryId: 'cat-shows', providerId: 'prov-evolution', rtp: '95.50', volatility: 'medium', isFeatured: true, isHot: true },
    { id: 'game-7', name: 'Lightning Roulette', slug: 'lightning-roulette', categoryId: 'cat-live', providerId: 'prov-evolution', rtp: '97.30', volatility: 'medium', isFeatured: true },
    { id: 'game-8', name: 'Blackjack Live', slug: 'blackjack-live', categoryId: 'cat-live', providerId: 'prov-evolution', rtp: '99.50', volatility: 'low', isFeatured: true },
    { id: 'game-9', name: 'Aviator', slug: 'aviator', categoryId: 'cat-crash', providerId: 'prov-pragmatic', rtp: '97.00', volatility: 'high', isFeatured: true, isHot: true },
    { id: 'game-10', name: 'Spaceman', slug: 'spaceman', categoryId: 'cat-crash', providerId: 'prov-pragmatic', rtp: '96.50', volatility: 'high', isNew: true },
  ];

  for (const game of sampleGames) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {},
      create: {
        id: game.id,
        name: game.name,
        slug: game.slug,
        description: `Play ${game.name} - one of the most popular casino games!`,
        thumbnailUrl: `https://placehold.co/400x300/1a1a2e/f4d03f?text=${encodeURIComponent(game.name)}`,
        bannerUrl: `https://placehold.co/1200x400/1a1a2e/f4d03f?text=${encodeURIComponent(game.name)}`,
        categoryId: game.categoryId,
        providerId: game.providerId,
        rtp: game.rtp,
        volatility: game.volatility,
        minBet: '0.10',
        maxBet: '1000',
        isFeatured: game.isFeatured || false,
        isNew: game.isNew || false,
        isHot: game.isHot || false,
      },
    });
  }

  // ============================================
  // DEPOSIT PACKAGES
  // ============================================
  console.log('Creating deposit packages...');
  const depositPackages = [
    { id: 'pkg-1', name: 'Starter', amount: 10, bonusAmount: 1, sortOrder: 1 },
    { id: 'pkg-2', name: 'Bronze', amount: 25, bonusAmount: 3, sortOrder: 2 },
    { id: 'pkg-3', name: 'Silver', amount: 50, bonusAmount: 7.5, isPopular: true, sortOrder: 3 },
    { id: 'pkg-4', name: 'Gold', amount: 100, bonusAmount: 20, sortOrder: 4 },
    { id: 'pkg-5', name: 'Platinum', amount: 250, bonusAmount: 62.5, sortOrder: 5 },
    { id: 'pkg-6', name: 'Diamond', amount: 500, bonusAmount: 150, isBestValue: true, sortOrder: 6 },
    { id: 'pkg-7', name: 'Elite', amount: 1000, bonusAmount: 350, sortOrder: 7 },
    { id: 'pkg-8', name: 'VIP', amount: 2500, bonusAmount: 1000, sortOrder: 8 },
  ];

  for (const pkg of depositPackages) {
    await prisma.depositPackage.upsert({
      where: { id: pkg.id },
      update: {},
      create: {
        id: pkg.id,
        name: pkg.name,
        amount: pkg.amount,
        currency: 'USD',
        bonusAmount: pkg.bonusAmount,
        isPopular: pkg.isPopular || false,
        isBestValue: pkg.isBestValue || false,
        sortOrder: pkg.sortOrder,
      },
    });
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================
  console.log('Creating payment methods...');
  await Promise.all([
    prisma.paymentMethod.upsert({
      where: { id: 'pm-card' },
      update: {},
      create: { id: 'pm-card', type: 'credit_card', name: 'Credit/Debit Card', iconUrl: '/payments/card.png', minAmount: 10, maxAmount: 10000, processingTime: 'Instant', sortOrder: 1 },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'pm-crypto' },
      update: {},
      create: { id: 'pm-crypto', type: 'crypto', name: 'Cryptocurrency', iconUrl: '/payments/crypto.png', minAmount: 10, maxAmount: 50000, processingTime: 'Instant', sortOrder: 2 },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'pm-bank' },
      update: {},
      create: { id: 'pm-bank', type: 'bank_transfer', name: 'Bank Transfer', iconUrl: '/payments/bank.png', minAmount: 50, maxAmount: 100000, processingTime: '1-3 business days', sortOrder: 3 },
    }),
  ]);

  // ============================================
  // PROMOTIONS
  // ============================================
  console.log('Creating promotions...');
  await Promise.all([
    prisma.promotion.upsert({
      where: { slug: 'welcome-bonus' },
      update: {},
      create: {
        name: 'Welcome Bonus',
        slug: 'welcome-bonus',
        description: 'Get a massive welcome bonus on your first deposit!',
        type: 'welcome',
        percentageBonus: 200,
        maxBonusUsdc: 500,
        minDepositUsdc: 10,
        wageringRequirement: 10,
        imageUrl: '/promotions/welcome.jpg',
        terms: 'New users only. 10x wagering requirement applies.',
        maxClaimsPerUser: 1,
      },
    }),
    prisma.promotion.upsert({
      where: { slug: 'daily-bonus' },
      update: {},
      create: {
        name: 'Daily Bonus',
        slug: 'daily-bonus',
        description: 'Claim free bonus every day!',
        type: 'daily',
        bonusCurrency: 'USD',
        bonusAmount: 1,
        bonusAmountUsdc: 1,
        imageUrl: '/promotions/daily.jpg',
        terms: 'Claim once per day. Must be logged in.',
      },
    }),
    prisma.promotion.upsert({
      where: { slug: 'weekly-bonus' },
      update: {},
      create: {
        name: 'Weekly Bonus',
        slug: 'weekly-bonus',
        description: 'Get a weekly bonus every Monday!',
        type: 'weekly',
        bonusCurrency: 'USD',
        bonusAmount: 10,
        bonusAmountUsdc: 10,
        imageUrl: '/promotions/weekly.jpg',
        terms: 'Claim once per week starting Monday.',
      },
    }),
    prisma.promotion.upsert({
      where: { slug: 'reload-bonus' },
      update: {},
      create: {
        name: 'Weekend Reload',
        slug: 'reload-bonus',
        description: '50% bonus on weekend deposits!',
        type: 'deposit',
        percentageBonus: 50,
        maxBonusUsdc: 250,
        minDepositUsdc: 20,
        wageringRequirement: 5,
        imageUrl: '/promotions/reload.jpg',
        terms: 'Valid on weekends only. 5x wagering requirement.',
      },
    }),
  ]);

  // ============================================
  // SPIN WHEEL SEGMENTS
  // ============================================
  console.log('Creating spin wheel segments...');
  const spinSegments = [
    { id: 'spin-1', label: '$1', amount: 1, amountUsdc: 1, probability: 0.25, color: '#FF6B6B', sortOrder: 1 },
    { id: 'spin-2', label: '$5', amount: 5, amountUsdc: 5, probability: 0.20, color: '#4ECDC4', sortOrder: 2 },
    { id: 'spin-3', label: '$10', amount: 10, amountUsdc: 10, probability: 0.20, color: '#FFE66D', sortOrder: 3 },
    { id: 'spin-4', label: '$25', amount: 25, amountUsdc: 25, probability: 0.15, color: '#95E1D3', sortOrder: 4 },
    { id: 'spin-5', label: '$50', amount: 50, amountUsdc: 50, probability: 0.10, color: '#F38181', sortOrder: 5 },
    { id: 'spin-6', label: '$100', amount: 100, amountUsdc: 100, probability: 0.05, color: '#AA96DA', sortOrder: 6 },
    { id: 'spin-7', label: '$250', amount: 250, amountUsdc: 250, probability: 0.04, color: '#FCBAD3', sortOrder: 7 },
    { id: 'spin-8', label: '$500', amount: 500, amountUsdc: 500, probability: 0.01, color: '#A8D8EA', sortOrder: 8 },
  ];

  for (const seg of spinSegments) {
    await prisma.spinWheelSegment.upsert({
      where: { id: seg.id },
      update: {},
      create: {
        id: seg.id,
        label: seg.label,
        currency: 'USD',
        amount: seg.amount,
        amountUsdc: seg.amountUsdc,
        probability: seg.probability,
        color: seg.color,
        sortOrder: seg.sortOrder,
      },
    });
  }

  // ============================================
  // LEADERBOARDS
  // ============================================
  console.log('Creating leaderboards...');
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  await prisma.leaderboard.upsert({
    where: { id: 'lb-weekly-wagered' },
    update: {},
    create: {
      id: 'lb-weekly-wagered',
      type: 'most_wagered',
      period: 'weekly',
      periodStart: startOfWeek,
      periodEnd: endOfWeek,
      prizePoolUsdc: 10000,
      status: 'active',
    },
  });

  await prisma.leaderboard.upsert({
    where: { id: 'lb-weekly-wins' },
    update: {},
    create: {
      id: 'lb-weekly-wins',
      type: 'biggest_win',
      period: 'weekly',
      periodStart: startOfWeek,
      periodEnd: endOfWeek,
      prizePoolUsdc: 5000,
      status: 'active',
    },
  });

  // ============================================
  // JACKPOTS
  // ============================================
  console.log('Creating jackpots...');
  await Promise.all([
    prisma.jackpot.upsert({
      where: { id: 'jp-grand' },
      update: {},
      create: {
        id: 'jp-grand',
        name: 'Grand Jackpot',
        type: 'grand',
        currentAmountUsdc: 1250000,
        seedAmountUsdc: 1000000,
        contributionPercent: 0.005,
        triggerMinUsdc: 900000,
        triggerMaxUsdc: 1500000,
      },
    }),
    prisma.jackpot.upsert({
      where: { id: 'jp-major' },
      update: {},
      create: {
        id: 'jp-major',
        name: 'Major Jackpot',
        type: 'major',
        currentAmountUsdc: 125000,
        seedAmountUsdc: 100000,
        contributionPercent: 0.01,
        triggerMinUsdc: 75000,
        triggerMaxUsdc: 150000,
      },
    }),
    prisma.jackpot.upsert({
      where: { id: 'jp-minor' },
      update: {},
      create: {
        id: 'jp-minor',
        name: 'Minor Jackpot',
        type: 'minor',
        currentAmountUsdc: 12500,
        seedAmountUsdc: 10000,
        contributionPercent: 0.02,
        triggerMinUsdc: 7500,
        triggerMaxUsdc: 15000,
      },
    }),
    prisma.jackpot.upsert({
      where: { id: 'jp-mini' },
      update: {},
      create: {
        id: 'jp-mini',
        name: 'Mini Jackpot',
        type: 'mini',
        currentAmountUsdc: 1250,
        seedAmountUsdc: 1000,
        contributionPercent: 0.03,
        triggerMinUsdc: 750,
        triggerMaxUsdc: 1500,
      },
    }),
  ]);

  // ============================================
  // TEST USER & ADMIN USER
  // ============================================
  console.log('Creating test user and admin...');
  const passwordHash = await bcrypt.hash('Test123!', 12);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash,
      firstName: 'Test',
      lastName: 'User',
      emailVerifiedAt: new Date(),
    },
  });

  // Create wallet for test user
  await prisma.wallet.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      usdBalance: 1000,
      usdcBalance: 500,
      btcBalance: 0.01,
      ethBalance: 0.5,
      primaryCurrency: 'USD',
    },
  });

  // Create VIP record for test user
  const bronzeTier = await prisma.vipTier.findUnique({ where: { slug: 'bronze' } });
  if (bronzeTier) {
    await prisma.userVip.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        tierId: bronzeTier.id,
        xpCurrent: BigInt(0),
        xpLifetime: BigInt(0),
      },
    });
  }

  // Create admin user
  await prisma.adminUser.upsert({
    where: { email: 'admin@wbc2026.com' },
    update: {},
    create: {
      email: 'admin@wbc2026.com',
      passwordHash: adminPasswordHash,
      name: 'Super Admin',
      role: 'super_admin',
      permissions: {
        all: true,
      },
    },
  });

  // ============================================
  // SITE SETTINGS
  // ============================================
  console.log('Creating site settings...');
  const settings = [
    { key: 'site_name', value: { name: 'NeonPlay Casino' } },
    { key: 'site_description', value: { description: 'The ultimate online casino experience' } },
    { key: 'support_email', value: { email: 'support@neonplay.com' } },
    { key: 'min_withdrawal', value: { usd: 20, usdc: 20, btc: 0.001, eth: 0.01 } },
    { key: 'max_withdrawal', value: { usd: 50000, usdc: 50000, btc: 5, eth: 50 } },
    { key: 'maintenance_mode', value: { enabled: false } },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  Player: test@example.com / Test123!');
  console.log('  Admin:  admin@wbc2026.com / Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
