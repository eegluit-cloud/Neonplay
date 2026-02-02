const prisma = require('../lib/prisma');
const { Parser } = require('json2csv');

// Helper function to format dates for grouping
const groupByPeriod = (data, dateField, groupBy = 'day') => {
  const grouped = {};

  data.forEach(item => {
    const date = new Date(item[dateField]);
    let key;

    switch (groupBy) {
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case 'week':
        const weekNum = Math.ceil(((date - new Date(date.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default: // day
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return grouped;
};

// Transaction Reports
const getTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, type, status, groupBy = 'day' } = req.query;

    const where = {};

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        amount: true,
        status: true,
        createdAt: true
      }
    });

    // Group by period and type
    const periodGroups = groupByPeriod(transactions, 'createdAt', groupBy);
    const data = [];

    Object.entries(periodGroups).forEach(([period, txs]) => {
      const typeGroups = {};

      txs.forEach(tx => {
        if (!typeGroups[tx.type]) {
          typeGroups[tx.type] = {
            period,
            type: tx.type,
            count: 0,
            total_amount: 0,
            completed_amount: 0,
            pending_amount: 0
          };
        }

        typeGroups[tx.type].count++;
        typeGroups[tx.type].total_amount += Number(tx.amount);

        if (tx.status === 'completed' || tx.status === 'approved') {
          typeGroups[tx.type].completed_amount += Number(tx.amount);
        } else if (tx.status === 'pending') {
          typeGroups[tx.type].pending_amount += Number(tx.amount);
        }
      });

      data.push(...Object.values(typeGroups));
    });

    // Summary
    const summaryData = {};
    transactions.forEach(tx => {
      if (!summaryData[tx.type]) {
        summaryData[tx.type] = {
          type: tx.type,
          count: 0,
          total: 0,
          completed: 0,
          pending: 0,
          failed: 0
        };
      }

      summaryData[tx.type].count++;
      summaryData[tx.type].total += Number(tx.amount);

      if (tx.status === 'completed' || tx.status === 'approved') {
        summaryData[tx.type].completed += Number(tx.amount);
      } else if (tx.status === 'pending') {
        summaryData[tx.type].pending += Number(tx.amount);
      } else if (tx.status === 'rejected' || tx.status === 'cancelled') {
        summaryData[tx.type].failed += Number(tx.amount);
      }
    });

    res.json({
      data: data.sort((a, b) => b.period.localeCompare(a.period)),
      summary: Object.values(summaryData)
    });
  } catch (error) {
    console.error('Transaction report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Banking Reports
const getBankingReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      type: { in: ['deposit', 'withdrawal'] }
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        type: true,
        status: true,
        amount: true,
        referenceType: true
      }
    });

    // By payment method (using referenceType as proxy)
    const byPaymentMethod = {};
    transactions.forEach(tx => {
      const key = `${tx.referenceType || 'unknown'}-${tx.type}`;
      if (!byPaymentMethod[key]) {
        byPaymentMethod[key] = {
          payment_method: tx.referenceType || 'unknown',
          type: tx.type,
          count: 0,
          total: 0,
          successful: 0,
          failed: 0
        };
      }

      byPaymentMethod[key].count++;
      byPaymentMethod[key].total += Number(tx.amount);

      if (tx.status === 'completed' || tx.status === 'approved') {
        byPaymentMethod[key].successful++;
      } else if (tx.status === 'failed' || tx.status === 'rejected') {
        byPaymentMethod[key].failed++;
      }
    });

    // Success rate
    const successRate = {};
    transactions.forEach(tx => {
      if (!successRate[tx.type]) {
        successRate[tx.type] = {
          type: tx.type,
          total: 0,
          successful: 0,
          rate: 0
        };
      }

      successRate[tx.type].total++;
      if (tx.status === 'completed' || tx.status === 'approved') {
        successRate[tx.type].successful++;
      }
    });

    Object.values(successRate).forEach(sr => {
      sr.rate = sr.total > 0 ? ((sr.successful / sr.total) * 100).toFixed(2) : 0;
    });

    // Pending withdrawals
    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { status: 'pending' },
      _count: true,
      _sum: { amount: true }
    });

    res.json({
      byPaymentMethod: Object.values(byPaymentMethod),
      successRate: Object.values(successRate),
      pendingWithdrawals: {
        count: pendingWithdrawals._count || 0,
        total: Number(pendingWithdrawals._sum.amount || 0)
      }
    });
  } catch (error) {
    console.error('Banking report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Bonus Reports
const getBonusReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.claimedAt = {};
      if (startDate) where.claimedAt.gte = new Date(startDate);
      if (endDate) where.claimedAt.lte = new Date(endDate);
    }

    const userPromotions = await prisma.userPromotion.findMany({
      where,
      include: {
        promotion: true
      }
    });

    // By type
    const byType = {};
    userPromotions.forEach(up => {
      const type = up.promotion.type;
      if (!byType[type]) {
        byType[type] = {
          type,
          claims: 0,
          total_given: 0,
          total_wagered: 0,
          completed: 0,
          forfeited: 0
        };
      }

      byType[type].claims++;
      byType[type].total_given += Number(up.bonusAmount || 0);
      byType[type].total_wagered += Number(up.wageredAmount || 0);

      if (up.status === 'completed') byType[type].completed++;
      if (up.status === 'expired') byType[type].forfeited++;
    });

    // By individual bonus
    const byBonus = {};
    userPromotions.forEach(up => {
      const bonusId = up.promotionId;
      if (!byBonus[bonusId]) {
        byBonus[bonusId] = {
          name: up.promotion.name,
          type: up.promotion.type,
          claims: 0,
          total_given: 0,
          completion_sum: 0,
          count_for_avg: 0
        };
      }

      byBonus[bonusId].claims++;
      byBonus[bonusId].total_given += Number(up.bonusAmount || 0);

      if (up.wageringTarget && Number(up.wageringTarget) > 0) {
        byBonus[bonusId].completion_sum += (Number(up.wageredAmount) / Number(up.wageringTarget)) * 100;
        byBonus[bonusId].count_for_avg++;
      }
    });

    const byBonusArray = Object.values(byBonus).map(b => ({
      name: b.name,
      type: b.type,
      claims: b.claims,
      total_given: b.total_given,
      avg_completion: b.count_for_avg > 0 ? (b.completion_sum / b.count_for_avg).toFixed(2) : 0
    })).sort((a, b) => b.claims - a.claims);

    // Cost summary
    const costSummary = {
      total_bonus_cost: 0,
      total_wagered: 0,
      completed_bonus_cost: 0
    };

    userPromotions.forEach(up => {
      costSummary.total_bonus_cost += Number(up.bonusAmount || 0);
      costSummary.total_wagered += Number(up.wageredAmount || 0);

      if (up.status === 'completed') {
        costSummary.completed_bonus_cost += Number(up.bonusAmount || 0);
      }
    });

    res.json({
      byType: Object.values(byType),
      byBonus: byBonusArray,
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
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        createdAt: true,
        isActive: true,
        isSuspended: true,
        identityVerifiedAt: true
      }
    });

    // New registrations over time
    const periodGroups = groupByPeriod(users, 'createdAt', groupBy);
    const registrations = Object.entries(periodGroups).map(([period, users]) => ({
      period,
      new_players: users.length
    })).sort((a, b) => b.period.localeCompare(a.period));

    // Status breakdown
    const allUsers = await prisma.user.findMany({
      select: {
        isActive: true,
        isSuspended: true
      }
    });

    const statusBreakdown = [
      { status: 'active', count: allUsers.filter(u => u.isActive && !u.isSuspended).length },
      { status: 'suspended', count: allUsers.filter(u => u.isSuspended).length },
      { status: 'inactive', count: allUsers.filter(u => !u.isActive).length }
    ];

    // KYC status breakdown
    const kycBreakdown = [
      { kyc_status: 'verified', count: allUsers.filter(u => u.identityVerifiedAt).length },
      { kyc_status: 'pending', count: allUsers.filter(u => !u.identityVerifiedAt).length }
    ];

    // Top players by lifetime value
    const topPlayers = await prisma.user.findMany({
      include: {
        wallet: true,
        transactions: {
          where: {
            OR: [
              { type: 'deposit', status: 'completed' },
              { type: 'withdrawal', status: { in: ['completed', 'approved'] } }
            ]
          },
          select: {
            type: true,
            amount: true
          }
        }
      },
      take: 20
    });

    const topPlayersData = topPlayers.map(p => {
      const totalDeposits = p.transactions
        .filter(t => t.type === 'deposit')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalWithdrawals = p.transactions
        .filter(t => t.type === 'withdrawal')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        id: p.id,
        email: p.email,
        name: `${p.firstName || ''} ${p.lastName || ''}`.trim(),
        totalDeposits,
        totalWithdrawals,
        lifetimeValue: totalDeposits - totalWithdrawals
      };
    }).sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 20);

    // Active players (simplified - based on recent transactions)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activePlayersCount = await prisma.gameRound.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      distinct: ['userId']
    });

    const totalPlayers = await prisma.user.count();

    res.json({
      registrations,
      statusBreakdown,
      kycBreakdown,
      topPlayers: topPlayersData,
      activePlayersCount: activePlayersCount.length,
      totalPlayers
    });
  } catch (error) {
    console.error('Player report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Game Reports
const getGameReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const gameRounds = await prisma.gameRound.findMany({
      where,
      include: {
        game: {
          include: {
            provider: {
              include: {
                aggregator: true
              }
            }
          }
        }
      }
    });

    // Most played games
    const gameStats = {};
    gameRounds.forEach(gr => {
      const gameId = gr.gameId;
      if (!gameStats[gameId]) {
        gameStats[gameId] = {
          id: gameId,
          name: gr.game.name,
          provider_name: gr.game.provider.name,
          plays: 0,
          total_bets: 0,
          total_wins: 0,
          unique_players: new Set()
        };
      }

      gameStats[gameId].plays++;
      gameStats[gameId].total_bets += Number(gr.betAmountUsdc || 0);
      gameStats[gameId].total_wins += Number(gr.winAmountUsdc || 0);
      gameStats[gameId].unique_players.add(gr.userId);
    });

    const topGames = Object.values(gameStats).map(g => ({
      id: g.id,
      name: g.name,
      providerName: g.provider_name,
      plays: g.plays,
      totalBets: g.total_bets,
      totalWins: g.total_wins,
      ggr: g.total_bets - g.total_wins,
      uniquePlayers: g.unique_players.size
    })).sort((a, b) => b.plays - a.plays).slice(0, 20);

    // GGR by provider
    const providerStats = {};
    gameRounds.forEach(gr => {
      const providerId = gr.game.providerId;
      if (!providerStats[providerId]) {
        providerStats[providerId] = {
          provider_name: gr.game.provider.name,
          aggregator_name: gr.game.provider.aggregator?.name || 'Unknown',
          plays: 0,
          total_bets: 0,
          total_wins: 0
        };
      }

      providerStats[providerId].plays++;
      providerStats[providerId].total_bets += Number(gr.betAmountUsdc || 0);
      providerStats[providerId].total_wins += Number(gr.winAmountUsdc || 0);
    });

    const ggrByProvider = Object.values(providerStats).map(p => ({
      ...p,
      ggr: p.total_bets - p.total_wins
    })).sort((a, b) => b.ggr - a.ggr);

    // Overall GGR
    const overallGgr = gameRounds.reduce((acc, gr) => ({
      total_bets: acc.total_bets + Number(gr.betAmountUsdc || 0),
      total_wins: acc.total_wins + Number(gr.winAmountUsdc || 0),
      total_rounds: acc.total_rounds + 1,
      unique_players: acc.unique_players.add(gr.userId)
    }), {
      total_bets: 0,
      total_wins: 0,
      total_rounds: 0,
      unique_players: new Set()
    });

    res.json({
      topGames,
      ggrByProvider,
      overallGgr: {
        total_bets: overallGgr.total_bets,
        total_wins: overallGgr.total_wins,
        ggr: overallGgr.total_bets - overallGgr.total_wins,
        total_rounds: overallGgr.total_rounds,
        unique_players: overallGgr.unique_players.size
      }
    });
  } catch (error) {
    console.error('Game report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// Dashboard Summary
const getDashboardSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDeposits = await prisma.deposit.aggregate({
      where: {
        status: 'completed',
        createdAt: { gte: today }
      },
      _count: true,
      _sum: { usdcAmount: true }
    });

    const todayWithdrawals = await prisma.withdrawal.aggregate({
      where: {
        status: { in: ['completed', 'approved'] },
        createdAt: { gte: today }
      },
      _count: true,
      _sum: { usdcAmount: true }
    });

    const todayNewPlayers = await prisma.user.count({
      where: { createdAt: { gte: today } }
    });

    const todayGameRounds = await prisma.gameRound.aggregate({
      where: { createdAt: { gte: today } },
      _sum: {
        betAmountUsdc: true,
        winAmountUsdc: true
      }
    });

    const pendingWithdrawals = await prisma.withdrawal.aggregate({
      where: { status: 'pending' },
      _count: true,
      _sum: { usdcAmount: true }
    });

    const pendingKyc = await prisma.user.count({
      where: {
        identityVerifiedAt: null,
        isActive: true
      }
    });

    const totalPlayers = await prisma.user.count();

    const walletAggregates = await prisma.wallet.aggregate({
      _sum: {
        usdBalance: true,
        lifetimeBonuses: true
      }
    });

    // Last 7 days deposits
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysDepositsData = await prisma.deposit.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: sevenDaysAgo }
      },
      select: {
        usdcAmount: true,
        createdAt: true
      }
    });

    const depositsByDay = {};
    last7DaysDepositsData.forEach(d => {
      const date = new Date(d.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      depositsByDay[key] = (depositsByDay[key] || 0) + Number(d.usdcAmount);
    });

    const last7DaysDeposits = Object.entries(depositsByDay).map(([date, total]) => ({
      date,
      total
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Last 7 days GGR
    const last7DaysGgrData = await prisma.gameRound.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: {
        betAmountUsdc: true,
        winAmountUsdc: true,
        createdAt: true
      }
    });

    const ggrByDay = {};
    last7DaysGgrData.forEach(gr => {
      const date = new Date(gr.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      if (!ggrByDay[key]) ggrByDay[key] = 0;
      ggrByDay[key] += Number(gr.betAmountUsdc || 0) - Number(gr.winAmountUsdc || 0);
    });

    const last7DaysGgr = Object.entries(ggrByDay).map(([date, ggr]) => ({
      date,
      ggr
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      summary: {
        todayDeposits: {
          count: todayDeposits._count || 0,
          total: Number(todayDeposits._sum.usdcAmount || 0)
        },
        todayWithdrawals: {
          count: todayWithdrawals._count || 0,
          total: Number(todayWithdrawals._sum.usdcAmount || 0)
        },
        todayNewPlayers: { count: todayNewPlayers },
        todayGgr: {
          ggr: Number(todayGameRounds._sum.betAmountUsdc || 0) - Number(todayGameRounds._sum.winAmountUsdc || 0)
        },
        pendingWithdrawals: {
          count: pendingWithdrawals._count || 0,
          total: Number(pendingWithdrawals._sum.usdcAmount || 0)
        },
        pendingKyc: { count: pendingKyc },
        totalPlayers: { count: totalPlayers },
        totalBalance: { total: Number(walletAggregates._sum.usdBalance || 0) },
        totalBonusBalance: { total: Number(walletAggregates._sum.lifetimeBonuses || 0) },
        last7DaysDeposits,
        last7DaysGgr
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to load dashboard summary',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export to CSV
const exportToCsv = async (req, res) => {
  try {
    const { report, startDate, endDate } = req.query;

    let data;
    let filename;

    const dateWhere = {};
    if (startDate) dateWhere.gte = new Date(startDate);
    if (endDate) dateWhere.lte = new Date(endDate);

    switch (report) {
      case 'transactions':
        const transactions = await prisma.transaction.findMany({
          where: { createdAt: dateWhere },
          include: {
            user: { select: { email: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        data = transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          status: t.status,
          payment_method: t.referenceType || '',
          reference: t.referenceId || '',
          created_at: t.createdAt,
          player_email: t.user?.email || ''
        }));
        filename = 'transactions';
        break;

      case 'players':
        const players = await prisma.user.findMany({
          where: { createdAt: dateWhere },
          include: { wallet: true },
          orderBy: { createdAt: 'desc' }
        });

        data = players.map(p => ({
          id: p.id,
          email: p.email,
          first_name: p.firstName || '',
          last_name: p.lastName || '',
          phone: p.phone || '',
          balance: Number(p.wallet?.usdBalance || 0),
          bonus_balance: Number(p.wallet?.bonusBalance || 0),
          status: p.isSuspended ? 'suspended' : p.isActive ? 'active' : 'inactive',
          kyc_status: p.identityVerifiedAt ? 'verified' : 'pending',
          created_at: p.createdAt
        }));
        filename = 'players';
        break;

      case 'game_history':
        const gameRounds = await prisma.gameRound.findMany({
          where: { createdAt: dateWhere },
          include: {
            user: { select: { email: true } },
            game: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        data = gameRounds.map(gr => ({
          id: gr.id,
          player_email: gr.user.email,
          game_name: gr.game.name,
          bet_amount: Number(gr.betAmountUsdc || 0),
          win_amount: Number(gr.winAmountUsdc || 0),
          created_at: gr.createdAt
        }));
        filename = 'game_history';
        break;

      case 'bonuses':
        const userPromotions = await prisma.userPromotion.findMany({
          where: { claimedAt: dateWhere },
          include: {
            user: { select: { email: true } },
            promotion: { select: { name: true, type: true } }
          },
          orderBy: { claimedAt: 'desc' }
        });

        data = userPromotions.map(up => ({
          id: up.id,
          player_email: up.user.email,
          bonus_name: up.promotion.name,
          type: up.promotion.type,
          amount: Number(up.bonusAmount || 0),
          wagered: Number(up.wageredAmount || 0),
          wagering_target: Number(up.wageringTarget || 0),
          status: up.status,
          claimed_at: up.claimedAt
        }));
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
