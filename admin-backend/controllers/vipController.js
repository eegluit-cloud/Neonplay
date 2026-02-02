const prisma = require('../lib/prisma');
const { invalidateVipCache } = require('../lib/redis');
const { uploadToS3, DEFAULT_VIP_ICON } = require('../lib/s3');

// Get all VIP tiers
const getAllTiers = async (req, res) => {
  try {
    const tiers = await prisma.vipTier.findMany({
      orderBy: { level: 'asc' },
      include: {
        _count: {
          select: { userVips: true }
        }
      }
    });

    res.json({
      tiers: tiers.map(tier => ({
        id: tier.id,
        name: tier.name,
        slug: tier.slug,
        level: tier.level,
        minXp: tier.minXp.toString(),
        iconUrl: tier.iconUrl,
        color: tier.color,
        benefits: tier.benefits,
        cashbackPercent: parseFloat(tier.cashbackPercent),
        redemptionBonusPercent: parseFloat(tier.redemptionBonusPercent),
        exclusivePromotions: tier.exclusivePromotions,
        userCount: tier._count.userVips,
        createdAt: tier.createdAt
      }))
    });
  } catch (error) {
    console.error('Get VIP tiers error:', error);
    res.status(500).json({ error: 'Failed to fetch VIP tiers' });
  }
};

// Get single VIP tier
const getTier = async (req, res) => {
  try {
    const { tierId } = req.params;

    const tier = await prisma.vipTier.findUnique({
      where: { id: tierId },
      include: {
        _count: {
          select: { userVips: true }
        }
      }
    });

    if (!tier) {
      return res.status(404).json({ error: 'VIP tier not found' });
    }

    res.json({
      tier: {
        id: tier.id,
        name: tier.name,
        slug: tier.slug,
        level: tier.level,
        minXp: tier.minXp.toString(),
        iconUrl: tier.iconUrl,
        color: tier.color,
        benefits: tier.benefits,
        cashbackPercent: parseFloat(tier.cashbackPercent),
        redemptionBonusPercent: parseFloat(tier.redemptionBonusPercent),
        exclusivePromotions: tier.exclusivePromotions,
        userCount: tier._count.userVips,
        createdAt: tier.createdAt
      }
    });
  } catch (error) {
    console.error('Get VIP tier error:', error);
    res.status(500).json({ error: 'Failed to fetch VIP tier' });
  }
};

// Create VIP tier
const createTier = async (req, res) => {
  try {
    const {
      name,
      slug,
      level,
      minXp,
      iconUrl,
      color,
      benefits,
      cashbackPercent,
      redemptionBonusPercent,
      exclusivePromotions,
      // Bonus percentages
      dailyBonusPercent,
      weeklyBonusPercent,
      monthlyBonusPercent
    } = req.body;

    // Handle file upload if present
    let finalIconUrl = iconUrl || DEFAULT_VIP_ICON;
    if (req.file) {
      finalIconUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    // Parse benefits if it's a string (from FormData)
    let parsedBenefits = benefits;
    if (typeof benefits === 'string') {
      try {
        parsedBenefits = JSON.parse(benefits);
      } catch (e) {
        parsedBenefits = [];
      }
    }

    // Build benefits object with both list and percentages
    const benefitsData = {
      list: Array.isArray(parsedBenefits) ? parsedBenefits : [],
      dailyBonusPercent: parseFloat(dailyBonusPercent) || 0,
      weeklyBonusPercent: parseFloat(weeklyBonusPercent) || 0,
      monthlyBonusPercent: parseFloat(monthlyBonusPercent) || 0
    };

    const tier = await prisma.vipTier.create({
      data: {
        name,
        slug,
        level: parseInt(level),
        minXp: BigInt(minXp || 0),
        iconUrl: finalIconUrl,
        color,
        benefits: benefitsData,
        cashbackPercent: parseFloat(cashbackPercent || 0),
        redemptionBonusPercent: parseFloat(redemptionBonusPercent || 0),
        exclusivePromotions: exclusivePromotions || null
      }
    });

    // Invalidate VIP cache
    await invalidateVipCache();

    res.status(201).json({
      message: 'VIP tier created',
      tier: {
        id: tier.id,
        name: tier.name,
        slug: tier.slug,
        level: tier.level,
        iconUrl: tier.iconUrl
      }
    });
  } catch (error) {
    console.error('Create VIP tier error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'VIP tier slug or level already exists' });
    }
    res.status(500).json({ error: 'Failed to create VIP tier' });
  }
};

// Update VIP tier
const updateTier = async (req, res) => {
  try {
    const { tierId } = req.params;
    const {
      name,
      slug,
      level,
      minXp,
      iconUrl,
      color,
      benefits,
      cashbackPercent,
      redemptionBonusPercent,
      exclusivePromotions,
      // Bonus percentages
      dailyBonusPercent,
      weeklyBonusPercent,
      monthlyBonusPercent
    } = req.body;

    // Get current tier to merge benefits
    const currentTier = await prisma.vipTier.findUnique({
      where: { id: tierId }
    });

    if (!currentTier) {
      return res.status(404).json({ error: 'VIP tier not found' });
    }

    // Handle file upload if present
    let finalIconUrl = iconUrl;
    if (req.file) {
      finalIconUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    // Parse benefits if it's a string (from FormData)
    let parsedBenefits = benefits;
    if (typeof benefits === 'string') {
      try {
        parsedBenefits = JSON.parse(benefits);
      } catch (e) {
        parsedBenefits = undefined;
      }
    }

    // Build update data
    const data = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (level !== undefined) data.level = parseInt(level);
    if (minXp !== undefined) data.minXp = BigInt(minXp);
    if (finalIconUrl !== undefined) data.iconUrl = finalIconUrl;
    if (color !== undefined) data.color = color;
    if (cashbackPercent !== undefined) data.cashbackPercent = parseFloat(cashbackPercent);
    if (redemptionBonusPercent !== undefined) data.redemptionBonusPercent = parseFloat(redemptionBonusPercent);
    if (exclusivePromotions !== undefined) data.exclusivePromotions = exclusivePromotions;

    // Handle benefits with both list and bonus percentages
    if (parsedBenefits !== undefined || dailyBonusPercent !== undefined || weeklyBonusPercent !== undefined || monthlyBonusPercent !== undefined) {
      const currentBenefits = currentTier.benefits || {};
      const benefitsData = {
        list: Array.isArray(parsedBenefits) ? parsedBenefits : (currentBenefits.list || []),
        dailyBonusPercent: dailyBonusPercent !== undefined ? parseFloat(dailyBonusPercent) : (currentBenefits.dailyBonusPercent || 0),
        weeklyBonusPercent: weeklyBonusPercent !== undefined ? parseFloat(weeklyBonusPercent) : (currentBenefits.weeklyBonusPercent || 0),
        monthlyBonusPercent: monthlyBonusPercent !== undefined ? parseFloat(monthlyBonusPercent) : (currentBenefits.monthlyBonusPercent || 0)
      };
      data.benefits = benefitsData;
    }

    await prisma.vipTier.update({
      where: { id: tierId },
      data
    });

    // Invalidate VIP cache
    await invalidateVipCache();

    res.json({ message: 'VIP tier updated' });
  } catch (error) {
    console.error('Update VIP tier error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'VIP tier not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'VIP tier slug or level already exists' });
    }
    res.status(500).json({ error: 'Failed to update VIP tier' });
  }
};

