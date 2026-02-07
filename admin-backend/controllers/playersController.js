const prisma = require('../lib/prisma');

const getPlayers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status === 'active') {
      where.isActive = true;
      where.isSuspended = false;
    } else if (status === 'suspended') {
      where.isSuspended = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const total = await prisma.user.count({ where });

    const orderBy = {};
    orderBy[sortBy] = sortOrder.toLowerCase();

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        isSuspended: true,
        identityVerifiedAt: true,
        createdAt: true,
        wallet: {
          select: {
            usdBalance: true,
            eurBalance: true,
            primaryCurrency: true,
            lifetimeDeposited: true,
            lifetimeWithdrawn: true
          }
        }
      },
      orderBy,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      players: users.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        balance: Number(u.wallet?.usdBalance || 0),
        primaryCurrency: u.wallet?.primaryCurrency || 'USD',
        status: u.isSuspended ? 'suspended' : u.isActive ? 'active' : 'inactive',
        kycStatus: u.identityVerifiedAt ? 'verified' : 'pending',
        createdAt: u.createdAt
      })),
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

    const user = await prisma.user.findUnique({
      where: { id: playerId },
      include: {
        wallet: true,
        vip: {
          include: {
            tier: true
          }
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        userPromotions: {
          where: { status: 'active' },
          include: {
            promotion: true
          }
        },
        deposits: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        withdrawals: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Calculate stats from transactions
    const depositStats = await prisma.deposit.aggregate({
      where: { userId: playerId, status: 'completed' },
      _count: true,
      _sum: { usdcAmount: true }
    });

    const withdrawalStats = await prisma.withdrawal.aggregate({
      where: { userId: playerId, status: { in: ['completed', 'processing'] } },
      _count: true,
      _sum: { usdcAmount: true }
    });

    const gameStats = await prisma.gameRound.aggregate({
      where: { userId: playerId },
      _count: true,
      _sum: {
        betAmountUsdc: true,
        winAmountUsdc: true
      }
    });

    res.json({
      player: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        balance: Number(user.wallet?.usdBalance || 0),
        primaryCurrency: user.wallet?.primaryCurrency || 'USD',
        status: user.isSuspended ? 'suspended' : user.isActive ? 'active' : 'inactive',
        kycStatus: user.identityVerifiedAt ? 'verified' : 'pending',
        suspendedReason: user.suspendedReason,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        vipTier: user.vip?.tier?.name || 'None'
      },
      transactions: user.transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt
      })),
      bonuses: user.userPromotions.map(up => ({
        id: up.id,
        name: up.promotion.name,
        type: up.promotion.type,
        bonusAmount: Number(up.bonusAmount || 0),
        wageredAmount: Number(up.wageredAmount),
        wageringTarget: Number(up.wageringTarget || 0),
        status: up.status
      })),
      stats: {
        totalDeposits: depositStats._count || 0,
        depositTotal: Number(depositStats._sum.usdcAmount || 0),
        totalWithdrawals: withdrawalStats._count || 0,
        withdrawalTotal: Number(withdrawalStats._sum.usdcAmount || 0),
        totalBets: gameStats._count || 0,
        totalWagered: Number(gameStats._sum.betAmountUsdc || 0),
        totalWins: Number(gameStats._sum.winAmountUsdc || 0),
        ggr: Number(gameStats._sum.betAmountUsdc || 0) - Number(gameStats._sum.winAmountUsdc || 0)
      },
      notes: [] // TODO: Implement notes system in Prisma schema
    });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Failed to load player' });
  }
};

const updatePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { firstName, lastName, phone, dateOfBirth } = req.body;

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;
    if (dateOfBirth !== undefined) data.dateOfBirth = new Date(dateOfBirth);

    await prisma.user.update({
      where: { id: playerId },
      data
    });

    res.json({ message: 'Player updated successfully' });
  } catch (error) {
    console.error('Update player error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.status(500).json({ error: 'Failed to update player' });
  }
};

