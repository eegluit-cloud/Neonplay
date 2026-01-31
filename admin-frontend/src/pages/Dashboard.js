import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardStats, players, transactions, kycDocuments, games, providers, playerBonuses, bonuses } from '../data/staticData';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { admin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('7');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = () => {
    const totalBalance = players.reduce((sum, p) => sum + p.balance, 0);
    const totalBonusBalance = players.reduce((sum, p) => sum + p.bonusBalance, 0);
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending');
    const pendingKyc = kycDocuments.filter(k => k.status === 'pending');
    const activeBonuses = playerBonuses.filter(pb => pb.status === 'active');
    const activePlayers = players.filter(p => p.status === 'active');
    const blockedPlayers = players.filter(p => p.status === 'blocked');
    const verifiedPlayers = players.filter(p => p.kycStatus === 'verified');

    const topGames = [...games]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 5);

    const totalGGR = games.reduce((sum, g) => sum + ((g.totalBets || 0) - (g.totalWins || 0)), 0);
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total bets for rebates
    const totalBets = games.reduce((sum, g) => sum + (g.totalBets || 0), 0);
    const totalBonusCost = activeBonuses.reduce((sum, b) => sum + (b.currentAmount || 0), 0) + totalBonusBalance;
    const totalRebates = totalBets * 0.005; // 0.5% rebate on total bets
    const totalNGR = totalGGR - totalBonusCost - totalRebates;

    // Calculate conversion rates
    const depositConversion = (transactions.filter(t => t.type === 'deposit').length / players.length * 100).toFixed(1);
    const kycConversion = (verifiedPlayers.length / players.length * 100).toFixed(1);

    // Recent activity from transactions
    const recentTx = [...transactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        player: players.find(p => p.id === tx.playerId)?.email || 'Unknown',
        time: tx.createdAt,
        status: tx.status
      }));
    setRecentActivity(recentTx);

    setData({
      todayDeposits: { total: dashboardStats.today.deposits, count: 5 },
      todayWithdrawals: { total: dashboardStats.today.withdrawals, count: 2 },
      todayGgr: { ggr: dashboardStats.today.ggr },
      todayNewPlayers: { count: dashboardStats.today.newPlayers },
      pendingWithdrawals: { count: pendingWithdrawals.length, total: pendingWithdrawals.reduce((sum, t) => sum + t.amount, 0) },
      pendingKyc: { count: pendingKyc.length },
      totalPlayers: { count: players.length },
      activePlayers: { count: activePlayers.length },
      blockedPlayers: { count: blockedPlayers.length },
      verifiedPlayers: { count: verifiedPlayers.length },
      totalBalance: { total: totalBalance },
      totalBonusBalance: { total: totalBonusBalance },
      activeBonuses: { count: activeBonuses.length },
      totalActiveBonuses: bonuses.filter(b => b.status === 'active').length,
      totalGames: games.length,
      activeGames: games.filter(g => g.status === 'active').length,
      totalProviders: providers.length,
      activeProviders: providers.filter(p => p.status === 'active').length,
      topGames: topGames,
      totalGGR: totalGGR,
      totalNGR: totalNGR,
      totalRebates: totalRebates,
      totalDeposits: totalDeposits,
      totalWithdrawals: totalWithdrawals,
      netCashflow: totalDeposits - totalWithdrawals,
      depositConversion,
      kycConversion,
      avgPlayerBalance: (totalBalance / players.length).toFixed(2),
      last7DaysDeposits: dashboardStats.trends.map(t => ({ date: t.date, total: t.deposits })),
      last7DaysGgr: dashboardStats.trends.map(t => ({ date: t.date, ggr: t.ggr }))
    });
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTotalAlerts = () => {
    if (!data) return 0;
    return (data.pendingWithdrawals?.count || 0) + (data.pendingKyc?.count || 0);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Dashboard
          </div>
          <h1 className="welcome-title">{getGreeting()}, {admin?.firstName || 'Admin'}</h1>
          <p className="welcome-subtitle">Here's what's happening in your casino today</p>
        </div>
        {getTotalAlerts() > 0 && (
          <div className="alert-badge">
            <div className="alert-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span className="alert-count">{getTotalAlerts()}</span>
            </div>
            <div className="alert-text">
              <strong>Items need attention</strong>
              <span>{data?.pendingWithdrawals?.count} withdrawals, {data?.pendingKyc?.count} KYC</span>
            </div>
            <Link to="/kyc" className="btn btn-sm btn-secondary">Review</Link>
          </div>
        )}
      </div>

      {/* System Status Bar */}
      <div className="system-status-bar">
        <div className="status-item">
          <div className="status-indicator online"></div>
          <span>Platform Status: <strong>Online</strong></span>
        </div>
        <div className="status-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
          <span>Active Players: <strong>{data?.activePlayers?.count}</strong></span>
        </div>
        <div className="status-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <span>Active Games: <strong>{data?.activeGames}/{data?.totalGames}</strong></span>
        </div>
        <div className="status-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          </svg>
          <span>Providers: <strong>{data?.activeProviders}/{data?.totalProviders}</strong></span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-row">
        <Link to="/players" className="quick-action-btn">
          <div className="quick-action-icon blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
            </svg>
          </div>
          <span>Review Withdrawals</span>
          {data?.pendingWithdrawals?.count > 0 && <span className="action-badge">{data.pendingWithdrawals.count}</span>}
        </Link>
        <Link to="/kyc" className="quick-action-btn">
          <div className="quick-action-icon cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <span>Pending KYC</span>
          {data?.pendingKyc?.count > 0 && <span className="action-badge">{data.pendingKyc.count}</span>}
        </Link>
        <Link to="/players" className="quick-action-btn">
          <div className="quick-action-icon red">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <span>Risk Alerts</span>
        </Link>
        <Link to="/bonuses" className="quick-action-btn">
          <div className="quick-action-icon green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/>
            </svg>
          </div>
          <span>Manage Bonuses</span>
          <span className="action-badge success">{data?.totalActiveBonuses}</span>
        </Link>
        <Link to="/games" className="quick-action-btn">
          <div className="quick-action-icon purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <span>Game Management</span>
        </Link>
        <Link to="/reports" className="quick-action-btn">
          <div className="quick-action-icon orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <span>View Reports</span>
        </Link>
      </div>

      {/* Key Metrics Section */}
      <div className="section-header">
        <h2 className="section-title">Key Metrics</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Players</span>
            <div className="metric-icon blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">{data?.totalPlayers?.count?.toLocaleString()}</div>
          <div className="metric-change positive">+12.5% vs yesterday</div>
          <div className="metric-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="var(--primary)" strokeWidth="2" points="0,25 20,20 40,22 60,15 80,18 100,10"/></svg></div>
        </div>

        <div className="metric-card highlight">
          <div className="metric-header">
            <span className="metric-label">Today's Revenue</span>
            <div className="metric-icon green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">{formatCurrency(data?.todayGgr?.ggr)}</div>
          <div className="metric-change positive">+8.3% vs yesterday</div>
          <div className="metric-sparkline green"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="var(--success)" strokeWidth="2" points="0,20 20,18 40,25 60,15 80,12 100,8"/></svg></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Today's Deposits</span>
            <div className="metric-icon cyan">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">{formatCurrency(data?.todayDeposits?.total)}</div>
          <div className="metric-change positive">+5.2% vs yesterday</div>
          <div className="metric-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="var(--secondary)" strokeWidth="2" points="0,22 20,18 40,20 60,12 80,15 100,8"/></svg></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Today's Withdrawals</span>
            <div className="metric-icon orange">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">{formatCurrency(data?.todayWithdrawals?.total)}</div>
          <div className="metric-change negative">-3.1% vs yesterday</div>
          <div className="metric-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="var(--warning)" strokeWidth="2" points="0,10 20,15 40,12 60,18 80,20 100,22"/></svg></div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total GGR</span>
            <div className="metric-icon red">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">{formatCurrency(data?.totalGGR)}</div>
          <div className="metric-change positive">+12.4% vs last month</div>
          <div className="metric-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="var(--danger)" strokeWidth="2" points="0,25 20,22 40,18 60,15 80,12 100,8"/></svg></div>
        </div>

        <div className="metric-card highlight-teal">
          <div className="metric-header">
            <span className="metric-label">Total NGR</span>
            <div className="metric-icon teal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <div className="metric-value">{formatCurrency(data?.totalNGR)}</div>
          <div className="metric-change positive">+9.8% vs last month</div>
          <div className="metric-sparkline"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline fill="none" stroke="var(--primary)" strokeWidth="2" points="0,22 20,20 40,16 60,14 80,10 100,6"/></svg></div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="metrics-grid secondary">
        <div className="metric-card-sm">
          <div className="metric-icon-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div><span className="metric-label-sm">Pending KYC</span><div className="metric-value-sm">{data?.pendingKyc?.count?.toLocaleString()}</div></div>
        </div>
        <div className="metric-card-sm">
          <div className="metric-icon-sm warning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            </svg>
          </div>
          <div><span className="metric-label-sm">Pending Withdrawals</span><div className="metric-value-sm">{data?.pendingWithdrawals?.count}</div></div>
        </div>
        <div className="metric-card-sm">
          <div className="metric-icon-sm success">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/>
            </svg>
          </div>
          <div><span className="metric-label-sm">Active Bonuses</span><div className="metric-value-sm">{data?.activeBonuses?.count}</div></div>
        </div>
        <div className="metric-card-sm">
          <div className="metric-icon-sm purple">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
            </svg>
          </div>
          <div><span className="metric-label-sm">Total Games</span><div className="metric-value-sm">{data?.totalGames}</div></div>
        </div>
      </div>

      {/* Revenue & Games Section */}
      <div className="section-header"><h2 className="section-title">Revenue & Games</h2></div>

      <div className="revenue-games-grid">
        <div className="card revenue-card">
          <div className="card-header">
            <div><h3 className="card-title">Revenue Overview</h3><p className="card-subtitle">GGR and deposits over time</p></div>
            <div className="period-selector">
              <button className={`period-btn ${chartPeriod === '7' ? 'active' : ''}`} onClick={() => setChartPeriod('7')}>7 Days</button>
              <button className={`period-btn ${chartPeriod === '14' ? 'active' : ''}`} onClick={() => setChartPeriod('14')}>14 Days</button>
              <button className={`period-btn ${chartPeriod === '30' ? 'active' : ''}`} onClick={() => setChartPeriod('30')}>30 Days</button>
            </div>
          </div>
          <div className="revenue-summary">
            <div className="revenue-stat">
              <div className="revenue-stat-icon green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              </div>
              <div><span className="revenue-stat-label">Total GGR</span><div className="revenue-stat-value">{formatCurrency(data?.totalGGR)}</div><span className="revenue-stat-change positive">+12.4%</span></div>
            </div>
            <div className="revenue-stat">
              <div className="revenue-stat-icon blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              </div>
              <div><span className="revenue-stat-label">Total Deposits</span><div className="revenue-stat-value">{formatCurrency(data?.totalDeposits)}</div><span className="revenue-stat-change positive">+8.7%</span></div>
            </div>
          </div>
          <div className="chart-container">
            {data?.last7DaysDeposits?.length > 0 ? (
              <div className="bar-chart">
                {data.last7DaysDeposits.map((day, i) => (
                  <div key={i} className="bar-chart-column">
                    <div className="bar" style={{ height: `${Math.max(10, (day.total / Math.max(...data.last7DaysDeposits.map(d => d.total))) * 100)}%` }}></div>
                    <span className="bar-label">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state">No data</div>}
          </div>
        </div>

        <div className="card top-games-card">
          <div className="card-header">
            <div><h3 className="card-title">Top Games</h3><p className="card-subtitle">Real-time performance</p></div>
            <Link to="/games" className="view-all-link">View All</Link>
          </div>
          <div className="top-games-list">
            {data?.topGames?.map((game, index) => (
              <div key={game.id} className="top-game-item">
                <div className="top-game-rank">{index + 1}</div>
                <div className="top-game-thumb">
                  <img src={game.thumbnail} alt={game.name} onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/40x40/1a1a2e/10b981?text=${index + 1}`; }}/>
                </div>
                <div className="top-game-info"><div className="top-game-name">{game.name}</div><div className="top-game-provider">{game.providerName}</div></div>
                <div className="top-game-stats"><div className="top-game-revenue">{formatCurrency((game.totalBets || 0) - (game.totalWins || 0))}</div><div className="top-game-bets">{(game.playCount || 0).toLocaleString()} bets</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial & Activity Section */}
      <div className="section-header"><h2 className="section-title">Financial Overview & Activity</h2></div>

      <div className="dashboard-bottom-grid">
        {/* Financial Summary */}
        <div className="card financial-summary-card">
          <div className="card-header">
            <div><h3 className="card-title">Financial Summary</h3><p className="card-subtitle">All-time balances</p></div>
          </div>
          <div className="financial-stats">
            <div className="financial-stat">
              <div className="financial-stat-icon green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="financial-stat-info">
                <span className="financial-stat-label">Total Deposits</span>
                <span className="financial-stat-value">{formatCurrency(data?.totalDeposits)}</span>
              </div>
            </div>
            <div className="financial-stat">
              <div className="financial-stat-icon orange">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div className="financial-stat-info">
                <span className="financial-stat-label">Total Withdrawals</span>
                <span className="financial-stat-value">{formatCurrency(data?.totalWithdrawals)}</span>
              </div>
            </div>
            <div className="financial-stat highlight">
              <div className="financial-stat-icon teal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="financial-stat-info">
                <span className="financial-stat-label">Net Cashflow</span>
                <span className="financial-stat-value positive">{formatCurrency(data?.netCashflow)}</span>
              </div>
            </div>
            <div className="financial-stat">
              <div className="financial-stat-icon blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="financial-stat-info">
                <span className="financial-stat-label">Player Balances</span>
                <span className="financial-stat-value">{formatCurrency(data?.totalBalance?.total)}</span>
              </div>
            </div>
            <div className="financial-stat">
              <div className="financial-stat-icon purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                </svg>
              </div>
              <div className="financial-stat-info">
                <span className="financial-stat-label">Bonus Liability</span>
                <span className="financial-stat-value">{formatCurrency(data?.totalBonusBalance?.total)}</span>
              </div>
            </div>
            <div className="financial-stat">
              <div className="financial-stat-icon cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12l10-10 10 10"/>
                </svg>
              </div>
              <div className="financial-stat-info">
                <span className="financial-stat-label">Avg. Balance</span>
                <span className="financial-stat-value">{formatCurrency(data?.avgPlayerBalance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card recent-activity-card">
          <div className="card-header">
            <div><h3 className="card-title">Recent Activity</h3><p className="card-subtitle">Latest transactions</p></div>
            <Link to="/reports" className="view-all-link">View All</Link>
          </div>
          <div className="activity-feed">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-feed-item">
                <div className={`activity-feed-icon ${activity.type}`}>
                  {activity.type === 'deposit' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  )}
                  {activity.type === 'withdrawal' && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  )}
                  {(activity.type === 'bet' || activity.type === 'win') && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                  )}
                </div>
                <div className="activity-feed-content">
                  <div className="activity-feed-title">
                    <span className="activity-type">{activity.type}</span>
                    <span className={`activity-amount ${activity.type === 'deposit' || activity.type === 'win' ? 'positive' : 'negative'}`}>
                      {activity.type === 'deposit' || activity.type === 'win' ? '+' : '-'}{formatCurrency(activity.amount)}
                    </span>
                  </div>
                  <div className="activity-feed-meta">
                    <span>{activity.player}</span>
                    <span className={`activity-status ${activity.status}`}>{activity.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="card conversion-card">
          <div className="card-header">
            <div><h3 className="card-title">Conversion Metrics</h3><p className="card-subtitle">Player funnel</p></div>
          </div>
          <div className="conversion-metrics">
            <div className="conversion-metric">
              <div className="conversion-label">Total Registered</div>
              <div className="conversion-value">{data?.totalPlayers?.count}</div>
              <div className="conversion-bar"><div className="conversion-fill" style={{width: '100%'}}></div></div>
            </div>
            <div className="conversion-metric">
              <div className="conversion-label">Active Players</div>
              <div className="conversion-value">{data?.activePlayers?.count}</div>
              <div className="conversion-bar"><div className="conversion-fill" style={{width: `${(data?.activePlayers?.count / data?.totalPlayers?.count) * 100}%`}}></div></div>
            </div>
            <div className="conversion-metric">
              <div className="conversion-label">KYC Verified</div>
              <div className="conversion-value">{data?.verifiedPlayers?.count} <span className="conversion-rate">({data?.kycConversion}%)</span></div>
              <div className="conversion-bar"><div className="conversion-fill green" style={{width: `${data?.kycConversion}%`}}></div></div>
            </div>
            <div className="conversion-metric">
              <div className="conversion-label">Made Deposit</div>
              <div className="conversion-value"><span className="conversion-rate">{data?.depositConversion}%</span></div>
              <div className="conversion-bar"><div className="conversion-fill blue" style={{width: `${data?.depositConversion}%`}}></div></div>
            </div>
            <div className="conversion-metric warning">
              <div className="conversion-label">Blocked Players</div>
              <div className="conversion-value">{data?.blockedPlayers?.count}</div>
              <div className="conversion-bar"><div className="conversion-fill red" style={{width: `${(data?.blockedPlayers?.count / data?.totalPlayers?.count) * 100}%`}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
