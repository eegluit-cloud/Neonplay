import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // VIP TIERS
  // ============================================
  console.log('Creating VIP tiers...');
  const vipTiers = await Promise.all([
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
          dailyBonus: { gc: 1000, sc: 0.5 },
          weeklyBonus: { gc: 5000, sc: 2.5 },
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
          dailyBonus: { gc: 2000, sc: 1 },
          weeklyBonus: { gc: 10000, sc: 5 },
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
          dailyBonus: { gc: 5000, sc: 2.5 },
          weeklyBonus: { gc: 25000, sc: 12.5 },
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
          dailyBonus: { gc: 10000, sc: 5 },
          weeklyBonus: { gc: 50000, sc: 25 },
          monthlyBonus: { gc: 100000, sc: 50 },
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
        cashbackPercent: 25,
        redemptionBonusPercent: 15,
        benefits: {
          dailyBonus: { gc: 25000, sc: 12.5 },
          weeklyBonus: { gc: 100000, sc: 50 },
          monthlyBonus: { gc: 500000, sc: 250 },
          features: ['Ultimate Daily Bonus', 'Ultimate Weekly/Monthly Bonus', 'Personal VIP Host', '25% Cashback', 'Exclusive VIP Events', 'Instant Withdrawals', 'Custom Limits'],
        },
      },
    }),
  ]);

  const bronzeTier = vipTiers[0];

  // ============================================
  // MEDIA CATEGORIES
  // ============================================
  console.log('Creating media categories...');
  const mediaCategories = await Promise.all([
    prisma.mediaCategory.upsert({
      where: { slug: 'game-thumbnails' },
      update: {},
      create: {
        name: 'Game Thumbnails',
        slug: 'game-thumbnails',
        description: 'Thumbnail images for games',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 2 * 1024 * 1024, // 2MB
        dimensions: { minWidth: 280, minHeight: 280, aspectRatio: '1:1' },
        sortOrder: 1,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'provider-logos' },
      update: {},
      create: {
        name: 'Provider Logos',
        slug: 'provider-logos',
        description: 'Logos for game providers',
        allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
        maxFileSize: 1 * 1024 * 1024, // 1MB
        dimensions: { maxWidth: 400, maxHeight: 200 },
        sortOrder: 2,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'hero-banners' },
      update: {},
      create: {
        name: 'Hero Banners',
        slug: 'hero-banners',
        description: 'Hero section banner images',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        dimensions: { minWidth: 1920, minHeight: 600 },
        sortOrder: 3,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'vip-icons' },
      update: {},
      create: {
        name: 'VIP Icons',
        slug: 'vip-icons',
        description: 'VIP tier icons and badges',
        allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
        maxFileSize: 512 * 1024, // 512KB
        dimensions: { maxWidth: 256, maxHeight: 256 },
        sortOrder: 4,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'payment-icons' },
      update: {},
      create: {
        name: 'Payment Icons',
        slug: 'payment-icons',
        description: 'Payment method and crypto icons',
        allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
        maxFileSize: 256 * 1024, // 256KB
        dimensions: { maxWidth: 128, maxHeight: 128 },
        sortOrder: 5,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'team-logos' },
      update: {},
      create: {
        name: 'Team Logos',
        slug: 'team-logos',
        description: 'Sports team logos',
        allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
        maxFileSize: 1 * 1024 * 1024, // 1MB
        dimensions: { maxWidth: 256, maxHeight: 256 },
        sortOrder: 6,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'promotion-images' },
      update: {},
      create: {
        name: 'Promotion Images',
        slug: 'promotion-images',
        description: 'Images for promotions and bonuses',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 3 * 1024 * 1024, // 3MB
        dimensions: { minWidth: 600, minHeight: 400 },
        sortOrder: 7,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'prize-images' },
      update: {},
      create: {
        name: 'Prize Images',
        slug: 'prize-images',
        description: 'Images for prizes and rewards',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 2 * 1024 * 1024, // 2MB
        dimensions: { minWidth: 400, minHeight: 400 },
        sortOrder: 8,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'video-thumbnails' },
      update: {},
      create: {
        name: 'Video Thumbnails',
        slug: 'video-thumbnails',
        description: 'Thumbnail images for WBCTV videos',
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 2 * 1024 * 1024, // 2MB
        dimensions: { minWidth: 640, minHeight: 360, aspectRatio: '16:9' },
        sortOrder: 9,
      },
    }),
    prisma.mediaCategory.upsert({
      where: { slug: 'misc-icons' },
      update: {},
      create: {
        name: 'Miscellaneous Icons',
        slug: 'misc-icons',
        description: 'General purpose icons and images',
        allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
        maxFileSize: 512 * 1024, // 512KB
        sortOrder: 10,
      },
    }),
  ]);

  // Create a helper to get category ID by slug
  const getCategoryId = (slug: string): string => {
    const cat = mediaCategories.find((c: { slug: string; id: string }) => c.slug === slug);
    return cat?.id || mediaCategories[0].id;
  };

  // Base URL for placeholder assets (to be replaced with CDN URL in production)
  const ASSET_BASE_URL = process.env.S3_CDN_URL || '/assets';

  // Helper to create placeholder media assets
  const createPlaceholderAsset = async (
    key: string,
    categorySlug: string,
    title: string,
    filename: string,
  ) => {
    return prisma.mediaAsset.upsert({
      where: { key },
      update: {},
      create: {
        key,
        categoryId: getCategoryId(categorySlug),
        filename,
        mimeType: 'image/png',
        size: 0, // Placeholder - actual size will be set on upload
        url: `${ASSET_BASE_URL}/${categorySlug}/${filename}`,
        title,
        altText: title,
        metadata: { placeholder: true },
      },
    });
  };

  // ============================================
  // GAME CATEGORIES
  // ============================================
  console.log('Creating game categories...');
  const categories = await Promise.all([
    prisma.gameCategory.upsert({
      where: { slug: 'slots' },
      update: {},
      create: { name: 'Slots', slug: 'slots', icon: 'slot-machine', sortOrder: 1 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'crash' },
      update: {},
      create: { name: 'Crash', slug: 'crash', icon: 'rocket', sortOrder: 2 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'live-casino' },
      update: {},
      create: { name: 'Live Casino', slug: 'live-casino', icon: 'cards', sortOrder: 3 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'table-games' },
      update: {},
      create: { name: 'Table Games', slug: 'table-games', icon: 'table', sortOrder: 4 },
    }),
    prisma.gameCategory.upsert({
      where: { slug: 'instant-win' },
      update: {},
      create: { name: 'Instant Win', slug: 'instant-win', icon: 'lightning', sortOrder: 5 },
    }),
  ]);

  // ============================================
  // GAME PROVIDERS
  // ============================================
  console.log('Creating game providers...');
  const providersData = [
    { name: 'Pragmatic Play', slug: 'pragmatic-play', logoUrl: '/providers/pragmatic.png' },
    { name: 'NetEnt', slug: 'netent', logoUrl: '/providers/netent.png' },
    { name: 'Evolution Gaming', slug: 'evolution', logoUrl: '/providers/evolution.png' },
    { name: "Play'n GO", slug: 'play-n-go', logoUrl: '/providers/playngo.png' },
    { name: 'Microgaming', slug: 'microgaming', logoUrl: '/providers/microgaming.png' },
    { name: 'Hacksaw Gaming', slug: 'hacksaw', logoUrl: '/providers/hacksaw.png' },
    { name: 'Push Gaming', slug: 'push-gaming', logoUrl: '/providers/push.png' },
    { name: 'Relax Gaming', slug: 'relax-gaming', logoUrl: '/providers/relax.png' },
    { name: 'Nolimit City', slug: 'nolimit-city', logoUrl: '/providers/nolimit.png' },
    { name: 'Spribe', slug: 'spribe', logoUrl: '/providers/spribe.png' },
    { name: 'Red Tiger', slug: 'red-tiger', logoUrl: '/providers/red-tiger.png' },
    { name: 'Big Time Gaming', slug: 'btg', logoUrl: '/providers/btg.png' },
    { name: 'ELK Studios', slug: 'elk', logoUrl: '/providers/elk.png' },
    { name: 'Yggdrasil', slug: 'yggdrasil', logoUrl: '/providers/yggdrasil.png' },
    { name: 'Blueprint Gaming', slug: 'blueprint', logoUrl: '/providers/blueprint.png' },
    { name: 'Thunderkick', slug: 'thunderkick', logoUrl: '/providers/thunderkick.png' },
    { name: 'Quickspin', slug: 'quickspin', logoUrl: '/providers/quickspin.png' },
    { name: 'iSoftBet', slug: 'isoftbet', logoUrl: '/providers/isoftbet.png' },
    { name: 'Betsoft', slug: 'betsoft', logoUrl: '/providers/betsoft.png' },
    { name: 'Playtech', slug: 'playtech', logoUrl: '/providers/playtech.png' },
    { name: 'JILI', slug: 'jili', logoUrl: '/providers/jili.png' },
    { name: 'JDB', slug: 'jdb', logoUrl: '/providers/jdb.png' },
    { name: 'Platipus', slug: 'platipus', logoUrl: '/providers/platipus.png' },
    { name: 'Croco Gaming', slug: 'croco', logoUrl: '/providers/croco.png' },
    { name: 'NowNow Gaming', slug: 'nownow', logoUrl: '/providers/nownow.png' },
    { name: 'Amigo Gaming', slug: 'amigo', logoUrl: '/providers/amigo.png' },
    { name: 'InOut Gaming', slug: 'inout', logoUrl: '/providers/inout.png' },
    { name: '3 Oaks Gaming', slug: '3oaks', logoUrl: '/providers/3oaks.png' },
    { name: 'Moka Gaming', slug: 'moka', logoUrl: '/providers/moka.png' },
    { name: 'Wazdan', slug: 'wazdan', logoUrl: '/providers/wazdan.png' },
    { name: 'Booming Games', slug: 'booming', logoUrl: '/providers/booming.png' },
    { name: 'Gaming Corps', slug: 'gaming-corps', logoUrl: '/providers/gaming-corps.png' },
    { name: 'Spinomenal', slug: 'spinomenal', logoUrl: '/providers/spinomenal.png' },
    { name: 'Habanero', slug: 'habanero', logoUrl: '/providers/habanero.png' },
    { name: 'Endorphina', slug: 'endorphina', logoUrl: '/providers/endorphina.png' },
    { name: 'Felix Gaming', slug: 'felix', logoUrl: '/providers/felix.png' },
    { name: 'Evoplay', slug: 'evoplay', logoUrl: '/providers/evoplay.png' },
    { name: 'Amatic', slug: 'amatic', logoUrl: '/providers/amatic.png' },
    { name: 'Gamzix', slug: 'gamzix', logoUrl: '/providers/gamzix.png' },
    { name: 'BGaming', slug: 'bgaming', logoUrl: '/providers/bgaming.png' },
  ];

  const providers: any[] = [];
  for (let i = 0; i < providersData.length; i++) {
    const p = providersData[i];
    const provider = await prisma.gameProvider.upsert({
      where: { slug: p.slug },
      update: {},
      create: { name: p.name, slug: p.slug, logoUrl: p.logoUrl, sortOrder: i + 1 },
    });
    providers.push(provider);
  }

  // ============================================
  // GAMES (50+ Games)
  // ============================================
  console.log('Creating games...');
  const gamesData = [
    // Slots
    { name: 'Gates of Olympus', slug: 'gates-of-olympus', provider: 'pragmatic-play', category: 'slots', rtp: 96.5, volatility: 'high', isFeatured: true, isHot: true },
    { name: 'Sweet Bonanza', slug: 'sweet-bonanza', provider: 'pragmatic-play', category: 'slots', rtp: 96.48, volatility: 'high', isFeatured: true },
    { name: 'The Dog House', slug: 'the-dog-house', provider: 'pragmatic-play', category: 'slots', rtp: 96.51, volatility: 'high' },
    { name: 'Big Bass Bonanza', slug: 'big-bass-bonanza', provider: 'pragmatic-play', category: 'slots', rtp: 96.71, volatility: 'high', isNew: true },
    { name: 'Starlight Princess', slug: 'starlight-princess', provider: 'pragmatic-play', category: 'slots', rtp: 96.5, volatility: 'high', isHot: true },
    { name: 'Sugar Rush', slug: 'sugar-rush', provider: 'pragmatic-play', category: 'slots', rtp: 96.5, volatility: 'high' },
    { name: 'Starburst', slug: 'starburst', provider: 'netent', category: 'slots', rtp: 96.09, volatility: 'low', isFeatured: true },
    { name: 'Gonzo\'s Quest', slug: 'gonzos-quest', provider: 'netent', category: 'slots', rtp: 95.97, volatility: 'medium' },
    { name: 'Dead or Alive 2', slug: 'dead-or-alive-2', provider: 'netent', category: 'slots', rtp: 96.82, volatility: 'high', isHot: true },
    { name: 'Divine Fortune', slug: 'divine-fortune', provider: 'netent', category: 'slots', rtp: 96.59, volatility: 'medium' },
    { name: 'Book of Dead', slug: 'book-of-dead', provider: 'play-n-go', category: 'slots', rtp: 96.21, volatility: 'high', isFeatured: true },
    { name: 'Reactoonz', slug: 'reactoonz', provider: 'play-n-go', category: 'slots', rtp: 96.51, volatility: 'high' },
    { name: 'Fire Joker', slug: 'fire-joker', provider: 'play-n-go', category: 'slots', rtp: 96.15, volatility: 'high' },
    { name: 'Moon Princess', slug: 'moon-princess', provider: 'play-n-go', category: 'slots', rtp: 96.5, volatility: 'high' },
    { name: 'Immortal Romance', slug: 'immortal-romance', provider: 'microgaming', category: 'slots', rtp: 96.86, volatility: 'medium' },
    { name: 'Mega Moolah', slug: 'mega-moolah', provider: 'microgaming', category: 'slots', rtp: 88.12, volatility: 'medium', isFeatured: true },
    { name: 'Thunderstruck II', slug: 'thunderstruck-ii', provider: 'microgaming', category: 'slots', rtp: 96.65, volatility: 'medium' },
    { name: 'Wanted Dead or Wild', slug: 'wanted-dead-or-wild', provider: 'hacksaw', category: 'slots', rtp: 96.38, volatility: 'high', isNew: true, isHot: true },
    { name: 'Chaos Crew', slug: 'chaos-crew', provider: 'hacksaw', category: 'slots', rtp: 96.29, volatility: 'high' },
    { name: 'Razor Shark', slug: 'razor-shark', provider: 'push-gaming', category: 'slots', rtp: 96.7, volatility: 'high' },
    { name: 'Jammin\' Jars', slug: 'jammin-jars', provider: 'push-gaming', category: 'slots', rtp: 96.83, volatility: 'high' },
    { name: 'Money Train 2', slug: 'money-train-2', provider: 'relax-gaming', category: 'slots', rtp: 96.4, volatility: 'high', isFeatured: true },
    { name: 'Money Train 3', slug: 'money-train-3', provider: 'relax-gaming', category: 'slots', rtp: 96.1, volatility: 'high', isNew: true },
    { name: 'San Quentin', slug: 'san-quentin', provider: 'nolimit-city', category: 'slots', rtp: 96.03, volatility: 'high' },
    { name: 'Mental', slug: 'mental', provider: 'nolimit-city', category: 'slots', rtp: 96.08, volatility: 'high', isHot: true },
    { name: 'Tombstone', slug: 'tombstone', provider: 'nolimit-city', category: 'slots', rtp: 96.08, volatility: 'high' },
    // Crash Games
    { name: 'Aviator', slug: 'aviator', provider: 'spribe', category: 'crash', rtp: 97, volatility: 'high', isFeatured: true, isHot: true },
    { name: 'Spaceman', slug: 'spaceman', provider: 'pragmatic-play', category: 'crash', rtp: 96.5, volatility: 'high' },
    { name: 'Plinko', slug: 'plinko', provider: 'spribe', category: 'crash', rtp: 97, volatility: 'medium', isNew: true },
    { name: 'Mines', slug: 'mines', provider: 'spribe', category: 'crash', rtp: 97, volatility: 'high' },
    { name: 'Dice', slug: 'dice', provider: 'spribe', category: 'crash', rtp: 97, volatility: 'medium' },
    { name: 'Goal', slug: 'goal', provider: 'spribe', category: 'crash', rtp: 97, volatility: 'medium' },
    // Live Casino
    { name: 'Lightning Roulette', slug: 'lightning-roulette', provider: 'evolution', category: 'live-casino', rtp: 97.3, volatility: 'medium', isFeatured: true },
    { name: 'Crazy Time', slug: 'crazy-time', provider: 'evolution', category: 'live-casino', rtp: 96.08, volatility: 'high', isHot: true },
    { name: 'Blackjack VIP', slug: 'blackjack-vip', provider: 'evolution', category: 'live-casino', rtp: 99.28, volatility: 'low' },
    { name: 'Speed Baccarat', slug: 'speed-baccarat', provider: 'evolution', category: 'live-casino', rtp: 98.94, volatility: 'low' },
    { name: 'Dream Catcher', slug: 'dream-catcher', provider: 'evolution', category: 'live-casino', rtp: 96.58, volatility: 'medium' },
    { name: 'Monopoly Live', slug: 'monopoly-live', provider: 'evolution', category: 'live-casino', rtp: 96.23, volatility: 'medium', isFeatured: true },
    { name: 'Deal or No Deal', slug: 'deal-or-no-deal', provider: 'evolution', category: 'live-casino', rtp: 95.42, volatility: 'medium' },
    { name: 'Lightning Blackjack', slug: 'lightning-blackjack', provider: 'evolution', category: 'live-casino', rtp: 99.56, volatility: 'low', isNew: true },
    // Table Games
    { name: 'European Roulette', slug: 'european-roulette', provider: 'netent', category: 'table-games', rtp: 97.3, volatility: 'low' },
    { name: 'Blackjack Classic', slug: 'blackjack-classic', provider: 'netent', category: 'table-games', rtp: 99.5, volatility: 'low' },
    { name: 'Baccarat Pro', slug: 'baccarat-pro', provider: 'netent', category: 'table-games', rtp: 98.94, volatility: 'low' },
    { name: 'Texas Hold\'em', slug: 'texas-holdem', provider: 'netent', category: 'table-games', rtp: 97.84, volatility: 'medium' },
    { name: 'Caribbean Stud', slug: 'caribbean-stud', provider: 'netent', category: 'table-games', rtp: 94.78, volatility: 'medium' },
    // Instant Win
    { name: 'Scratch Cards Deluxe', slug: 'scratch-cards-deluxe', provider: 'microgaming', category: 'instant-win', rtp: 95, volatility: 'low' },
    { name: 'Keno', slug: 'keno', provider: 'spribe', category: 'instant-win', rtp: 96, volatility: 'medium' },
    { name: 'Hi-Lo', slug: 'hi-lo', provider: 'spribe', category: 'instant-win', rtp: 97, volatility: 'low' },
    { name: 'Wheel of Fortune', slug: 'wheel-of-fortune', provider: 'microgaming', category: 'instant-win', rtp: 95.5, volatility: 'medium', isNew: true },
    { name: 'Lucky Numbers', slug: 'lucky-numbers', provider: 'microgaming', category: 'instant-win', rtp: 94, volatility: 'medium' },
  ];

  for (const game of gamesData) {
    const provider = providers.find(p => p.slug === game.provider);
    const category = categories.find(c => c.slug === game.category);

    if (provider && category) {
      await prisma.game.upsert({
        where: { slug: game.slug },
        update: {},
        create: {
          name: game.name,
          slug: game.slug,
          providerId: provider.id,
          categoryId: category.id,
          thumbnailUrl: `/games/${game.slug}.jpg`,
          rtp: game.rtp,
          volatility: game.volatility,
          minBet: 0.1,
          maxBet: 1000,
          isFeatured: game.isFeatured || false,
          isNew: game.isNew || false,
          isHot: game.isHot || false,
          features: { freeSpins: true, multipliers: true },
        },
      });
    }
  }

  // ============================================
  // COIN PACKAGES
  // ============================================
  console.log('Creating coin packages...');
  await Promise.all([
    prisma.coinPackage.upsert({
      where: { id: 'pkg-starter' },
      update: {},
      create: { id: 'pkg-starter', name: 'Starter Pack', gcAmount: 10000, scBonusAmount: 2, priceUsd: 4.99, sortOrder: 1 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-basic' },
      update: {},
      create: { id: 'pkg-basic', name: 'Basic Pack', gcAmount: 25000, scBonusAmount: 5, priceUsd: 9.99, sortOrder: 2 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-value' },
      update: {},
      create: { id: 'pkg-value', name: 'Value Pack', gcAmount: 75000, scBonusAmount: 15, priceUsd: 24.99, isPopular: true, sortOrder: 3 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-premium' },
      update: {},
      create: { id: 'pkg-premium', name: 'Premium Pack', gcAmount: 200000, scBonusAmount: 50, priceUsd: 49.99, sortOrder: 4 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-gold' },
      update: {},
      create: { id: 'pkg-gold', name: 'Gold Pack', gcAmount: 500000, scBonusAmount: 150, priceUsd: 99.99, discountPercent: 10, isBestValue: true, sortOrder: 5 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-platinum' },
      update: {},
      create: { id: 'pkg-platinum', name: 'Platinum Pack', gcAmount: 1200000, scBonusAmount: 400, priceUsd: 199.99, discountPercent: 15, sortOrder: 6 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-diamond' },
      update: {},
      create: { id: 'pkg-diamond', name: 'Diamond Pack', gcAmount: 3000000, scBonusAmount: 1000, priceUsd: 499.99, discountPercent: 20, sortOrder: 7 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-elite' },
      update: {},
      create: { id: 'pkg-elite', name: 'Elite Pack', gcAmount: 7500000, scBonusAmount: 2500, priceUsd: 999.99, discountPercent: 25, sortOrder: 8 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-vip' },
      update: {},
      create: { id: 'pkg-vip', name: 'VIP Pack', gcAmount: 20000000, scBonusAmount: 7500, priceUsd: 1999.99, discountPercent: 30, sortOrder: 9 },
    }),
    prisma.coinPackage.upsert({
      where: { id: 'pkg-ultimate' },
      update: {},
      create: { id: 'pkg-ultimate', name: 'Ultimate Pack', gcAmount: 50000000, scBonusAmount: 20000, priceUsd: 4999.99, discountPercent: 35, sortOrder: 10 },
    }),
  ]);

  // ============================================
  // PAYMENT METHODS
  // ============================================
  console.log('Creating payment methods...');
  await Promise.all([
    prisma.paymentMethod.upsert({
      where: { id: 'pm-card' },
      update: {},
      create: { id: 'pm-card', type: 'credit_card', name: 'Credit/Debit Card', iconUrl: '/payments/card.png', minAmount: 4.99, maxAmount: 10000, processingTime: 'Instant', sortOrder: 1 },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'pm-apple' },
      update: {},
      create: { id: 'pm-apple', type: 'apple_pay', name: 'Apple Pay', iconUrl: '/payments/apple-pay.png', minAmount: 4.99, maxAmount: 5000, processingTime: 'Instant', sortOrder: 2 },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'pm-google' },
      update: {},
      create: { id: 'pm-google', type: 'google_pay', name: 'Google Pay', iconUrl: '/payments/google-pay.png', minAmount: 4.99, maxAmount: 5000, processingTime: 'Instant', sortOrder: 3 },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'pm-crypto' },
      update: {},
      create: { id: 'pm-crypto', type: 'crypto', name: 'Cryptocurrency', iconUrl: '/payments/crypto.png', minAmount: 9.99, maxAmount: 50000, processingTime: '10-30 minutes', sortOrder: 4 },
    }),
  ]);

  // ============================================
  // CRYPTO OPTIONS
  // ============================================
  console.log('Creating crypto options...');
  await Promise.all([
    prisma.cryptoPaymentOption.upsert({
      where: { id: 'crypto-btc' },
      update: {},
      create: { id: 'crypto-btc', currency: 'BTC', name: 'Bitcoin', iconUrl: '/crypto/btc.png', networks: [{ network: 'Bitcoin', address: 'bc1q...' }], minAmount: 0.0001, confirmationsRequired: 2 },
    }),
    prisma.cryptoPaymentOption.upsert({
      where: { id: 'crypto-eth' },
      update: {},
      create: { id: 'crypto-eth', currency: 'ETH', name: 'Ethereum', iconUrl: '/crypto/eth.png', networks: [{ network: 'ERC-20', address: '0x...' }], minAmount: 0.01, confirmationsRequired: 12 },
    }),
    prisma.cryptoPaymentOption.upsert({
      where: { id: 'crypto-usdt' },
      update: {},
      create: { id: 'crypto-usdt', currency: 'USDT', name: 'Tether', iconUrl: '/crypto/usdt.png', networks: [{ network: 'ERC-20', address: '0x...' }, { network: 'TRC-20', address: 'T...' }], minAmount: 10, confirmationsRequired: 12 },
    }),
    prisma.cryptoPaymentOption.upsert({
      where: { id: 'crypto-sol' },
      update: {},
      create: { id: 'crypto-sol', currency: 'SOL', name: 'Solana', iconUrl: '/crypto/sol.png', networks: [{ network: 'Solana', address: '...' }], minAmount: 0.1, confirmationsRequired: 32 },
    }),
    prisma.cryptoPaymentOption.upsert({
      where: { id: 'crypto-doge' },
      update: {},
      create: { id: 'crypto-doge', currency: 'DOGE', name: 'Dogecoin', iconUrl: '/crypto/doge.png', networks: [{ network: 'Dogecoin', address: 'D...' }], minAmount: 50, confirmationsRequired: 6 },
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
        description: 'Get a massive welcome bonus on your first purchase!',
        type: 'welcome',
        percentageBonus: 200,
        maxBonus: 500,
        minDeposit: 9.99,
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
        description: 'Claim free coins every day!',
        type: 'daily',
        gcAmount: 1000,
        scAmount: 0.5,
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
        gcAmount: 10000,
        scAmount: 5,
        imageUrl: '/promotions/weekly.jpg',
        terms: 'Claim once per week starting Monday.',
      },
    }),
    prisma.promotion.upsert({
      where: { slug: 'monthly-bonus' },
      update: {},
      create: {
        name: 'Monthly Bonus',
        slug: 'monthly-bonus',
        description: 'Massive monthly bonus for loyal players!',
        type: 'monthly',
        gcAmount: 50000,
        scAmount: 25,
        imageUrl: '/promotions/monthly.jpg',
        terms: 'Claim once per month on the 1st.',
      },
    }),
    prisma.promotion.upsert({
      where: { slug: 'reload-bonus' },
      update: {},
      create: {
        name: 'Weekend Reload',
        slug: 'reload-bonus',
        description: '50% bonus on weekend purchases!',
        type: 'deposit',
        percentageBonus: 50,
        maxBonus: 250,
        minDeposit: 19.99,
        imageUrl: '/promotions/reload.jpg',
        terms: 'Valid on weekends only. 5x wagering requirement.',
      },
    }),
  ]);

  // ============================================
  // SPIN WHEEL SEGMENTS
  // ============================================
  console.log('Creating spin wheel segments...');
  await Promise.all([
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-1' },
      update: {},
      create: { id: 'spin-1', label: '100 GC', gcAmount: 100, scAmount: 0, probability: 0.25, color: '#FF6B6B', sortOrder: 1 },
    }),
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-2' },
      update: {},
      create: { id: 'spin-2', label: '500 GC', gcAmount: 500, scAmount: 0, probability: 0.2, color: '#4ECDC4', sortOrder: 2 },
    }),
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-3' },
      update: {},
      create: { id: 'spin-3', label: '0.25 SC', gcAmount: 0, scAmount: 0.25, probability: 0.2, color: '#FFE66D', sortOrder: 3 },
    }),
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-4' },
      update: {},
      create: { id: 'spin-4', label: '1000 GC', gcAmount: 1000, scAmount: 0, probability: 0.15, color: '#95E1D3', sortOrder: 4 },
    }),
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-5' },
      update: {},
      create: { id: 'spin-5', label: '0.5 SC', gcAmount: 0, scAmount: 0.5, probability: 0.1, color: '#F38181', sortOrder: 5 },
    }),
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-6' },
      update: {},
      create: { id: 'spin-6', label: '5000 GC', gcAmount: 5000, scAmount: 0, probability: 0.05, color: '#AA96DA', sortOrder: 6 },
    }),
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-7' },
      update: {},
      create: { id: 'spin-7', label: '2.5 SC', gcAmount: 0, scAmount: 2.5, probability: 0.04, color: '#FCBAD3', sortOrder: 7 },
    }),
    prisma.spinWheelSegment.upsert({
      where: { id: 'spin-8' },
      update: {},
      create: { id: 'spin-8', label: '25000 GC', gcAmount: 25000, scAmount: 0, probability: 0.01, color: '#A8D8EA', sortOrder: 8 },
    }),
  ]);

  // ============================================
  // JACKPOTS
  // ============================================
  console.log('Creating jackpots...');
  await Promise.all([
    prisma.jackpot.upsert({
      where: { id: 'jackpot-mini' },
      update: {},
      create: { id: 'jackpot-mini', name: 'Mini Jackpot', type: 'mini', currentAmount: 125.5, seedAmount: 50, contributionPercent: 0.005, triggerMin: 100, triggerMax: 500 },
    }),
    prisma.jackpot.upsert({
      where: { id: 'jackpot-minor' },
      update: {},
      create: { id: 'jackpot-minor', name: 'Minor Jackpot', type: 'minor', currentAmount: 2500, seedAmount: 500, contributionPercent: 0.01, triggerMin: 1000, triggerMax: 5000 },
    }),
    prisma.jackpot.upsert({
      where: { id: 'jackpot-major' },
      update: {},
      create: { id: 'jackpot-major', name: 'Major Jackpot', type: 'major', currentAmount: 15000, seedAmount: 5000, contributionPercent: 0.015, triggerMin: 10000, triggerMax: 50000 },
    }),
    prisma.jackpot.upsert({
      where: { id: 'jackpot-grand' },
      update: {},
      create: { id: 'jackpot-grand', name: 'Grand Jackpot', type: 'grand', currentAmount: 125000, seedAmount: 50000, contributionPercent: 0.02, triggerMin: 100000, triggerMax: 500000 },
    }),
  ]);

  // ============================================
  // SPORTS & LEAGUES
  // ============================================
  console.log('Creating sports data...');
  const sports = await Promise.all([
    prisma.sport.upsert({ where: { slug: 'football' }, update: {}, create: { name: 'Football', slug: 'football', iconKey: 'football', sortOrder: 1 } }),
    prisma.sport.upsert({ where: { slug: 'basketball' }, update: {}, create: { name: 'Basketball', slug: 'basketball', iconKey: 'basketball', sortOrder: 2 } }),
    prisma.sport.upsert({ where: { slug: 'tennis' }, update: {}, create: { name: 'Tennis', slug: 'tennis', iconKey: 'tennis', sortOrder: 3 } }),
    prisma.sport.upsert({ where: { slug: 'soccer' }, update: {}, create: { name: 'Soccer', slug: 'soccer', iconKey: 'soccer', sortOrder: 4 } }),
    prisma.sport.upsert({ where: { slug: 'esports' }, update: {}, create: { name: 'Esports', slug: 'esports', iconKey: 'gamepad', sortOrder: 5 } }),
  ]);

  // Create leagues for each sport
  const leaguesData = [
    { name: 'NFL', slug: 'nfl', sport: 'football', country: 'USA', countryFlag: '🇺🇸' },
    { name: 'College Football', slug: 'ncaaf', sport: 'football', country: 'USA', countryFlag: '🇺🇸' },
    { name: 'NBA', slug: 'nba', sport: 'basketball', country: 'USA', countryFlag: '🇺🇸' },
    { name: 'EuroLeague', slug: 'euroleague', sport: 'basketball', country: 'Europe', countryFlag: '🇪🇺' },
    { name: 'ATP Tour', slug: 'atp', sport: 'tennis', country: 'World', countryFlag: '🌍' },
    { name: 'WTA Tour', slug: 'wta', sport: 'tennis', country: 'World', countryFlag: '🌍' },
    { name: 'Premier League', slug: 'premier-league', sport: 'soccer', country: 'England', countryFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'La Liga', slug: 'la-liga', sport: 'soccer', country: 'Spain', countryFlag: '🇪🇸' },
    { name: 'Champions League', slug: 'champions-league', sport: 'soccer', country: 'Europe', countryFlag: '🇪🇺' },
    { name: 'MLS', slug: 'mls', sport: 'soccer', country: 'USA', countryFlag: '🇺🇸' },
    { name: 'CS2 Major', slug: 'cs2-major', sport: 'esports', country: 'World', countryFlag: '🎮' },
    { name: 'League of Legends Worlds', slug: 'lol-worlds', sport: 'esports', country: 'World', countryFlag: '🎮' },
  ];

  const createdLeagues: any[] = [];
  for (const league of leaguesData) {
    const sport = sports.find(s => s.slug === league.sport);
    if (sport) {
      const createdLeague = await prisma.league.upsert({
        where: { slug: league.slug },
        update: {},
        create: {
          name: league.name,
          slug: league.slug,
          sportId: sport.id,
          country: league.country,
          countryFlag: league.countryFlag,
        },
      });
      createdLeagues.push({ ...createdLeague, sportSlug: league.sport });
    }
  }

  // ============================================
  // SPORTS TEAMS
  // ============================================
  console.log('Creating sports teams...');
  const teamsData = [
    // NFL Teams
    { name: 'Kansas City Chiefs', slug: 'kc-chiefs', leagueSlug: 'nfl', logoUrl: '/teams/chiefs.png', abbreviation: 'KC' },
    { name: 'San Francisco 49ers', slug: 'sf-49ers', leagueSlug: 'nfl', logoUrl: '/teams/49ers.png', abbreviation: 'SF' },
    { name: 'Philadelphia Eagles', slug: 'phi-eagles', leagueSlug: 'nfl', logoUrl: '/teams/eagles.png', abbreviation: 'PHI' },
    { name: 'Dallas Cowboys', slug: 'dal-cowboys', leagueSlug: 'nfl', logoUrl: '/teams/cowboys.png', abbreviation: 'DAL' },
    { name: 'Buffalo Bills', slug: 'buf-bills', leagueSlug: 'nfl', logoUrl: '/teams/bills.png', abbreviation: 'BUF' },
    { name: 'Miami Dolphins', slug: 'mia-dolphins', leagueSlug: 'nfl', logoUrl: '/teams/dolphins.png', abbreviation: 'MIA' },
    // NBA Teams
    { name: 'Los Angeles Lakers', slug: 'la-lakers', leagueSlug: 'nba', logoUrl: '/teams/lakers.png', abbreviation: 'LAL' },
    { name: 'Boston Celtics', slug: 'bos-celtics', leagueSlug: 'nba', logoUrl: '/teams/celtics.png', abbreviation: 'BOS' },
    { name: 'Golden State Warriors', slug: 'gs-warriors', leagueSlug: 'nba', logoUrl: '/teams/warriors.png', abbreviation: 'GSW' },
    { name: 'Milwaukee Bucks', slug: 'mil-bucks', leagueSlug: 'nba', logoUrl: '/teams/bucks.png', abbreviation: 'MIL' },
    // Premier League Teams
    { name: 'Manchester City', slug: 'man-city', leagueSlug: 'premier-league', logoUrl: '/teams/mancity.png', abbreviation: 'MCI' },
    { name: 'Arsenal', slug: 'arsenal', leagueSlug: 'premier-league', logoUrl: '/teams/arsenal.png', abbreviation: 'ARS' },
    { name: 'Liverpool', slug: 'liverpool', leagueSlug: 'premier-league', logoUrl: '/teams/liverpool.png', abbreviation: 'LIV' },
    { name: 'Chelsea', slug: 'chelsea', leagueSlug: 'premier-league', logoUrl: '/teams/chelsea.png', abbreviation: 'CHE' },
    // La Liga Teams
    { name: 'Real Madrid', slug: 'real-madrid', leagueSlug: 'la-liga', logoUrl: '/teams/realmadrid.png', abbreviation: 'RMA' },
    { name: 'Barcelona', slug: 'barcelona', leagueSlug: 'la-liga', logoUrl: '/teams/barcelona.png', abbreviation: 'BAR' },
    { name: 'Atletico Madrid', slug: 'atletico-madrid', leagueSlug: 'la-liga', logoUrl: '/teams/atletico.png', abbreviation: 'ATM' },
  ];

  const createdTeams: any[] = [];
  for (const team of teamsData) {
    const league = createdLeagues.find(l => l.slug === team.leagueSlug);
    const sport = sports.find(s => s.slug === league?.sportSlug);
    if (sport) {
      const createdTeam = await prisma.team.upsert({
        where: { slug: team.slug },
        update: {},
        create: {
          name: team.name,
          slug: team.slug,
          sportId: sport.id,
          logoUrl: team.logoUrl,
          shortName: team.abbreviation,
        },
      });
      createdTeams.push({ ...createdTeam, leagueSlug: team.leagueSlug });
    }
  }

  // ============================================
  // SPORTS MATCHES
  // ============================================
  console.log('Creating sports matches...');
  const now = new Date();
  const matchesData = [
    // Live matches
    { homeTeamSlug: 'kc-chiefs', awayTeamSlug: 'sf-49ers', leagueSlug: 'nfl', startTime: new Date(now.getTime() - 30 * 60000), status: 'live', homeScore: 21, awayScore: 17 },
    { homeTeamSlug: 'la-lakers', awayTeamSlug: 'bos-celtics', leagueSlug: 'nba', startTime: new Date(now.getTime() - 45 * 60000), status: 'live', homeScore: 78, awayScore: 82 },
    // Upcoming matches
    { homeTeamSlug: 'phi-eagles', awayTeamSlug: 'dal-cowboys', leagueSlug: 'nfl', startTime: new Date(now.getTime() + 2 * 3600000), status: 'scheduled' },
    { homeTeamSlug: 'gs-warriors', awayTeamSlug: 'mil-bucks', leagueSlug: 'nba', startTime: new Date(now.getTime() + 4 * 3600000), status: 'scheduled' },
    { homeTeamSlug: 'man-city', awayTeamSlug: 'arsenal', leagueSlug: 'premier-league', startTime: new Date(now.getTime() + 24 * 3600000), status: 'scheduled' },
    { homeTeamSlug: 'real-madrid', awayTeamSlug: 'barcelona', leagueSlug: 'la-liga', startTime: new Date(now.getTime() + 48 * 3600000), status: 'scheduled' },
    { homeTeamSlug: 'liverpool', awayTeamSlug: 'chelsea', leagueSlug: 'premier-league', startTime: new Date(now.getTime() + 72 * 3600000), status: 'scheduled' },
    { homeTeamSlug: 'buf-bills', awayTeamSlug: 'mia-dolphins', leagueSlug: 'nfl', startTime: new Date(now.getTime() + 96 * 3600000), status: 'scheduled' },
  ];

  for (const match of matchesData) {
    const homeTeam = createdTeams.find(t => t.slug === match.homeTeamSlug);
    const awayTeam = createdTeams.find(t => t.slug === match.awayTeamSlug);
    const league = createdLeagues.find(l => l.slug === match.leagueSlug);
    const sport = sports.find(s => s.slug === league?.sportSlug);

    if (homeTeam && awayTeam && league && sport) {
      const createdMatch = await prisma.match.create({
        data: {
          sportId: sport.id,
          leagueId: league.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          scheduledAt: match.startTime,
          status: match.status,
          homeScore: match.homeScore || null,
          awayScore: match.awayScore || null,
        },
      });

      // Create basic markets for each match
      await prisma.market.create({
        data: {
          matchId: createdMatch.id,
          name: 'Match Winner',
          type: 'moneyline',
          odds: {
            create: [
              { selection: homeTeam.name, value: 1.8 + Math.random() * 0.5, isActive: true },
              { selection: awayTeam.name, value: 1.8 + Math.random() * 0.5, isActive: true },
            ],
          },
        },
      });
    }
  }

  // ============================================
  // LEADERBOARDS
  // ============================================
  console.log('Creating leaderboards...');
  const leaderboardTypes = ['biggest_win', 'most_wagered', 'most_played'];
  const leaderboardPeriods = ['daily', 'weekly', 'monthly'];

  for (const type of leaderboardTypes) {
    for (const period of leaderboardPeriods) {
      const periodStart = new Date();
      let periodEnd = new Date();

      if (period === 'daily') {
        periodStart.setHours(0, 0, 0, 0);
        periodEnd.setHours(23, 59, 59, 999);
      } else if (period === 'weekly') {
        const dayOfWeek = periodStart.getDay();
        periodStart.setDate(periodStart.getDate() - dayOfWeek);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999);
      } else {
        periodStart.setDate(1);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      // Use create with a unique ID based on type and period
      const leaderboardId = `lb-${type}-${period}`;
      await prisma.leaderboard.upsert({
        where: { id: leaderboardId },
        update: {},
        create: {
          id: leaderboardId,
          type,
          period,
          periodStart,
          periodEnd,
          status: 'active',
          prizePool: period === 'daily' ? 1000 : period === 'weekly' ? 10000 : 50000,
        },
      });
    }
  }

  // Create prize tiers for leaderboards
  console.log('Creating prize tiers...');

  // First, create a default prize for prize tiers
  const defaultPrize = await prisma.prize.upsert({
    where: { id: 'prize-leaderboard-default' },
    update: {},
    create: {
      id: 'prize-leaderboard-default',
      name: 'Leaderboard Cash Prize',
      description: 'SC prize for leaderboard placement',
      valueUsd: 0,
      category: 'bonus_credits',
      prizeType: 'leaderboard',
    },
  });

  const prizeTiersData = [
    // Daily prizes
    { period: 'daily', position: 1, scAmount: 5 },
    { period: 'daily', position: 2, scAmount: 3 },
    { period: 'daily', position: 3, scAmount: 2 },
    { period: 'daily', position: 4, scAmount: 1 },
    { period: 'daily', position: 5, scAmount: 0.5 },
    // Weekly prizes
    { period: 'weekly', position: 1, scAmount: 50 },
    { period: 'weekly', position: 2, scAmount: 25 },
    { period: 'weekly', position: 3, scAmount: 15 },
    { period: 'weekly', position: 4, scAmount: 10 },
    { period: 'weekly', position: 5, scAmount: 5 },
    { period: 'weekly', position: 6, scAmount: 2.5 },
    { period: 'weekly', position: 7, scAmount: 2 },
    { period: 'weekly', position: 8, scAmount: 1.5 },
    { period: 'weekly', position: 9, scAmount: 1 },
    { period: 'weekly', position: 10, scAmount: 0.5 },
    // Monthly prizes
    { period: 'monthly', position: 1, scAmount: 250 },
    { period: 'monthly', position: 2, scAmount: 100 },
    { period: 'monthly', position: 3, scAmount: 50 },
    { period: 'monthly', position: 4, scAmount: 25 },
    { period: 'monthly', position: 5, scAmount: 15 },
    { period: 'monthly', position: 6, scAmount: 10 },
    { period: 'monthly', position: 7, scAmount: 7.5 },
    { period: 'monthly', position: 8, scAmount: 5 },
    { period: 'monthly', position: 9, scAmount: 2.5 },
    { period: 'monthly', position: 10, scAmount: 1 },
  ];

  for (const tier of prizeTiersData) {
    const tierId = `prize-tier-${tier.period}-${tier.position}`;
    await prisma.prizeTier.upsert({
      where: { id: tierId },
      update: {},
      create: {
        id: tierId,
        leaderboardType: tier.period,
        position: tier.position,
        prizeId: defaultPrize.id,
        scAmount: tier.scAmount,
      },
    });
  }

  // ============================================
  // FAQ CATEGORIES & FAQS
  // ============================================
  console.log('Creating FAQs...');
  const faqCategories = await Promise.all([
    prisma.faqCategory.upsert({ where: { slug: 'getting-started' }, update: {}, create: { name: 'Getting Started', slug: 'getting-started', icon: 'rocket', sortOrder: 1 } }),
    prisma.faqCategory.upsert({ where: { slug: 'account' }, update: {}, create: { name: 'Account', slug: 'account', icon: 'user', sortOrder: 2 } }),
    prisma.faqCategory.upsert({ where: { slug: 'coins-currency' }, update: {}, create: { name: 'Coins & Currency', slug: 'coins-currency', icon: 'coins', sortOrder: 3 } }),
    prisma.faqCategory.upsert({ where: { slug: 'games' }, update: {}, create: { name: 'Games', slug: 'games', icon: 'gamepad', sortOrder: 4 } }),
    prisma.faqCategory.upsert({ where: { slug: 'redemption' }, update: {}, create: { name: 'Redemption', slug: 'redemption', icon: 'gift', sortOrder: 5 } }),
  ]);

  const faqsData = [
    { category: 'getting-started', question: 'What is WBC 2026?', answer: 'WBC 2026 is a social casino platform where you can play exciting games using virtual currency (Gold Coins) and participate in sweepstakes using Sweepstake Coins.', isFeatured: true },
    { category: 'getting-started', question: 'How do I create an account?', answer: 'Click the "Sign Up" button, enter your email and create a password. You can also sign up using Google, Facebook, or Apple.', isFeatured: true },
    { category: 'getting-started', question: 'Is WBC 2026 legal?', answer: 'Yes! WBC 2026 operates as a sweepstakes platform which is legal in most US states. We comply with all applicable laws and regulations.' },
    { category: 'coins-currency', question: 'What are Gold Coins (GC)?', answer: 'Gold Coins are our virtual currency used for playing games. They have no cash value and cannot be redeemed. You can purchase GC packages or earn them through bonuses.', isFeatured: true },
    { category: 'coins-currency', question: 'What are Sweepstake Coins (SC)?', answer: 'Sweepstake Coins are awarded as bonuses with GC purchases and can be used to play games. SC winnings can be redeemed for real prizes!' },
    { category: 'coins-currency', question: 'How do I get free coins?', answer: 'You can get free coins through: Daily bonuses, Weekly bonuses, Monthly bonuses, Referral program, Promotional codes, and AMOE (Alternative Method of Entry).' },
    { category: 'account', question: 'How do I verify my account?', answer: 'To verify your account, go to Settings > Verification. You will need to provide a valid ID document and complete identity verification.' },
    { category: 'account', question: 'I forgot my password', answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to reset your password.' },
    { category: 'games', question: 'Are the games fair?', answer: 'All our games use certified Random Number Generators (RNG) and are regularly audited by independent testing agencies to ensure fairness.' },
    { category: 'games', question: 'What is RTP?', answer: 'RTP (Return to Player) is the theoretical percentage of wagered money a game returns to players over time. For example, a 96% RTP means the game returns $96 for every $100 wagered on average.' },
    { category: 'redemption', question: 'How do I redeem my SC?', answer: 'Go to your Wallet, click "Redeem SC", enter the amount you wish to redeem (minimum 100 SC), select your payout method, and submit your request.' },
    { category: 'redemption', question: 'How long does redemption take?', answer: 'Standard redemptions are processed within 1-3 business days. VIP members enjoy priority processing.' },
  ];

  for (const faq of faqsData) {
    const category = faqCategories.find(c => c.slug === faq.category);
    if (category) {
      await prisma.faq.create({
        data: {
          categoryId: category.id,
          question: faq.question,
          answer: faq.answer,
          isFeatured: faq.isFeatured || false,
        },
      });
    }
  }

  // ============================================
  // STATIC PAGES
  // ============================================
  console.log('Creating static pages...');
  await Promise.all([
    prisma.staticPage.upsert({
      where: { slug: 'terms' },
      update: {},
      create: {
        slug: 'terms',
        title: 'Terms of Service',
        content: '# Terms of Service\n\nWelcome to WBC 2026. By using our platform, you agree to these terms...',
        metaTitle: 'Terms of Service - WBC 2026',
        metaDescription: 'Read our terms of service and user agreement.',
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.staticPage.upsert({
      where: { slug: 'privacy' },
      update: {},
      create: {
        slug: 'privacy',
        title: 'Privacy Policy',
        content: '# Privacy Policy\n\nYour privacy is important to us. This policy explains how we collect and use your data...',
        metaTitle: 'Privacy Policy - WBC 2026',
        metaDescription: 'Learn how we protect your privacy and handle your data.',
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.staticPage.upsert({
      where: { slug: 'responsible-gaming' },
      update: {},
      create: {
        slug: 'responsible-gaming',
        title: 'Responsible Gaming',
        content: '# Responsible Gaming\n\nWe are committed to promoting responsible gaming. Set limits, take breaks, and play responsibly...',
        metaTitle: 'Responsible Gaming - WBC 2026',
        metaDescription: 'Learn about our responsible gaming practices and how to stay in control.',
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.staticPage.upsert({
      where: { slug: 'fairness' },
      update: {},
      create: {
        slug: 'fairness',
        title: 'Fairness & RNG',
        content: '# Provably Fair Gaming\n\nAll our games use certified Random Number Generators (RNG) to ensure fair outcomes...',
        metaTitle: 'Fair Gaming - WBC 2026',
        metaDescription: 'Learn about our certified RNG and fair gaming practices.',
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
  ]);

  // ============================================
  // SITE SETTINGS
  // ============================================
  console.log('Creating site settings...');
  await Promise.all([
    prisma.siteSetting.upsert({
      where: { key: 'site_name' },
      update: {},
      create: { key: 'site_name', value: { name: 'WBC 2026', tagline: 'Play. Win. Redeem.' } },
    }),
    prisma.siteSetting.upsert({
      where: { key: 'support_email' },
      update: {},
      create: { key: 'support_email', value: { email: 'support@wbc2026.com' } },
    }),
    prisma.siteSetting.upsert({
      where: { key: 'social_links' },
      update: {},
      create: {
        key: 'social_links',
        value: {
          twitter: 'https://twitter.com/wbc2026',
          facebook: 'https://facebook.com/wbc2026',
          instagram: 'https://instagram.com/wbc2026',
          discord: 'https://discord.gg/wbc2026',
          telegram: 'https://t.me/wbc2026',
        },
      },
    }),
  ]);

  // ============================================
  // HERO BANNERS
  // ============================================
  console.log('Creating hero banners...');
  await Promise.all([
    prisma.heroBanner.upsert({
      where: { id: 'banner-1' },
      update: {},
      create: {
        id: 'banner-1',
        title: 'Welcome to WBC 2026',
        subtitle: 'Get 200% bonus on your first purchase',
        ctaText: 'Get Started',
        ctaLink: '/register',
        imageUrl: '/banners/hero-1.jpg',
        backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        targetAudience: 'new_users',
        sortOrder: 1,
      },
    }),
    prisma.heroBanner.upsert({
      where: { id: 'banner-2' },
      update: {},
      create: {
        id: 'banner-2',
        title: 'New Game: Gates of Olympus',
        subtitle: 'Up to 5000x multiplier!',
        ctaText: 'Play Now',
        ctaLink: '/games/gates-of-olympus',
        imageUrl: '/banners/hero-2.jpg',
        backgroundGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        targetAudience: 'all',
        sortOrder: 2,
      },
    }),
    prisma.heroBanner.upsert({
      where: { id: 'banner-3' },
      update: {},
      create: {
        id: 'banner-3',
        title: 'VIP Program',
        subtitle: 'Join our exclusive VIP club for amazing rewards',
        ctaText: 'Learn More',
        ctaLink: '/vip',
        imageUrl: '/banners/hero-3.jpg',
        backgroundGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        targetAudience: 'all',
        sortOrder: 3,
      },
    }),
  ]);

  // ============================================
  // CONTENT CATEGORIES (WBCTV)
  // ============================================
  console.log('Creating content categories...');
  const contentCategories = await Promise.all([
    prisma.contentCategory.upsert({ where: { slug: 'winners' }, update: {}, create: { name: 'Winners', slug: 'winners', icon: 'trophy', sortOrder: 1 } }),
    prisma.contentCategory.upsert({ where: { slug: 'news' }, update: {}, create: { name: 'News', slug: 'news', icon: 'newspaper', sortOrder: 2 } }),
    prisma.contentCategory.upsert({ where: { slug: 'tips' }, update: {}, create: { name: 'Tips & Strategy', slug: 'tips', icon: 'lightbulb', sortOrder: 3 } }),
    prisma.contentCategory.upsert({ where: { slug: 'tournaments' }, update: {}, create: { name: 'Tournaments', slug: 'tournaments', icon: 'award', sortOrder: 4 } }),
    prisma.contentCategory.upsert({ where: { slug: 'community' }, update: {}, create: { name: 'Community', slug: 'community', icon: 'users', sortOrder: 5 } }),
    prisma.contentCategory.upsert({ where: { slug: 'live' }, update: {}, create: { name: 'Live', slug: 'live', icon: 'radio', sortOrder: 6 } }),
    prisma.contentCategory.upsert({ where: { slug: 'highlights' }, update: {}, create: { name: 'Highlights', slug: 'highlights', icon: 'star', sortOrder: 7 } }),
  ]);

  // ============================================
  // CONTENT VIDEOS (WBCTV)
  // ============================================
  console.log('Creating content videos...');
  const videosData = [
    { title: 'Big Win Alert: $50,000 Jackpot on Gates of Olympus!', categorySlug: 'winners', thumbnailUrl: '/videos/thumbs/big-win-1.jpg', videoUrl: 'https://example.com/videos/big-win-1.mp4', duration: 185, isFeatured: true, views: 15420 },
    { title: 'Weekly Winners Compilation - January 2026', categorySlug: 'winners', thumbnailUrl: '/videos/thumbs/weekly-winners.jpg', videoUrl: 'https://example.com/videos/weekly-winners.mp4', duration: 420, views: 8750 },
    { title: 'Massive Multiplier! 10,000x on Sweet Bonanza', categorySlug: 'winners', thumbnailUrl: '/videos/thumbs/sweet-bonanza-win.jpg', videoUrl: 'https://example.com/videos/sweet-bonanza-win.mp4', duration: 95, isFeatured: true, views: 22100 },
    { title: 'New Slot Release: Dragon Kingdom', categorySlug: 'news', thumbnailUrl: '/videos/thumbs/dragon-kingdom.jpg', videoUrl: 'https://example.com/videos/dragon-kingdom.mp4', duration: 240, isNew: true, views: 5420 },
    { title: 'WBC 2026 February Update - New Features Coming', categorySlug: 'news', thumbnailUrl: '/videos/thumbs/feb-update.jpg', videoUrl: 'https://example.com/videos/feb-update.mp4', duration: 300, views: 12000 },
    { title: 'How to Win Big on Crash Games', categorySlug: 'tips', thumbnailUrl: '/videos/thumbs/crash-tips.jpg', videoUrl: 'https://example.com/videos/crash-tips.mp4', duration: 480, isFeatured: true, views: 35600 },
    { title: 'Slot Strategy: Managing Your Bankroll', categorySlug: 'tips', thumbnailUrl: '/videos/thumbs/bankroll.jpg', videoUrl: 'https://example.com/videos/bankroll.mp4', duration: 560, views: 28900 },
    { title: 'Understanding Volatility in Slots', categorySlug: 'tips', thumbnailUrl: '/videos/thumbs/volatility.jpg', videoUrl: 'https://example.com/videos/volatility.mp4', duration: 320, views: 19500 },
    { title: 'Weekly Tournament Recap - Week 4', categorySlug: 'tournaments', thumbnailUrl: '/videos/thumbs/tournament-recap.jpg', videoUrl: 'https://example.com/videos/tournament-recap.mp4', duration: 600, views: 7800 },
    { title: '$100K Prize Pool Tournament Finals', categorySlug: 'tournaments', thumbnailUrl: '/videos/thumbs/finals.jpg', videoUrl: 'https://example.com/videos/finals.mp4', duration: 1800, isFeatured: true, views: 45200 },
    { title: 'Community Spotlight: Top Players of the Month', categorySlug: 'community', thumbnailUrl: '/videos/thumbs/spotlight.jpg', videoUrl: 'https://example.com/videos/spotlight.mp4', duration: 420, views: 11200 },
    { title: 'Player Interview: From Beginner to VIP Diamond', categorySlug: 'community', thumbnailUrl: '/videos/thumbs/interview.jpg', videoUrl: 'https://example.com/videos/interview.mp4', duration: 900, views: 8900 },
    { title: 'LIVE: Saturday Slots Session', categorySlug: 'live', thumbnailUrl: '/videos/thumbs/live-saturday.jpg', videoUrl: 'https://example.com/streams/live-saturday', duration: 0, isLive: true, views: 1250 },
    { title: 'Best Moments from Last Week', categorySlug: 'highlights', thumbnailUrl: '/videos/thumbs/best-moments.jpg', videoUrl: 'https://example.com/videos/best-moments.mp4', duration: 720, isFeatured: true, views: 32100 },
  ];

  for (const video of videosData) {
    const category = contentCategories.find(c => c.slug === video.categorySlug);
    if (category) {
      await prisma.contentVideo.create({
        data: {
          title: video.title,
          categoryId: category.id,
          thumbnailUrl: video.thumbnailUrl,
          videoUrl: video.videoUrl,
          durationSeconds: video.duration,
          isFeatured: video.isFeatured || false,
          isLive: video.isLive || false,
          viewCount: video.views,
        },
      });
    }
  }

  // ============================================
  // AMOE CONFIG
  // ============================================
  console.log('Creating AMOE config...');
  await prisma.amoeConfig.upsert({
    where: { id: 'amoe-config' },
    update: {},
    create: {
      id: 'amoe-config',
      dailyLimitPerUser: 1,
      weeklyLimitPerUser: 5,
      scAmountPerEntry: 5,
      termsText: 'Alternative Method of Entry allows you to receive free Sweepstake Coins without purchase. Mail a handwritten request to the address shown.',
      mailingAddress: {
        name: 'WBC 2026 AMOE',
        street: '123 Sweepstakes Ave',
        city: 'Las Vegas',
        state: 'NV',
        zip: '89101',
        country: 'USA',
      },
    },
  });

  // ============================================
  // PRIZES
  // ============================================
  console.log('Creating prizes...');
  await Promise.all([
    prisma.prize.upsert({ where: { id: 'prize-gc25' }, update: {}, create: { id: 'prize-gc25', name: '$25 Gift Card', description: 'Amazon, Visa, or Target gift card', valueUsd: 25, scCost: 25, category: 'gift_cards', prizeType: 'redemption_store', isPopular: true, sortOrder: 1 } }),
    prisma.prize.upsert({ where: { id: 'prize-gc50' }, update: {}, create: { id: 'prize-gc50', name: '$50 Gift Card', description: 'Amazon, Visa, or Target gift card', valueUsd: 50, scCost: 50, category: 'gift_cards', prizeType: 'redemption_store', sortOrder: 2 } }),
    prisma.prize.upsert({ where: { id: 'prize-gc100' }, update: {}, create: { id: 'prize-gc100', name: '$100 Gift Card', description: 'Amazon, Visa, or Target gift card', valueUsd: 100, scCost: 100, category: 'gift_cards', prizeType: 'redemption_store', isPopular: true, sortOrder: 3 } }),
    prisma.prize.upsert({ where: { id: 'prize-gc250' }, update: {}, create: { id: 'prize-gc250', name: '$250 Gift Card', description: 'Amazon, Visa, or Target gift card', valueUsd: 250, scCost: 250, category: 'gift_cards', prizeType: 'redemption_store', sortOrder: 4 } }),
    prisma.prize.upsert({ where: { id: 'prize-gc500' }, update: {}, create: { id: 'prize-gc500', name: '$500 Gift Card', description: 'Amazon, Visa, or Target gift card', valueUsd: 500, scCost: 500, category: 'gift_cards', prizeType: 'redemption_store', sortOrder: 5 } }),
    prisma.prize.upsert({ where: { id: 'prize-airpods' }, update: {}, create: { id: 'prize-airpods', name: 'Apple AirPods Pro', description: 'Latest generation AirPods Pro', valueUsd: 249, scCost: 249, category: 'electronics', prizeType: 'redemption_store', isPopular: true, sortOrder: 10 } }),
    prisma.prize.upsert({ where: { id: 'prize-ipad' }, update: {}, create: { id: 'prize-ipad', name: 'Apple iPad', description: 'Latest iPad with 64GB storage', valueUsd: 449, scCost: 449, category: 'electronics', prizeType: 'redemption_store', sortOrder: 11 } }),
    prisma.prize.upsert({ where: { id: 'prize-ps5' }, update: {}, create: { id: 'prize-ps5', name: 'PlayStation 5', description: 'PS5 Console Digital Edition', valueUsd: 399, scCost: 399, category: 'electronics', prizeType: 'redemption_store', isPopular: true, sortOrder: 12 } }),
  ]);

  // ============================================
  // SOCIAL PROOF CONFIG
  // ============================================
  console.log('Creating social proof config...');
  await prisma.socialProofConfig.upsert({
    where: { id: 'social-proof-config' },
    update: {},
    create: {
      id: 'social-proof-config',
      displayFrequencySeconds: 8,
      minWinAmountToDisplay: 100,
      includeSynthetic: true,
      eventTypesEnabled: ['win', 'jackpot', 'vip_levelup', 'bonus_claimed'],
    },
  });

  // ============================================
  // WIN DISPLAY CONFIG
  // ============================================
  console.log('Creating win display config...');
  await prisma.winDisplayConfig.upsert({
    where: { id: 'win-config' },
    update: {},
    create: {
      id: 'win-config',
      minGcAmount: 10000,
      minScAmount: 10,
      maxDisplayCount: 50,
      refreshIntervalSeconds: 30,
    },
  });

  // ============================================
  // TEST USERS
  // ============================================
  console.log('Creating test users...');
  const passwordHash = await bcrypt.hash('Test123!', 12);

  const _testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      username: 'testuser',
      passwordHash,
      firstName: 'Test',
      lastName: 'User',
      emailVerifiedAt: new Date(),
      wallet: {
        create: {
          gcBalance: 100000,
          scBalance: 100,
        },
      },
      vip: {
        create: {
          tierId: bronzeTier.id,
          xpCurrent: BigInt(0),
          xpLifetime: BigInt(0),
        },
      },
      referralCode: {
        create: {
          code: 'TESTUSER',
        },
      },
      settings: {
        create: {},
      },
      notificationPrefs: {
        create: {},
      },
      privacySettings: {
        create: {},
      },
    },
  });

  // ============================================
  // ADMIN USER
  // ============================================
  console.log('Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);

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
  // MEDIA ASSETS (Placeholder Records)
  // ============================================
  console.log('Creating media asset placeholders...');

  // Create placeholder assets for VIP tiers
  const vipIcons = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
  for (const tier of vipIcons) {
    await createPlaceholderAsset(
      `vip:${tier}`,
      'vip-icons',
      `${tier.charAt(0).toUpperCase() + tier.slice(1)} VIP Icon`,
      `${tier}.png`
    );
  }

  // Create placeholder assets for game providers
  for (const provider of providersData) {
    await createPlaceholderAsset(
      `provider:${provider.slug}`,
      'provider-logos',
      `${provider.name} Logo`,
      `${provider.slug}.png`
    );
  }

  // Create placeholder assets for games
  for (const game of gamesData) {
    await createPlaceholderAsset(
      `game:${game.slug}`,
      'game-thumbnails',
      `${game.name} Thumbnail`,
      `${game.slug}.jpg`
    );
  }

  // Create placeholder assets for hero banners
  const banners = [
    { key: 'banner:welcome', title: 'Welcome Banner', filename: 'welcome.jpg' },
    { key: 'banner:promotions', title: 'Promotions Banner', filename: 'promotions.jpg' },
    { key: 'banner:vip', title: 'VIP Program Banner', filename: 'vip.jpg' },
  ];
  for (const banner of banners) {
    await createPlaceholderAsset(banner.key, 'hero-banners', banner.title, banner.filename);
  }

  // Create placeholder assets for payment methods
  const paymentIcons = [
    { key: 'payment:card', title: 'Credit Card Icon', filename: 'card.png' },
    { key: 'payment:apple-pay', title: 'Apple Pay Icon', filename: 'apple-pay.png' },
    { key: 'payment:google-pay', title: 'Google Pay Icon', filename: 'google-pay.png' },
    { key: 'payment:crypto', title: 'Crypto Icon', filename: 'crypto.png' },
  ];
  for (const payment of paymentIcons) {
    await createPlaceholderAsset(payment.key, 'payment-icons', payment.title, payment.filename);
  }

  // Create placeholder assets for crypto options
  const cryptoIcons = ['btc', 'eth', 'usdt', 'usdc', 'sol'];
  for (const crypto of cryptoIcons) {
    await createPlaceholderAsset(
      `crypto:${crypto}`,
      'payment-icons',
      `${crypto.toUpperCase()} Icon`,
      `${crypto}.png`
    );
  }

  // Create placeholder assets for sports teams
  const teamSlugs = [
    'chiefs', 'ravens', 'eagles', 'bills', '49ers',
    'liverpool', 'man-city', 'real-madrid', 'barcelona',
    'lakers', 'celtics', 'warriors',
    'yankees', 'dodgers', 'bruins', 'oilers', 'rangers'
  ];
  for (const team of teamSlugs) {
    await createPlaceholderAsset(
      `team:${team}`,
      'team-logos',
      `${team.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Logo`,
      `${team}.png`
    );
  }

  // Create placeholder assets for prizes
  const prizeImages = [
    { key: 'prize:gift-card', title: 'Gift Card Image', filename: 'gift-card.jpg' },
    { key: 'prize:airpods', title: 'AirPods Image', filename: 'airpods.jpg' },
    { key: 'prize:ipad', title: 'iPad Image', filename: 'ipad.jpg' },
    { key: 'prize:ps5', title: 'PlayStation 5 Image', filename: 'ps5.jpg' },
  ];
  for (const prize of prizeImages) {
    await createPlaceholderAsset(prize.key, 'prize-images', prize.title, prize.filename);
  }

  // Create placeholder assets for promotions
  const promoImages = [
    { key: 'promo:daily-bonus', title: 'Daily Bonus Image', filename: 'daily-bonus.jpg' },
    { key: 'promo:welcome', title: 'Welcome Bonus Image', filename: 'welcome-bonus.jpg' },
    { key: 'promo:weekend', title: 'Weekend Bonus Image', filename: 'weekend-bonus.jpg' },
    { key: 'promo:spin-wheel', title: 'Spin Wheel Image', filename: 'spin-wheel.jpg' },
  ];
  for (const promo of promoImages) {
    await createPlaceholderAsset(promo.key, 'promotion-images', promo.title, promo.filename);
  }

  // ============================================
  // DEMO DATA FOR CLIENT PRESENTATION
  // ============================================
  console.log('Creating demo data for client presentation...');

  // Get games for demo data
  const allGames = await prisma.game.findMany({ take: 20 });

  // Create demo users with realistic balances and activity
  const demoUsersData = [
    { username: 'LuckyMike92', email: 'mike@demo.com', firstName: 'Mike', lastName: 'Johnson', gcBalance: 2500000, scBalance: 1250, vipLevel: 4 },
    { username: 'SlotQueen', email: 'sarah@demo.com', firstName: 'Sarah', lastName: 'Williams', gcBalance: 850000, scBalance: 425, vipLevel: 3 },
    { username: 'CryptoKing', email: 'alex@demo.com', firstName: 'Alex', lastName: 'Chen', gcBalance: 5200000, scBalance: 2600, vipLevel: 5 },
    { username: 'BonusHunter', email: 'emma@demo.com', firstName: 'Emma', lastName: 'Davis', gcBalance: 320000, scBalance: 160, vipLevel: 2 },
    { username: 'HighRoller99', email: 'james@demo.com', firstName: 'James', lastName: 'Miller', gcBalance: 8500000, scBalance: 4250, vipLevel: 5 },
    { username: 'SpinMaster', email: 'lisa@demo.com', firstName: 'Lisa', lastName: 'Anderson', gcBalance: 1200000, scBalance: 600, vipLevel: 3 },
    { username: 'JackpotJoe', email: 'joe@demo.com', firstName: 'Joe', lastName: 'Wilson', gcBalance: 450000, scBalance: 225, vipLevel: 2 },
    { username: 'WinnerTom', email: 'tom@demo.com', firstName: 'Tom', lastName: 'Brown', gcBalance: 3800000, scBalance: 1900, vipLevel: 4 },
    { username: 'GoldenGirl', email: 'olivia@demo.com', firstName: 'Olivia', lastName: 'Taylor', gcBalance: 920000, scBalance: 460, vipLevel: 3 },
    { username: 'AcePlayer', email: 'david@demo.com', firstName: 'David', lastName: 'Moore', gcBalance: 1750000, scBalance: 875, vipLevel: 4 },
    { username: 'StarChaser', email: 'mia@demo.com', firstName: 'Mia', lastName: 'Jackson', gcBalance: 620000, scBalance: 310, vipLevel: 2 },
    { username: 'ProGamer21', email: 'ryan@demo.com', firstName: 'Ryan', lastName: 'Harris', gcBalance: 4100000, scBalance: 2050, vipLevel: 5 },
  ];

  const createdDemoUsers: any[] = [];
  const vipTiersArray = await prisma.vipTier.findMany({ orderBy: { level: 'asc' } });

  for (const userData of demoUsersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailVerifiedAt: new Date(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        wallet: {
          create: {
            gcBalance: userData.gcBalance,
            scBalance: userData.scBalance,
          },
        },
        vip: {
          create: {
            tierId: vipTiersArray[Math.min(userData.vipLevel - 1, vipTiersArray.length - 1)].id,
            xpCurrent: BigInt(userData.vipLevel * 50000),
            xpLifetime: BigInt(userData.vipLevel * 100000),
          },
        },
        referralCode: {
          create: {
            code: userData.username.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8),
          },
        },
        settings: { create: {} },
        notificationPrefs: { create: {} },
        privacySettings: { create: {} },
      },
      include: { wallet: true },
    });
    createdDemoUsers.push(user);
  }

  // Create game sessions and rounds for demo users
  console.log('Creating game sessions and activity...');
  const recentDates = [
    new Date(Date.now() - 5 * 60000),  // 5 minutes ago
    new Date(Date.now() - 15 * 60000), // 15 minutes ago
    new Date(Date.now() - 30 * 60000), // 30 minutes ago
    new Date(Date.now() - 60 * 60000), // 1 hour ago
    new Date(Date.now() - 2 * 3600000), // 2 hours ago
    new Date(Date.now() - 4 * 3600000), // 4 hours ago
    new Date(Date.now() - 8 * 3600000), // 8 hours ago
    new Date(Date.now() - 12 * 3600000), // 12 hours ago
    new Date(Date.now() - 24 * 3600000), // 1 day ago
    new Date(Date.now() - 48 * 3600000), // 2 days ago
  ];

  // Create recent wins and game activity
  for (let i = 0; i < 30; i++) {
    const user = createdDemoUsers[i % createdDemoUsers.length];
    const game = allGames[Math.floor(Math.random() * allGames.length)];
    const dateIndex = Math.floor(Math.random() * recentDates.length);
    const playedAt = new Date(recentDates[dateIndex].getTime() + Math.random() * 3600000);

    // Create game session
    const sessionCoinType = Math.random() > 0.3 ? 'GC' : 'SC';
    const session = await prisma.gameSession.create({
      data: {
        userId: user.id,
        gameId: game.id,
        coinType: sessionCoinType,
        sessionToken: `sess_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        startedAt: playedAt,
        endedAt: new Date(playedAt.getTime() + Math.random() * 1800000),
        totalBet: Math.floor(Math.random() * 50000) + 1000,
        totalWin: Math.floor(Math.random() * 100000),
        roundsPlayed: Math.floor(Math.random() * 100) + 10,
      },
    });

    // Create a few rounds for each session
    const numRounds = Math.floor(Math.random() * 5) + 2;
    for (let r = 0; r < numRounds; r++) {
      const betAmount = Math.floor(Math.random() * 1000) + 100;
      const isWin = Math.random() > 0.4;
      const multiplier = isWin ? (1 + Math.random() * 50) : 0;
      const winAmount = isWin ? betAmount * multiplier : 0;

      await prisma.gameRound.create({
        data: {
          sessionId: session.id,
          userId: user.id,
          gameId: game.id,
          coinType: sessionCoinType,
          betAmount,
          winAmount,
          multiplier,
          resultData: { symbols: ['A', 'K', 'Q'], payline: isWin ? 1 : 0, outcome: isWin ? 'win' : 'loss' },
        },
      });
    }
  }

  // Create leaderboard entries for demo users
  console.log('Creating leaderboard entries...');
  const leaderboards = await prisma.leaderboard.findMany();

  for (const lb of leaderboards) {
    // Shuffle users for variety
    const shuffledUsers = [...createdDemoUsers].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(10, shuffledUsers.length); i++) {
      const user = shuffledUsers[i];
      let score: number;

      if (lb.type === 'biggest_win') {
        score = Math.floor(Math.random() * 100000) + 10000;
      } else if (lb.type === 'most_wagered') {
        score = Math.floor(Math.random() * 500000) + 50000;
      } else {
        score = Math.floor(Math.random() * 1000) + 100;
      }

      await prisma.leaderboardEntry.upsert({
        where: {
          leaderboardId_userId: {
            leaderboardId: lb.id,
            userId: user.id,
          },
        },
        update: { score, rank: i + 1 },
        create: {
          leaderboardId: lb.id,
          userId: user.id,
          score,
          rank: i + 1,
        },
      });
    }
  }

  // Create recent wins for activity feed / social proof
  console.log('Creating recent wins for social proof...');
  const bigWins = [
    { multiplier: 5000, game: 'gates-of-olympus', coinType: 'SC', amount: 2500 },
    { multiplier: 2500, game: 'sweet-bonanza', coinType: 'SC', amount: 1250 },
    { multiplier: 1000, game: 'aviator', coinType: 'GC', amount: 500000 },
    { multiplier: 3500, game: 'wanted-dead-or-wild', coinType: 'SC', amount: 1750 },
    { multiplier: 800, game: 'crazy-time', coinType: 'SC', amount: 400 },
    { multiplier: 1500, game: 'money-train-2', coinType: 'GC', amount: 750000 },
    { multiplier: 4200, game: 'mental', coinType: 'SC', amount: 2100 },
    { multiplier: 600, game: 'book-of-dead', coinType: 'GC', amount: 300000 },
    { multiplier: 1800, game: 'starlight-princess', coinType: 'SC', amount: 900 },
    { multiplier: 950, game: 'dead-or-alive-2', coinType: 'SC', amount: 475 },
  ];

  // First create game rounds for the public wins
  for (let i = 0; i < bigWins.length; i++) {
    const win = bigWins[i];
    const user = createdDemoUsers[i % createdDemoUsers.length];
    const game = allGames.find(g => g.slug === win.game) || allGames[0];

    // Create a game session first
    const winSession = await prisma.gameSession.create({
      data: {
        userId: user.id,
        gameId: game.id,
        coinType: win.coinType,
        sessionToken: `win_sess_${Date.now()}_${i}`,
        startedAt: new Date(Date.now() - i * 900000 - 300000),
        endedAt: new Date(Date.now() - i * 900000),
        totalBet: win.amount / win.multiplier,
        totalWin: win.amount,
        roundsPlayed: 1,
      },
    });

    // Create the winning round
    const winRound = await prisma.gameRound.create({
      data: {
        sessionId: winSession.id,
        userId: user.id,
        gameId: game.id,
        coinType: win.coinType,
        betAmount: win.amount / win.multiplier,
        winAmount: win.amount,
        multiplier: win.multiplier,
        resultData: { bigWin: true, multiplier: win.multiplier },
      },
    });

    // Create public win entry
    await prisma.publicWin.create({
      data: {
        userId: user.id,
        gameId: game.id,
        gameRoundId: winRound.id,
        displayName: user.username,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        coinType: win.coinType,
        amount: win.amount,
        multiplier: win.multiplier,
        isFeatured: win.multiplier > 2000,
      },
    });
  }

  // Create transaction history for demo users
  console.log('Creating transaction history...');
  const transactionTypes = ['purchase', 'bonus', 'bet', 'win', 'redemption'];

  for (const user of createdDemoUsers.slice(0, 6)) {
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) continue;

    // Create 10-20 transactions per user
    const numTransactions = Math.floor(Math.random() * 10) + 10;
    let gcBalance = Number(wallet.gcBalance);
    let scBalance = Number(wallet.scBalance);

    for (let i = 0; i < numTransactions; i++) {
      const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const coinType = Math.random() > 0.3 ? 'GC' : 'SC';
      let amount: number;

      if (type === 'purchase') {
        amount = [2500, 7500, 25000, 50000, 100000][Math.floor(Math.random() * 5)];
      } else if (type === 'bonus') {
        amount = Math.floor(Math.random() * 5000) + 500;
      } else if (type === 'bet') {
        amount = -(Math.floor(Math.random() * 5000) + 100);
      } else if (type === 'win') {
        amount = Math.floor(Math.random() * 20000) + 1000;
      } else {
        amount = -(Math.floor(Math.random() * 50) + 25);
      }

      const balanceBefore = coinType === 'GC' ? gcBalance : scBalance;
      const balanceAfter = balanceBefore + amount;

      if (coinType === 'GC') {
        gcBalance = balanceAfter;
      } else {
        scBalance = balanceAfter;
      }

      await prisma.transaction.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          type,
          coinType,
          amount: Math.abs(amount),
          balanceBefore: Math.max(0, balanceBefore),
          balanceAfter: Math.max(0, balanceAfter),
          status: 'completed',
          createdAt: new Date(Date.now() - i * 3600000 * Math.random() * 48),
        },
      });
    }
  }

  // Create announcements
  console.log('Creating announcements...');
  await Promise.all([
    prisma.announcement.upsert({
      where: { id: 'announce-1' },
      update: {},
      create: {
        id: 'announce-1',
        title: '🎉 Welcome to WBC 2026!',
        content: 'Experience the thrill of our new gaming platform. Get your welcome bonus today!',
        type: 'general',
        priority: 'high',
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600000),
      },
    }),
    prisma.announcement.upsert({
      where: { id: 'announce-2' },
      update: {},
      create: {
        id: 'announce-2',
        title: '🏆 Weekly Tournament Starting Soon!',
        content: 'Join our $50,000 prize pool tournament this weekend. Sign up now!',
        type: 'promotion',
        priority: 'high',
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600000),
      },
    }),
    prisma.announcement.upsert({
      where: { id: 'announce-3' },
      update: {},
      create: {
        id: 'announce-3',
        title: '⚡ New Games Added!',
        content: 'Check out our latest slot releases including Money Train 3 and more exclusive titles.',
        type: 'update',
        priority: 'medium',
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 3600000),
      },
    }),
  ]);

  // Create notifications for test user
  console.log('Creating demo notifications...');
  const testUserForNotif = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  if (testUserForNotif) {
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: testUserForNotif.id,
          type: 'promotion',
          title: 'Daily Bonus Ready!',
          message: 'Your daily bonus of 1,000 GC + 0.5 SC is ready to claim!',
          actionUrl: '/promotions/daily',
        },
      }),
      prisma.notification.create({
        data: {
          userId: testUserForNotif.id,
          type: 'system',
          title: 'Welcome to WBC 2026!',
          message: 'Thanks for joining! Start playing to earn XP and climb the VIP ranks.',
          actionUrl: '/vip',
        },
      }),
      prisma.notification.create({
        data: {
          userId: testUserForNotif.id,
          type: 'game',
          title: 'New Game: Money Train 3',
          message: 'Try the newest slot with up to 100,000x multiplier!',
          actionUrl: '/games/money-train-3',
        },
      }),
    ]);
  }

  // Create jackpot winners for display
  console.log('Creating jackpot winner history...');
  const jackpots = await prisma.jackpot.findMany();

  for (let i = 0; i < 5; i++) {
    const user = createdDemoUsers[i];
    const jackpot = jackpots[Math.floor(Math.random() * jackpots.length)];
    const game = allGames[Math.floor(Math.random() * allGames.length)];

    // Create a game round for the jackpot win
    const jackpotSession = await prisma.gameSession.create({
      data: {
        userId: user.id,
        gameId: game.id,
        coinType: 'SC',
        sessionToken: `jackpot_sess_${Date.now()}_${i}`,
        startedAt: new Date(Date.now() - i * 24 * 3600000 - 3600000),
        endedAt: new Date(Date.now() - i * 24 * 3600000),
        totalBet: 100,
        totalWin: jackpot.type === 'grand' ? 85000 : jackpot.type === 'major' ? 12000 : jackpot.type === 'minor' ? 1500 : 150,
        roundsPlayed: 50,
      },
    });

    const jackpotRound = await prisma.gameRound.create({
      data: {
        sessionId: jackpotSession.id,
        userId: user.id,
        gameId: game.id,
        coinType: 'SC',
        betAmount: 2,
        winAmount: jackpot.type === 'grand' ? 85000 : jackpot.type === 'major' ? 12000 : jackpot.type === 'minor' ? 1500 : 150,
        multiplier: jackpot.type === 'grand' ? 42500 : jackpot.type === 'major' ? 6000 : jackpot.type === 'minor' ? 750 : 75,
        resultData: { jackpotWin: true, jackpotType: jackpot.type },
      },
    });

    const jackpotAmount = jackpot.type === 'grand' ? 85000 + Math.random() * 40000 :
                          jackpot.type === 'major' ? 12000 + Math.random() * 8000 :
                          jackpot.type === 'minor' ? 1500 + Math.random() * 2000 :
                          150 + Math.random() * 200;

    await prisma.jackpotWin.create({
      data: {
        jackpotId: jackpot.id,
        userId: user.id,
        gameId: game.id,
        gameRoundId: jackpotRound.id,
        amount: jackpotAmount,
        jackpotType: jackpot.type,
        wonAt: new Date(Date.now() - i * 24 * 3600000 - Math.random() * 12 * 3600000),
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📋 Demo Credentials:');
  console.log('   Test User: test@example.com / Test123!');
  console.log('   Admin: admin@wbc2026.com / Admin123!');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