const updatePlayerStatus = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { status, reason } = req.body;

    const data = {};
    if (status === 'active') {
      data.isActive = true;
      data.isSuspended = false;
      data.suspendedReason = null;
    } else if (status === 'suspended' || status === 'blocked') {
      data.isActive = false;
      data.isSuspended = true;
      data.suspendedReason = reason || 'Admin action';
    } else if (status === 'inactive') {
      data.isActive = false;
      data.isSuspended = false;
    }

    await prisma.user.update({
      where: { id: playerId },
      data
    });

    // TODO: Log this action in admin audit log
    res.json({ message: `Player ${status} successfully` });
  } catch (error) {
    console.error('Update player status error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.status(500).json({ error: 'Failed to update player status' });
  }
};

const adjustBalance = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { amount, currency = 'USD', reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: playerId },
      include: { wallet: true }
    });

    if (!user || !user.wallet) {
      return res.status(404).json({ error: 'Player or wallet not found' });
    }

    // Determine which balance field to update based on currency
    const balanceField = `${currency.toLowerCase()}Balance`;
    const currentBalance = Number(user.wallet[balanceField] || 0);
    const newBalance = currentBalance + parseFloat(amount);

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Insufficient balance for this adjustment' });
    }

    // Update wallet balance
    const updateData = {};
    updateData[balanceField] = newBalance;

    await prisma.wallet.update({
      where: { id: user.wallet.id },
      data: updateData
    });

    // Create adjustment transaction
    await prisma.transaction.create({
      data: {
        userId: playerId,
        walletId: user.wallet.id,
        type: 'adjustment',
        currency: currency,
        amount: parseFloat(amount),
        usdcAmount: parseFloat(amount), // TODO: Apply proper exchange rate
        exchangeRate: 1,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        status: 'completed',
        metadata: { reason, adminId: req.admin?.id }
      }
    });

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

    // TODO: Implement notes in Prisma schema
    // For now, create an admin audit log entry
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'add_player_note',
        entityType: 'user',
        entityId: playerId,
        newValues: { note },
        reason: note
      }
    });

    res.status(201).json({
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

const getTags = async (req, res) => {
  try {
    // TODO: Implement tags system in Prisma schema
    res.json({ tags: [] });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to load tags' });
  }
};

const createTag = async (req, res) => {
  try {
    // TODO: Implement tags system in Prisma schema
    res.status(201).json({ message: 'Tag created successfully' });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};

const assignTag = async (req, res) => {
  try {
    // TODO: Implement tags system in Prisma schema
    res.json({ message: 'Tag assigned successfully' });
  } catch (error) {
    console.error('Assign tag error:', error);
    res.status(500).json({ error: 'Failed to assign tag' });
  }
};

const removeTag = async (req, res) => {
  try {
    // TODO: Implement tags system in Prisma schema
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

    const where = { userId: playerId };
    if (type) where.type = type;
    if (status) where.status = status;

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        currency: t.currency,
        status: t.status,
        referenceType: t.referenceType,
        referenceId: t.referenceId,
        reference: t.referenceId,
        createdAt: t.createdAt
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

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: transactionId },
      include: { user: { include: { wallet: true } } }
    });

    if (!withdrawal || withdrawal.status !== 'pending') {
      return res.status(404).json({ error: 'Pending withdrawal not found' });
    }

    if (action === 'approve') {
      await prisma.withdrawal.update({
        where: { id: transactionId },
        data: {
          status: 'processing',
          processedBy: req.admin?.id,
          processedAt: new Date(),
          rejectionReason: notes
        }
      });

      res.json({ message: 'Withdrawal approved' });
    } else if (action === 'reject') {
      // Return funds to player
      const balanceField = `${withdrawal.currency.toLowerCase()}Balance`;
      const currentBalance = Number(withdrawal.user.wallet[balanceField] || 0);

      const updateData = {};
      updateData[balanceField] = currentBalance + Number(withdrawal.amount);

      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: withdrawal.user.wallet.id },
          data: updateData
        }),
        prisma.withdrawal.update({
          where: { id: transactionId },
          data: {
            status: 'rejected',
            processedBy: req.admin?.id,
            processedAt: new Date(),
            rejectionReason: notes
          }
        })
      ]);

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