// Delete VIP tier
const deleteTier = async (req, res) => {
  try {
    const { tierId } = req.params;

    // Check if any users are assigned to this tier
    const userCount = await prisma.userVip.count({
      where: { tierId }
    });

    if (userCount > 0) {
      return res.status(400).json({
        error: `Cannot delete VIP tier. ${userCount} user(s) are currently assigned to this tier.`
      });
    }

    await prisma.vipTier.delete({
      where: { id: tierId }
    });

    // Invalidate VIP cache
    await invalidateVipCache();

    res.json({ message: 'VIP tier deleted' });
  } catch (error) {
    console.error('Delete VIP tier error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'VIP tier not found' });
    }
    res.status(500).json({ error: 'Failed to delete VIP tier' });
  }
};

// Get VIP statistics
const getVipStats = async (req, res) => {
  try {
    const tierStats = await prisma.vipTier.findMany({
      orderBy: { level: 'asc' },
      include: {
        _count: {
          select: { userVips: true }
        }
      }
    });

    const totalUsers = await prisma.userVip.count();

    res.json({
      totalUsers,
      tiers: tierStats.map(tier => ({
        id: tier.id,
        name: tier.name,
        level: tier.level,
        userCount: tier._count.userVips,
        percentage: totalUsers > 0 ? ((tier._count.userVips / totalUsers) * 100).toFixed(2) : 0
      }))
    });
  } catch (error) {
    console.error('Get VIP stats error:', error);
    res.status(500).json({ error: 'Failed to fetch VIP statistics' });
  }
};

// Get VIP page content settings
const getVipPageContent = async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'vip_page_content' }
    });

    const defaultContent = {
      pageTitle: 'Exclusive VIP Bonus',
      pageSubtitle: 'your progress is an accumulated sum through your wager, increase through tiers to earn bigger rewards',
      logoUrl: null,
      bannerImage: null,
      bannerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };

    res.json({
      content: setting ? setting.value : defaultContent
    });
  } catch (error) {
    console.error('Get VIP page content error:', error);
    res.status(500).json({ error: 'Failed to fetch VIP page content' });
  }
};

// Update VIP page content
const updateVipPageContent = async (req, res) => {
  try {
    const { content } = req.body;

    await prisma.siteSetting.upsert({
      where: { key: 'vip_page_content' },
      create: {
        key: 'vip_page_content',
        value: content
      },
      update: {
        value: content
      }
    });

    // Invalidate VIP cache
    await invalidateVipCache();

    res.json({ message: 'VIP page content updated' });
  } catch (error) {
    console.error('Update VIP page content error:', error);
    res.status(500).json({ error: 'Failed to update VIP page content' });
  }
};

module.exports = {
  getAllTiers,
  getTier,
  createTier,
  updateTier,
  deleteTier,
  getVipStats,
  getVipPageContent,
  updateVipPageContent
};
