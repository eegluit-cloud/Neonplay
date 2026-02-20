import React, { useState, useEffect } from 'react';
import {
  getPlayerReport, getTransactionReport, getBankingReport,
  getBonusReport, getGameReport, exportReport
} from '../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Store full API response data
  const [playerReport, setPlayerReport] = useState(null);
  const [bankingReport, setBankingReport] = useState(null);
  const [bonusReport, setBonusReport] = useState(null);
  const [gameReport, setGameReport] = useState(null);

  // Pagination state for game rounds
  const [roundsPage, setRoundsPage] = useState(1);
  const roundsPerPage = 20;

  useEffect(() => {
    loadReports();
  }, [activeTab, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      // Load all reports in parallel
      const [playerRes, bankingRes, bonusRes, gameRes] = await Promise.all([
        getPlayerReport(params).catch(() => ({})),
        getBankingReport(params).catch(() => ({})),
        getBonusReport(params).catch(() => ({})),
        getGameReport(params).catch(() => ({}))
      ]);

      setPlayerReport(playerRes || {});
      setBankingReport(bankingRes || {});
      setBonusReport(bonusRes || {});
      setGameReport(gameRes || {});

      setLoading(false);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  const formatPercent = (value) => `${(isFinite(value) ? value : 0).toFixed(1)}%`;
  const safeDiv = (a, b) => (b ? a / b : 0);

  // Derive player stats from API response
  const statusBreakdown = playerReport?.statusBreakdown || [];
  const kycBreakdown = playerReport?.kycBreakdown || [];
  const totalPlayers = playerReport?.totalPlayers || 0;
  const getStatusCount = (status) => {
    const found = statusBreakdown.find(s => s.status === status);
    return found ? Number(found.count) : 0;
  };
  const getKycCount = (status) => {
    const found = kycBreakdown.find(s => s.kyc_status === status);
    return found ? Number(found.count) : 0;
  };

  const playerStats = {
    total: totalPlayers,
    active: getStatusCount('active'),
    suspended: getStatusCount('suspended'),
    blocked: getStatusCount('blocked'),
    kycVerified: getKycCount('verified'),
    kycPending: getKycCount('pending'),
    kycUnderReview: getKycCount('under_review'),
    kycRejected: getKycCount('rejected'),
    newThisMonth: (playerReport?.registrations || []).reduce((sum, r) => sum + Number(r.new_players || 0), 0),
    totalBalance: 0,
    totalBonusBalance: 0,
    vipPlayers: 0,
  };

  // Derive banking stats from API response
  const byPaymentMethod = bankingReport?.byPaymentMethod || [];
  const depositMethods = byPaymentMethod.filter(m => m.type === 'deposit');
  const withdrawalMethods = byPaymentMethod.filter(m => m.type === 'withdrawal');
  const totalDeposits = depositMethods.reduce((sum, m) => sum + Number(m.total || 0), 0);
  const totalWithdrawals = withdrawalMethods.reduce((sum, m) => sum + Number(m.total || 0), 0);
  const depositCount = depositMethods.reduce((sum, m) => sum + Number(m.count || 0), 0);
  const withdrawalCount = withdrawalMethods.reduce((sum, m) => sum + Number(m.count || 0), 0);
  const pendingWithdrawals = bankingReport?.pendingWithdrawals || {};

  const bankingStats = {
    totalDeposits,
    totalWithdrawals,
    depositCount,
    withdrawalCount,
    netCashflow: totalDeposits - totalWithdrawals,
    pendingCount: pendingWithdrawals.count || 0,
    pendingAmount: pendingWithdrawals.total || 0,
  };

  // Build payment method summary for the table (group by method)
  const paymentMethodSummary = (() => {
    const methods = {};
    byPaymentMethod.forEach(row => {
      const key = row.payment_method || 'unknown';
      if (!methods[key]) methods[key] = { method: key, deposits: 0, withdrawals: 0, depositCount: 0, withdrawalCount: 0 };
      if (row.type === 'deposit') {
        methods[key].deposits += Number(row.total || 0);
        methods[key].depositCount += Number(row.count || 0);
      } else {
        methods[key].withdrawals += Number(row.total || 0);
        methods[key].withdrawalCount += Number(row.count || 0);
      }
    });
    return Object.values(methods);
  })();

  // Derive casino/game stats from API response
  const overallGgr = gameReport?.overallGgr || {};
  const casinoStats = {
    totalBets: Number(overallGgr.total_bets || 0),
    totalWins: Number(overallGgr.total_wins || 0),
    ggr: Number(overallGgr.ggr || 0),
    ngr: Number(overallGgr.ggr || 0), // NGR not separately provided, fallback to GGR
    totalRounds: Number(overallGgr.total_rounds || 0),
    uniquePlayers: Number(overallGgr.unique_players || 0),
  };
  const ggrByProvider = gameReport?.ggrByProvider || [];
  const ggrByCurrency = gameReport?.ggrByCurrency || [];
  const recentRounds = gameReport?.recentRounds || [];
  const topGames = gameReport?.topGames || [];
  const topPlayers = playerReport?.topPlayers || [];

  // Derive bonus stats from API response
  const costSummary = bonusReport?.costSummary || {};
  const bonusByType = bonusReport?.byType || [];
  const bonusByBonus = bonusReport?.byBonus || [];
  const totalBonusClaims = bonusByType.reduce((sum, b) => sum + Number(b.claims || 0), 0);
  const totalBonusCompleted = bonusByType.reduce((sum, b) => sum + Number(b.completed || 0), 0);
  const bonusStats = {
    totalCost: Number(costSummary.total_bonus_cost || 0),
    totalWagered: Number(costSummary.total_wagered || 0),
    totalClaims: totalBonusClaims,
    activeBonuses: totalBonusClaims - totalBonusCompleted - bonusByType.reduce((sum, b) => sum + Number(b.forfeited || 0), 0),
    conversionRate: safeDiv(totalBonusCompleted, totalBonusClaims) * 100,
  };

  // Derive KYC stats from player report kycBreakdown
  const kycTotalSubmissions = kycBreakdown.reduce((sum, k) => sum + Number(k.count || 0), 0);
  const kycStats = {
    totalSubmissions: kycTotalSubmissions,
    pending: getKycCount('pending'),
    approved: getKycCount('verified'),
    rejected: getKycCount('rejected'),
    avgProcessingTime: 24,
  };

  // Registration trends from API
  const registrationTrend = (playerReport?.registrations || []).slice(0, 10);

  const handleExport = async (reportType) => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      await exportReport(reportType, params);
      alert(`Exporting ${reportType} report as CSV...`);
    } catch (err) {
      console.error('Failed to export report:', err);
      alert('Failed to export report: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div>
      {/* Date Range Filter */}
      <div className="card mb-2">
        <div className="form-inline">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To</label>
            <input
              type="date"
              className="form-input"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => {
            setDateRange({
              startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
            });
          }}>Last 7 Days</button>
          <button className="btn btn-secondary" onClick={() => {
            setDateRange({
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
            });
          }}>Last 30 Days</button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>
          Loading reports...
        </div>
      )}

      {error && (
        <div className="card" style={{ background: 'rgba(255,0,0,0.1)', color: 'var(--danger)', padding: '16px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>
            Player Management
          </button>
          <button className={`tab ${activeTab === 'casino' ? 'active' : ''}`} onClick={() => setActiveTab('casino')}>
            Casino Transactions
          </button>
          <button className={`tab ${activeTab === 'banking' ? 'active' : ''}`} onClick={() => setActiveTab('banking')}>
            Banking
          </button>
          <button className={`tab ${activeTab === 'bonus' ? 'active' : ''}`} onClick={() => setActiveTab('bonus')}>
            Bonus
          </button>
          <button className={`tab ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => setActiveTab('kyc')}>
            KYC
          </button>
        </div>
      </div>

      {/* Player Management Tab */}
      {activeTab === 'players' && (
        <div>
          <div className="card-header">
            <h3 className="card-title">Player Management Report</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('players')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">Total Players</div>
              <div className="stat-card-value">{playerStats.total}</div>
              <div className="stat-card-change positive">+{playerStats.newThisMonth} this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Active Players</div>
              <div className="stat-card-value">{playerStats.active}</div>
              <div className="stat-card-change">{formatPercent(safeDiv(playerStats.active, playerStats.total) * 100)} of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">VIP Players</div>
              <div className="stat-card-value">{playerStats.vipPlayers}</div>
              <div className="stat-card-change">{formatPercent(safeDiv(playerStats.vipPlayers, playerStats.total) * 100)} of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Total Balances</div>
              <div className="stat-card-value">{formatCurrency(playerStats.totalBalance)}</div>
              <div className="stat-card-change">+{formatCurrency(playerStats.totalBonusBalance)} bonus</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            {/* Status Breakdown */}
            <div className="card">
              <h4 className="card-title mb-2">Player Status Breakdown</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>{playerStats.active}</td>
                      <td>{formatPercent(safeDiv(playerStats.active, playerStats.total) * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-warning">Suspended</span></td>
                      <td>{playerStats.suspended}</td>
                      <td>{formatPercent(safeDiv(playerStats.suspended, playerStats.total) * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-danger">Blocked</span></td>
                      <td>{playerStats.blocked}</td>
                      <td>{formatPercent(safeDiv(playerStats.blocked, playerStats.total) * 100)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* KYC Status Summary */}
            <div className="card">
              <h4 className="card-title mb-2">KYC Status Summary</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>KYC Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="badge badge-success">Verified</span></td>
                      <td>{playerStats.kycVerified}</td>
                      <td>{formatPercent(safeDiv(playerStats.kycVerified, playerStats.total) * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-warning">Pending</span></td>
                      <td>{playerStats.kycPending}</td>
                      <td>{formatPercent(safeDiv(playerStats.kycPending, playerStats.total) * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-info">Under Review</span></td>
                      <td>{playerStats.kycUnderReview}</td>
                      <td>{formatPercent(safeDiv(playerStats.kycUnderReview, playerStats.total) * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-danger">Rejected</span></td>
                      <td>{playerStats.kycRejected}</td>
                      <td>{formatPercent(safeDiv(playerStats.kycRejected, playerStats.total) * 100)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Registration Trends */}
          <div className="card">
            <h4 className="card-title mb-2">Registration Trends</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>New Players</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationTrend.length > 0 ? registrationTrend.map((row, i) => (
                    <tr key={i}>
                      <td>{row.period}</td>
                      <td>{row.new_players}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', color: 'var(--gray)' }}>No registration data for this period</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Casino Transactions Tab */}
      {activeTab === 'casino' && (
        <div>
          <div className="card-header">
            <h3 className="card-title">Casino Transactions Report</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('game_history')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* GGR/NGR Overview */}
          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <div className="stats-grid" style={{ minWidth: '800px' }}>
              <div className="stat-card">
                <div className="stat-card-title">Total Bets</div>
                <div className="stat-card-value">{formatCurrency(casinoStats.totalBets)}</div>
                <div className="stat-card-change">{casinoStats.totalRounds} rounds</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Total Wins</div>
                <div className="stat-card-value">{formatCurrency(casinoStats.totalWins)}</div>
                <div className="stat-card-change">{casinoStats.uniquePlayers} players</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">GGR (Gross)</div>
                <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                  {formatCurrency(casinoStats.ggr)}
                </div>
                <div className="stat-card-change">Bets - Wins</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">NGR (Net)</div>
                <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                  {formatCurrency(casinoStats.ngr)}
                </div>
                <div className="stat-card-change">GGR - Bonus Cost</div>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="grid grid-2 gap-2" style={{ minWidth: '900px' }}>
            {/* By Provider */}
            <div className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
              <h4 className="card-title mb-2">Revenue by Provider</h4>
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table className="table" style={{ minWidth: '450px' }}>
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Plays</th>
                      <th>Bets</th>
                      <th>Wins</th>
                      <th>GGR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ggrByProvider.length > 0 ? ggrByProvider.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>{row.provider_name || 'Unknown'}</td>
                        <td>{Number(row.plays || 0).toLocaleString()}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.total_bets)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.total_wins)}</td>
                        <td style={{ color: 'var(--success)', whiteSpace: 'nowrap' }}>{formatCurrency(row.ggr)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray)' }}>No provider data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Games */}
            <div className="card" style={{ minWidth: 0, overflow: 'hidden' }}>
              <h4 className="card-title mb-2">Top Performing Games</h4>
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table className="table" style={{ minWidth: '400px' }}>
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Bets</th>
                      <th>GGR</th>
                      <th>Plays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topGames.length > 0 ? topGames.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>{row.name || 'Unknown'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.totalBets)}</td>
                        <td style={{ color: 'var(--success)', whiteSpace: 'nowrap' }}>{formatCurrency(row.ggr)}</td>
                        <td>{Number(row.plays || 0).toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray)' }}>No game data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>

          {/* Top Player Wagering */}
          <div className="card">
            <h4 className="card-title mb-2">Top Player Wagering</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Total Deposits</th>
                    <th>Total Withdrawals</th>
                    <th>Lifetime Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.length > 0 ? topPlayers.slice(0, 10).map((player, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: '500' }}>{player.name || 'N/A'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{player.email}</div>
                      </td>
                      <td>{formatCurrency(player.totalDeposits)}</td>
                      <td>{formatCurrency(player.totalWithdrawals)}</td>
                      <td style={{ color: player.lifetimeValue >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '500' }}>
                        {formatCurrency(player.lifetimeValue)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray)' }}>No player data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* GGR by Currency */}
          <div className="card">
            <h4 className="card-title mb-2">GGR by Currency</h4>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ minWidth: '500px' }}>
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Plays</th>
                    <th>Total Bets</th>
                    <th>Total Wins</th>
                    <th>GGR</th>
                  </tr>
                </thead>
                <tbody>
                  {ggrByCurrency.length > 0 ? ggrByCurrency.map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '500' }}>{row.currency}</td>
                      <td>{Number(row.plays || 0).toLocaleString()}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.total_bets)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(row.total_wins)}</td>
                      <td style={{ color: 'var(--success)', fontWeight: '500', whiteSpace: 'nowrap' }}>{formatCurrency(row.ggr)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray)' }}>No currency data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Game Rounds Listing */}
          <div className="card">
            <div className="flex-between mb-2">
              <h4 className="card-title">Recent Game Rounds</h4>
              <span style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                Showing {Math.min((roundsPage - 1) * roundsPerPage + 1, recentRounds.length)}-{Math.min(roundsPage * roundsPerPage, recentRounds.length)} of {recentRounds.length}
              </span>
            </div>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ minWidth: '900px' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Player</th>
                    <th>Game</th>
                    <th>Provider</th>
                    <th>Bet</th>
                    <th>Win</th>
                    <th>Currency</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRounds.length > 0 ? recentRounds
                    .slice((roundsPage - 1) * roundsPerPage, roundsPage * roundsPerPage)
                    .map((round, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(round.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{round.playerName || 'N/A'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{round.playerEmail}</div>
                      </td>
                      <td style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>{round.gameName}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{round.providerName}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatCurrency(round.betAmount)}</td>
                      <td style={{ color: round.winAmount > 0 ? 'var(--success)' : 'inherit', whiteSpace: 'nowrap' }}>
                        {formatCurrency(round.winAmount)}
                      </td>
                      <td>{round.currency}</td>
                      <td>
                        <span className={`badge ${
                          round.status === 'completed' ? 'badge-success' :
                          round.status === 'pending' ? 'badge-warning' :
                          'badge-info'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {round.status || 'completed'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: 'var(--gray)' }}>No game rounds found for this period</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {recentRounds.length > roundsPerPage && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setRoundsPage(1)}
                  disabled={roundsPage === 1}
                >
                  First
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setRoundsPage(p => Math.max(1, p - 1))}
                  disabled={roundsPage === 1}
                >
                  Previous
                </button>
                <span style={{ padding: '0 12px', color: 'var(--text)' }}>
                  Page {roundsPage} of {Math.ceil(recentRounds.length / roundsPerPage)}
                </span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setRoundsPage(p => Math.min(Math.ceil(recentRounds.length / roundsPerPage), p + 1))}
                  disabled={roundsPage >= Math.ceil(recentRounds.length / roundsPerPage)}
                >
                  Next
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setRoundsPage(Math.ceil(recentRounds.length / roundsPerPage))}
                  disabled={roundsPage >= Math.ceil(recentRounds.length / roundsPerPage)}
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Banking Tab */}
      {activeTab === 'banking' && (
        <div>
          <div className="card-header">
            <h3 className="card-title">Banking Report</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('transactions')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">Total Deposits</div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>{formatCurrency(bankingStats.totalDeposits)}</div>
              <div className="stat-card-change">{bankingStats.depositCount} transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Total Withdrawals</div>
              <div className="stat-card-value" style={{ color: 'var(--danger)' }}>{formatCurrency(bankingStats.totalWithdrawals)}</div>
              <div className="stat-card-change">{bankingStats.withdrawalCount} transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Net Cashflow</div>
              <div className="stat-card-value" style={{ color: bankingStats.netCashflow >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {formatCurrency(bankingStats.netCashflow)}
              </div>
              <div className="stat-card-change">Deposits - Withdrawals</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(253, 203, 110, 0.2)' }}>
              <div className="stat-card-title">Pending Withdrawals</div>
              <div className="stat-card-value">{bankingStats.pendingCount}</div>
              <div className="stat-card-change">{formatCurrency(bankingStats.pendingAmount)} pending</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            {/* By Payment Method */}
            <div className="card">
              <h4 className="card-title mb-2">By Payment Method</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Deposits</th>
                      <th>Withdrawals</th>
                      <th>Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethodSummary.length > 0 ? paymentMethodSummary.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500', textTransform: 'capitalize' }}>{row.method?.replace('_', ' ')}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCurrency(row.deposits)}</td>
                        <td style={{ color: 'var(--danger)' }}>{formatCurrency(row.withdrawals)}</td>
                        <td>{row.depositCount + row.withdrawalCount} txns</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray)' }}>No payment method data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Success Rates */}
            <div className="card">
              <h4 className="card-title mb-2">Transaction Success Rates</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Total</th>
                      <th>Successful</th>
                      <th>Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(bankingReport?.successRate || []).length > 0 ? (bankingReport?.successRate || []).map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500', textTransform: 'capitalize' }}>{row.type}</td>
                        <td>{row.total}</td>
                        <td style={{ color: 'var(--success)' }}>{row.successful}</td>
                        <td>{Number(row.rate || 0).toFixed(1)}%</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray)' }}>No transaction data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Individual Transaction Listing */}
          <div className="card">
            <h4 className="card-title mb-2">Transaction Listing</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Player</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(bankingReport?.recentTransactions || []).length > 0 ? (bankingReport?.recentTransactions || []).map((txn, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(txn.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${txn.type === 'deposit' ? 'badge-success' : 'badge-danger'}`} style={{ textTransform: 'capitalize' }}>
                          {txn.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{txn.playerName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{txn.playerEmail}</div>
                      </td>
                      <td style={{ fontWeight: '500', color: txn.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                        {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td>{txn.currency}</td>
                      <td style={{ textTransform: 'capitalize' }}>{txn.method?.replace('_', ' ')}</td>
                      <td>
                        <span className={`badge ${
                          txn.status === 'completed' ? 'badge-success' :
                          txn.status === 'pending' ? 'badge-warning' :
                          txn.status === 'failed' || txn.status === 'rejected' ? 'badge-danger' :
                          'badge-info'
                        }`} style={{ textTransform: 'capitalize' }}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--gray)' }}>No transactions found for this period</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bonus Tab */}
      {activeTab === 'bonus' && (
        <div>
          <div className="card-header">
            <h3 className="card-title">Bonus Report</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('bonuses')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">Total Bonus Cost</div>
              <div className="stat-card-value">{formatCurrency(bonusStats.totalCost)}</div>
              <div className="stat-card-change">{bonusStats.totalClaims} claims</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Total Wagered</div>
              <div className="stat-card-value">{formatCurrency(bonusStats.totalWagered)}</div>
              <div className="stat-card-change">From bonus funds</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Active Bonuses</div>
              <div className="stat-card-value">{Math.max(0, bonusStats.activeBonuses)}</div>
              <div className="stat-card-change">In progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Conversion Rate</div>
              <div className="stat-card-value">{formatPercent(bonusStats.conversionRate)}</div>
              <div className="stat-card-change">Wagering completed</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            {/* By Bonus Type */}
            <div className="card">
              <h4 className="card-title mb-2">Claims by Type</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Claims</th>
                      <th>Total Given</th>
                      <th>Total Wagered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusByType.length > 0 ? bonusByType.map((bonus, i) => (
                      <tr key={i}>
                        <td style={{ textTransform: 'capitalize', fontWeight: '500' }}>{(bonus.type || 'unknown').replace('_', ' ')}</td>
                        <td>{bonus.claims || 0}</td>
                        <td>{formatCurrency(bonus.total_given)}</td>
                        <td>{formatCurrency(bonus.total_wagered)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray)' }}>No bonus type data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Bonuses */}
            <div className="card">
              <h4 className="card-title mb-2">Top Bonuses by Claims</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Bonus</th>
                      <th>Type</th>
                      <th>Claims</th>
                      <th>Total Given</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusByBonus.length > 0 ? bonusByBonus.slice(0, 10).map((bonus, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{bonus.name || 'Unknown'}</td>
                        <td style={{ textTransform: 'capitalize' }}>{(bonus.type || '').replace('_', ' ')}</td>
                        <td>{bonus.claims || 0}</td>
                        <td>{formatCurrency(bonus.total_given)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--gray)' }}>No bonus data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cost Analysis */}
          <div className="card">
            <h4 className="card-title mb-2">Bonus Cost Analysis</h4>
            <div className="grid grid-3 gap-2">
              <div className="stat-card">
                <div className="stat-card-title">Avg Bonus Size</div>
                <div className="stat-card-value">{formatCurrency(safeDiv(bonusStats.totalCost, bonusStats.totalClaims))}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Wagering Multiplier</div>
                <div className="stat-card-value">{safeDiv(bonusStats.totalWagered, bonusStats.totalCost).toFixed(1)}x</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">ROI</div>
                <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                  {formatPercent(safeDiv(bonusStats.totalWagered * 0.05, bonusStats.totalCost) * 100)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === 'kyc' && (
        <div>
          <div className="card-header">
            <h3 className="card-title">KYC Report</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('players')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* Overview Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">Total Submissions</div>
              <div className="stat-card-value">{kycStats.totalSubmissions}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(253, 203, 110, 0.2)' }}>
              <div className="stat-card-title">Pending Review</div>
              <div className="stat-card-value">{kycStats.pending}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Approved</div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {kycStats.approved}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Rejected</div>
              <div className="stat-card-value" style={{ color: 'var(--danger)' }}>
                {kycStats.rejected}
              </div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            {/* KYC Breakdown */}
            <div className="card">
              <h4 className="card-title mb-2">KYC Status Breakdown</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycBreakdown.length > 0 ? kycBreakdown.map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500', textTransform: 'capitalize' }}>{(row.kyc_status || 'unknown').replace('_', ' ')}</td>
                        <td>{row.count}</td>
                        <td>{formatPercent(safeDiv(Number(row.count), kycStats.totalSubmissions) * 100)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', color: 'var(--gray)' }}>No KYC data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approval Rate */}
            <div className="card">
              <h4 className="card-title mb-2">Approval Statistics</h4>
              <div style={{ padding: '10px 0' }}>
                <div className="flex-between mb-2">
                  <span>Approval Rate</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                    {formatPercent(safeDiv(kycStats.approved, kycStats.totalSubmissions) * 100)}
                  </span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{
                    width: `${safeDiv(kycStats.approved, kycStats.totalSubmissions) * 100}%`,
                    background: 'var(--success)'
                  }}></div>
                </div>

                <div className="flex-between mb-2">
                  <span>Rejection Rate</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                    {formatPercent(safeDiv(kycStats.rejected, kycStats.totalSubmissions) * 100)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${safeDiv(kycStats.rejected, kycStats.totalSubmissions) * 100}%`,
                    background: 'var(--danger)'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
