const prisma = require('../lib/prisma');

const getBonuses = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    const where = {};

    if (type) {
      where.type = type;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const total = await prisma.promotion.count({ where });

    const promotions = await prisma.promotion.findMany({
      where,
      include: {
        _count: {
          select: { userPromotions: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      bonuses: promotions.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        type: p.type,
        amount: Number(p.bonusAmountUsdc || p.bonusAmount || 0),
        currency: p.bonusCurrency || 'USDC',
        percentage: p.percentageBonus || 0,
        wageringReq: p.wageringRequirement || 1,
        minDeposit: Number(p.minDepositUsdc || 0),
        maxCap: Number(p.maxBonusUsdc || 0),
        startDate: p.startsAt,
        endDate: p.endsAt,
        eligibleGames: null,
        playerSegments: null,
        maxClaims: p.maxClaims,
        currentClaims: p._count.userPromotions,
        description: p.description,
        terms: p.terms,
        imageUrl: p.imageUrl,
        status: p.isActive ? 'active' : 'inactive',
        createdAt: p.createdAt
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

    const promotion = await prisma.promotion.findUnique({
      where: { id: bonusId },
      include: {
        userPromotions: {
          select: {
            id: true,
            status: true,
            bonusAmount: true,
            wageredAmount: true
          }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    // Calculate stats from user promotions
    const stats = {
      total_claims: promotion.userPromotions.length,
      active_claims: promotion.userPromotions.filter(up => up.status === 'claimed').length,
      completed_claims: promotion.userPromotions.filter(up => up.status === 'completed').length,
      total_amount_given: promotion.userPromotions.reduce((sum, up) => sum + Number(up.bonusAmount || 0), 0),
      total_wagered: promotion.userPromotions.reduce((sum, up) => sum + Number(up.wageredAmount || 0), 0)
    };

    res.json({
      bonus: {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        amount: Number(promotion.bonusAmountUsdc || 0),
        percentage: promotion.percentageBonus || 0,
        wageringReq: promotion.wageringRequirement || 1,
        minDeposit: Number(promotion.minDepositUsdc || 0),
        maxCap: Number(promotion.maxBonusUsdc || 0),
        startDate: promotion.startsAt,
        endDate: promotion.endsAt,
        eligibleGames: null,
        playerSegments: null,
        maxClaims: promotion.maxClaims,
        currentClaims: promotion.userPromotions.length,
        description: promotion.description,
        terms: promotion.terms,
        imageUrl: promotion.imageUrl,
        status: promotion.isActive ? 'active' : 'inactive',
        createdAt: promotion.createdAt
      },
      stats: {
        totalClaims: stats.total_claims,
        activeClaims: stats.active_claims,
        completedClaims: stats.completed_claims,
        totalAmountGiven: stats.total_amount_given,
        totalWagered: stats.total_wagered
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
      startDate, endDate, eligibleGames, playerSegments, maxClaims, description, terms, imageUrl,
      currency // NEW: Support currency selection
    } = req.body;

    // Check for duplicate code
    if (code) {
      const existing = await prisma.promotion.findFirst({
        where: { code: code.toUpperCase() }
      });
      if (existing) {
        return res.status(400).json({ error: 'Bonus code already exists' });
      }
    }

    // Validate currency
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'USDC', 'USDT', 'INR', 'PHP', 'THB'];
    const bonusCurrency = currency && validCurrencies.includes(currency) ? currency : 'USDC';

    const promotion = await prisma.promotion.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        code: code ? code.toUpperCase() : null,
        type: type || 'code',
        bonusCurrency: bonusCurrency,
        bonusAmount: amount ? parseFloat(amount) : null,
        bonusAmountUsdc: amount ? parseFloat(amount) : null, // Keep for backward compatibility
        percentageBonus: percentage || null,
        wageringRequirement: wageringReq || 1,
        minDepositUsdc: minDeposit ? parseFloat(minDeposit) : null,
        maxBonusUsdc: maxCap ? parseFloat(maxCap) : null,
        startsAt: startDate ? new Date(startDate) : null,
        endsAt: endDate ? new Date(endDate) : null,
        maxClaims: maxClaims || null,
        description: description || null,
        terms: terms || null,
        imageUrl: imageUrl || null,
        isActive: true
      }
    });

    res.status(201).json({
      message: 'Bonus created',
      bonusId: promotion.id
    });
  } catch (error) {
    console.error('Create bonus error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bonus code or slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create bonus' });
  }
};

const updateBonus = async (req, res) => {
  try {
    const { bonusId } = req.params;
    const {
      name, code, amount, percentage, wageringReq, minDeposit, maxCap,
      startDate, endDate, eligibleGames, playerSegments, maxClaims, description, terms, status, imageUrl
    } = req.body;

    // Check if bonus exists
    const existing = await prisma.promotion.findUnique({
      where: { id: bonusId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    // Check for duplicate code if changing
    if (code && code.toUpperCase() !== existing.code) {
      const duplicate = await prisma.promotion.findFirst({
        where: {
          code: code.toUpperCase(),
          id: { not: bonusId }
        }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Bonus code already exists' });
      }
    }

    const data = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (code !== undefined) data.code = code ? code.toUpperCase() : null;
    if (amount !== undefined) {
      data.bonusAmount = parseFloat(amount);
      data.bonusAmountUsdc = parseFloat(amount);
    }
    if (percentage !== undefined) data.percentageBonus = percentage;
    if (wageringReq !== undefined) data.wageringRequirement = wageringReq;
    if (minDeposit !== undefined) data.minDepositUsdc = parseFloat(minDeposit);
    if (maxCap !== undefined) data.maxBonusUsdc = maxCap ? parseFloat(maxCap) : null;
    if (startDate !== undefined) data.startsAt = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endsAt = endDate ? new Date(endDate) : null;
    if (maxClaims !== undefined) data.maxClaims = maxClaims;
    if (description !== undefined) data.description = description;
    if (terms !== undefined) data.terms = terms;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (status !== undefined) data.isActive = status === 'active';

    await prisma.promotion.update({
      where: { id: bonusId },
      data
    });

    res.json({ message: 'Bonus updated' });
  } catch (error) {
    console.error('Update bonus error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Bonus not found' });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bonus code already exists' });
    }
    res.status(500).json({ error: 'Failed to update bonus' });
  }
};

const deleteBonus = async (req, res) => {
  try {
    const { bonusId } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id: bonusId },
      include: {
        userPromotions: {
          where: { status: 'claimed' }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    // Check for active claims
    if (promotion.userPromotions.length > 0) {
      return res.status(400).json({ error: 'Cannot delete bonus with active claims' });
    }

    await prisma.promotion.delete({
      where: { id: bonusId }
    });

    res.json({ message: 'Bonus deleted' });
  } catch (error) {
    console.error('Delete bonus error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Bonus not found' });
    }
    res.status(500).json({ error: 'Failed to delete bonus' });
  }
};

const getPlayerBonuses = async (req, res) => {
  try {
    const { playerId, status, page = 1, limit = 20 } = req.query;

    const where = {};

    if (playerId) where.userId = playerId;
    if (status) {
      // Map status to Prisma UserPromotion status
      if (status === 'active') {
        where.status = 'claimed';
      } else if (status === 'completed') {
        where.status = 'completed';
      } else if (status === 'forfeited') {
        where.status = 'expired';
      } else {
        where.status = status;
      }
    }

    const total = await prisma.userPromotion.count({ where });

    const userPromotions = await prisma.userPromotion.findMany({
      where,
      include: {
        promotion: true,
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: { claimedAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      playerBonuses: userPromotions.map(up => ({
        id: up.id,
        playerId: up.userId,
        playerEmail: up.user.email,
        bonusId: up.promotionId,
        bonusName: up.promotion.name,
        bonusType: up.promotion.type,
        amount: Number(up.bonusAmount || 0),
        wagered: Number(up.wageredAmount || 0),
        wageringTarget: Number(up.wageringTarget || 0),
        wageringReq: up.promotion.wageringRequirement || 1,
        progress: up.wageringTarget > 0 ? ((Number(up.wageredAmount) / Number(up.wageringTarget)) * 100).toFixed(2) : 100,
        status: up.status === 'claimed' ? 'active' : up.status,
        claimedAt: up.claimedAt,
        completedAt: up.completedAt,
        expiresAt: up.expiresAt
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

    const user = await prisma.user.findUnique({
      where: { id: playerId },
      include: { wallet: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Player not found' });
    }

    let promotion;
    if (bonusId) {
      promotion = await prisma.promotion.findUnique({
        where: { id: bonusId }
      });
      if (!promotion) {
        return res.status(404).json({ error: 'Bonus not found' });
      }
    }

    const bonusAmount = amount || (promotion ? Number(promotion.bonusAmountUsdc) : 0);
    const target = wageringTarget || (promotion ? bonusAmount * (promotion.wageringRequirement || 1) : bonusAmount);

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const userPromotion = await prisma.userPromotion.create({
      data: {
        userId: playerId,
        promotionId: bonusId || null,
        bonusAmount: bonusAmount,
        wageringTarget: target,
        status: 'claimed',
        claimedAt: new Date(),
        expiresAt
      }
    });

    // Update wallet bonus balance
    if (user.wallet) {
      await prisma.wallet.update({
        where: { id: user.wallet.id },
        data: {
          bonusBalance: {
            increment: bonusAmount
          }
        }
      });
    }

    // Add audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin?.id || 'system',
        action: 'award_bonus',
        entityType: 'user',
        entityId: playerId,
        newValues: {
          userPromotionId: userPromotion.id,
          amount: bonusAmount,
          wageringTarget: target
        },
        reason: `Manual bonus awarded: $${bonusAmount} (wagering: ${target})`
      }
    });

    res.status(201).json({
      message: 'Bonus awarded',
      playerBonusId: userPromotion.id
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

    const userPromotion = await prisma.userPromotion.findFirst({
      where: {
        id: playerBonusId,
        status: 'claimed'
      },
      include: {
        user: {
          include: { wallet: true }
        }
      }
    });

    if (!userPromotion) {
      return res.status(404).json({ error: 'Active bonus not found' });
    }

    await prisma.userPromotion.update({
      where: { id: playerBonusId },
      data: { status: 'expired' }
    });

    // Calculate remaining bonus amount
    const progress = Number(userPromotion.wageringTarget) > 0
      ? Number(userPromotion.wageredAmount) / Number(userPromotion.wageringTarget)
      : 0;
    const remaining = Number(userPromotion.bonusAmount) * (1 - progress);

    // Deduct remaining bonus from wallet
    if (remaining > 0 && userPromotion.user.wallet) {
      await prisma.wallet.update({
        where: { id: userPromotion.user.wallet.id },
        data: {
          bonusBalance: {
            decrement: remaining
          }
        }
      });
    }

    // Add audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin?.id || 'system',
        action: 'cancel_bonus',
        entityType: 'user',
        entityId: userPromotion.userId,
        oldValues: {
          userPromotionId: playerBonusId,
          status: 'claimed'
        },
        newValues: {
          status: 'expired'
        },
        reason: `Bonus cancelled. Reason: ${reason}`
      }
    });

    res.json({ message: 'Bonus cancelled' });
  } catch (error) {
    console.error('Cancel bonus error:', error);
    res.status(500).json({ error: 'Failed to cancel bonus' });
  }
};

const getBonusStats = async (req, res) => {
  try {
    const activeBonuses = await prisma.promotion.count({
      where: { isActive: true }
    });

    const activePlayerBonuses = await prisma.userPromotion.count({
      where: { status: 'claimed' }
    });

    const bonusAggregates = await prisma.userPromotion.aggregate({
      _sum: {
        bonusAmount: true,
        wageredAmount: true
      }
    });

    const completedBonusAggregates = await prisma.userPromotion.aggregate({
      where: { status: 'completed' },
      _sum: {
        bonusAmount: true
      }
    });

    const avgCompletionData = await prisma.userPromotion.findMany({
      where: {
        wageringTarget: { gt: 0 }
      },
      select: {
        wageredAmount: true,
        wageringTarget: true
      }
    });

    const avgCompletionRate = avgCompletionData.length > 0
      ? avgCompletionData.reduce((sum, item) => {
        return sum + (Number(item.wageredAmount) / Number(item.wageringTarget) * 100);
      }, 0) / avgCompletionData.length
      : 0;

    res.json({
      stats: {
        active_bonuses: activeBonuses,
        active_player_bonuses: activePlayerBonuses,
        total_bonus_given: Number(bonusAggregates._sum.bonusAmount || 0),
        total_bonus_completed: Number(completedBonusAggregates._sum.bonusAmount || 0),
        total_wagered_on_bonuses: Number(bonusAggregates._sum.wageredAmount || 0),
        avg_completion_rate: avgCompletionRate
      }
    });
  } catch (error) {
    console.error('Get bonus stats error:', error);
    res.status(500).json({ error: 'Failed to load bonus stats' });
  }
};

// Reset wagering requirement for a player's bonus
const resetWageringRequirement = async (req, res) => {
  try {
    const { playerBonusId } = req.params;
    const { reason, newWageringTarget } = req.body;

    const userPromotion = await prisma.userPromotion.findUnique({
      where: { id: playerBonusId },
      include: {
        user: { select: { email: true } },
        promotion: true
      }
    });

    if (!userPromotion) {
      return res.status(404).json({ error: 'Player bonus not found' });
    }

    if (userPromotion.status !== 'claimed') {
      return res.status(400).json({ error: 'Can only reset wagering for active bonuses' });
    }

    const oldWageringTarget = userPromotion.wageringTarget;
    const oldWageredAmount = userPromotion.wageredAmount;

    // If newWageringTarget is provided, use it; otherwise reset to 0 (complete the bonus)
    const updatedWageringTarget = newWageringTarget !== undefined
      ? parseFloat(newWageringTarget)
      : Number(userPromotion.wageredAmount); // Set target to already wagered amount to complete

    await prisma.userPromotion.update({
      where: { id: playerBonusId },
      data: {
        wageringTarget: updatedWageringTarget,
        status: updatedWageringTarget <= Number(userPromotion.wageredAmount) ? 'completed' : 'claimed',
        completedAt: updatedWageringTarget <= Number(userPromotion.wageredAmount) ? new Date() : null
      }
    });

    // Add audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin?.id || 'system',
        action: 'reset_wagering',
        entityType: 'user_promotion',
        entityId: playerBonusId,
        oldValues: {
          wageringTarget: Number(oldWageringTarget),
          wageredAmount: Number(oldWageredAmount)
        },
        newValues: {
          wageringTarget: updatedWageringTarget,
          status: updatedWageringTarget <= Number(userPromotion.wageredAmount) ? 'completed' : 'claimed'
        },
        reason: reason || 'Wagering requirement reset by admin'
      }
    });

    res.json({
      message: 'Wagering requirement reset successfully',
      newWageringTarget: updatedWageringTarget,
      isCompleted: updatedWageringTarget <= Number(userPromotion.wageredAmount)
    });
  } catch (error) {
    console.error('Reset wagering error:', error);
    res.status(500).json({ error: 'Failed to reset wagering requirement' });
  }
};

// Get available currencies for bonuses
const getAvailableCurrencies = async (req, res) => {
  try {
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
      { code: 'USDC', name: 'USD Coin', symbol: '$' },
      { code: 'USDT', name: 'Tether', symbol: '$' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
      { code: 'THB', name: 'Thai Baht', symbol: '฿' }
    ];
    res.json({ currencies });
  } catch (error) {
    console.error('Get currencies error:', error);
    res.status(500).json({ error: 'Failed to load currencies' });
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
  getBonusStats,
  resetWageringRequirement,
  getAvailableCurrencies
};
