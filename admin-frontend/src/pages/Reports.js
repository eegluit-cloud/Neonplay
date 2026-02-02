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
  const [playerStats, setPlayerStats] = useState({});
  const [casinoStats, setCasinoStats] = useState({});
  const [bankingStats, setBankingStats] = useState({});
  const [bonusStats, setBonusStats] = useState({});
  const [gameStats, setGameStats] = useState({});

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
      const [playerReport, bankingReport, bonusReport, gameReport] = await Promise.all([
        getPlayerReport(params),
        getBankingReport(params),
        getBonusReport(params),
        getGameReport(params)
      ]);

      setPlayerStats(playerReport.stats || {});
      setBankingStats(bankingReport.stats || {});
      setBonusStats(bonusReport.stats || {});
      setGameStats(gameReport.stats || {});

      // Calculate casino stats from transaction data
      setCasinoStats({
        totalBets: gameReport.stats?.totalBets || 0,
        totalWins: gameReport.stats?.totalWins || 0,
        ggr: gameReport.stats?.ggr || 0,
        ngr: gameReport.stats?.ngr || 0,
        uniquePlayers: gameReport.stats?.uniquePlayers || 0,
        totalRounds: gameReport.stats?.totalRounds || 0
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

  // Remove static calculations - data now comes from API
  /* const playerStats = {
    total: players.length,
    active: players.filter(p => p.status === 'active').length,
    blocked: players.filter(p => p.status === 'blocked').length,
    suspended: players.filter(p => p.status === 'suspended').length,
    kycVerified: players.filter(p => p.kycStatus === 'verified').length,
    kycPending: players.filter(p => p.kycStatus === 'pending').length,
    kycUnderReview: players.filter(p => p.kycStatus === 'under_review').length,
    kycRejected: players.filter(p => p.kycStatus === 'rejected').length,
    totalBalance: players.reduce((sum, p) => sum + p.balance, 0),
    totalBonusBalance: players.reduce((sum, p) => sum + p.bonusBalance, 0),
    vipPlayers: players.filter(p => p.tags?.some(t => t.name === 'VIP')).length,
    newThisWeek: 3,
    newThisMonth: 8
  };

  */

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

  const registrationTrend = [
    { period: 'Jan Week 1', newPlayers: 12, deposits: 8, kycCompleted: 6 },
    { period: 'Jan Week 2', newPlayers: 18, deposits: 14, kycCompleted: 10 },
    { period: 'Jan Week 3', newPlayers: 15, deposits: 11, kycCompleted: 9 },
    { period: 'Jan Week 4', newPlayers: 22, deposits: 17, kycCompleted: 14 }
  ];

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
              <div className="stat-card-change">{formatPercent(playerStats.active / playerStats.total * 100)} of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">VIP Players</div>
              <div className="stat-card-value">{playerStats.vipPlayers}</div>
              <div className="stat-card-change">{formatPercent(playerStats.vipPlayers / playerStats.total * 100)} of total</div>
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
                      <td>{formatPercent(playerStats.active / playerStats.total * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-warning">Suspended</span></td>
                      <td>{playerStats.suspended}</td>
                      <td>{formatPercent(playerStats.suspended / playerStats.total * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-danger">Blocked</span></td>
                      <td>{playerStats.blocked}</td>
                      <td>{formatPercent(playerStats.blocked / playerStats.total * 100)}</td>
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
                      <td>{formatPercent(playerStats.kycVerified / playerStats.total * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-warning">Pending</span></td>
                      <td>{playerStats.kycPending}</td>
                      <td>{formatPercent(playerStats.kycPending / playerStats.total * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-info">Under Review</span></td>
                      <td>{playerStats.kycUnderReview}</td>
                      <td>{formatPercent(playerStats.kycUnderReview / playerStats.total * 100)}</td>
                    </tr>
                    <tr>
                      <td><span className="badge badge-danger">Rejected</span></td>
                      <td>{playerStats.kycRejected}</td>
                      <td>{formatPercent(playerStats.kycRejected / playerStats.total * 100)}</td>
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
                    <th>First Deposits</th>
                    <th>KYC Completed</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationTrend.map((row, i) => (
                    <tr key={i}>
                      <td>{row.period}</td>
                      <td>{row.newPlayers}</td>
                      <td>{row.deposits}</td>
                      <td>{row.kycCompleted}</td>
                      <td>{formatPercent(row.deposits / row.newPlayers * 100)}</td>
                    </tr>
                  ))}
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
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('casino')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* GGR/NGR Overview */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-title">Total Bets</div>
              <div className="stat-card-value">{formatCurrency(ngrData?.totals?.totalBets || casinoStats.totalBets)}</div>
              <div className="stat-card-change">{casinoStats.totalRounds} rounds</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Total Wins</div>
              <div className="stat-card-value">{formatCurrency(ngrData?.totals?.totalWins || casinoStats.totalWins)}</div>
              <div className="stat-card-change">{casinoStats.uniquePlayers} players</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">GGR (Gross)</div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {formatCurrency(ngrData?.totals?.totalGgr || casinoStats.ggr)}
              </div>
              <div className="stat-card-change">Bets - Wins</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">NGR (Net)</div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {formatCurrency(ngrData?.totals?.totalNgr || casinoStats.ngr)}
              </div>
              <div className="stat-card-change">GGR - Bonus Cost</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            {/* By Provider */}
            <div className="card">
              <h4 className="card-title mb-2">Revenue by Provider</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Bets</th>
                      <th>Wins</th>
                      <th>GGR</th>
                      <th>NGR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ngrData?.byProvider || []).map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{row.providerName}</td>
                        <td>{formatCurrency(row.bets)}</td>
                        <td>{formatCurrency(row.wins)}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCurrency(row.ggr)}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCurrency(row.ngr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Games */}
            <div className="card">
              <h4 className="card-title mb-2">Top Performing Games</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Bets</th>
                      <th>GGR</th>
                      <th>Plays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ngrData?.byGame || []).map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{row.gameName}</td>
                        <td>{formatCurrency(row.bets)}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCurrency(row.ggr)}</td>
                        <td>{row.playCount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Player Wagering */}
          <div className="card">
            <h4 className="card-title mb-2">Top Player Wagering</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Total Bets</th>
                    <th>Total Wins</th>
                    <th>Net Result</th>
                    <th>Rounds</th>
                  </tr>
                </thead>
                <tbody>
                  {players.slice(0, 5).map((player, i) => {
                    const bets = (player.balance * 3) + (i * 500);
                    const wins = bets * 0.92;
                    return (
                      <tr key={player.id}>
                        <td>
                          <div style={{ fontWeight: '500' }}>{player.firstName} {player.lastName}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{player.email}</div>
                        </td>
                        <td>{formatCurrency(bets)}</td>
                        <td>{formatCurrency(wins)}</td>
                        <td style={{ color: bets - wins >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {formatCurrency(bets - wins)}
                        </td>
                        <td>{Math.floor(50 + i * 20)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Banking Tab */}
      {activeTab === 'banking' && (
        <div>
          <div className="card-header">
            <h3 className="card-title">Banking Report</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('banking')}>
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
              <div className="stat-card-value">{bankingStats.pendingWithdrawals.length}</div>
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
                    {(bankingReportData?.byMethod || []).map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{row.method}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCurrency(row.deposits)}</td>
                        <td style={{ color: 'var(--danger)' }}>{formatCurrency(row.withdrawals)}</td>
                        <td>{row.depositCount + row.withdrawalCount} txns</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Transactions */}
            <div className="card">
              <h4 className="card-title mb-2">Pending Transactions</h4>
              {bankingStats.pendingWithdrawals.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankingStats.pendingWithdrawals.map((tx, i) => (
                        <tr key={i}>
                          <td>{tx.playerName}</td>
                          <td style={{ fontWeight: '500' }}>{formatCurrency(tx.amount)}</td>
                          <td style={{ textTransform: 'capitalize' }}>{tx.paymentMethod?.replace('_', ' ')}</td>
                          <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--gray)' }}>
                  No pending transactions
                </div>
              )}
            </div>
          </div>

          {/* Daily Trend */}
          <div className="card">
            <h4 className="card-title mb-2">Daily Cashflow Trend</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Deposits</th>
                    <th>Withdrawals</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {(bankingReportData?.dailyTrend || []).map((row, i) => (
                    <tr key={i}>
                      <td>{row.date}</td>
                      <td style={{ color: 'var(--success)' }}>{formatCurrency(row.deposits)}</td>
                      <td style={{ color: 'var(--danger)' }}>{formatCurrency(row.withdrawals)}</td>
                      <td style={{ fontWeight: '500', color: row.deposits - row.withdrawals >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {formatCurrency(row.deposits - row.withdrawals)}
                      </td>
                    </tr>
                  ))}
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
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('bonus')}>
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
              <div className="stat-card-value">{bonusStats.activeBonuses}</div>
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
                    {bonuses.map((bonus, i) => (
                      <tr key={i}>
                        <td style={{ textTransform: 'capitalize', fontWeight: '500' }}>{bonus.type?.replace('_', ' ')}</td>
                        <td>{bonus.currentClaims}</td>
                        <td>{formatCurrency(bonus.amount ? bonus.amount * bonus.currentClaims : bonus.currentClaims * 75)}</td>
                        <td>{formatCurrency(bonus.amount ? bonus.amount * bonus.currentClaims * bonus.wageringReq : bonus.currentClaims * 75 * 15)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Bonuses */}
            <div className="card">
              <h4 className="card-title mb-2">Top Bonuses by Cost</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Bonus</th>
                      <th>Status</th>
                      <th>Claims</th>
                      <th>Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonuses.sort((a, b) => b.currentClaims - a.currentClaims).slice(0, 5).map((bonus, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{bonus.name}</td>
                        <td>
                          <span className={`badge badge-${bonus.status === 'active' ? 'success' : 'danger'}`}>
                            {bonus.status}
                          </span>
                        </td>
                        <td>{bonus.currentClaims}</td>
                        <td>{formatCurrency(bonus.amount ? bonus.amount * bonus.currentClaims : bonus.currentClaims * 75)}</td>
                      </tr>
                    ))}
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
                <div className="stat-card-value">{formatCurrency(bonusStats.totalCost / bonusStats.totalClaims || 0)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">Wagering Multiplier</div>
                <div className="stat-card-value">{(bonusStats.totalWagered / bonusStats.totalCost || 0).toFixed(1)}x</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-title">ROI</div>
                <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                  {formatPercent((bonusStats.totalWagered * 0.05 / bonusStats.totalCost) * 100 || 0)}
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
            <button className="btn btn-sm btn-secondary" onClick={() => handleExport('kyc')}>
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
              <div className="stat-card-value">{kycReportStats?.summary?.totalSubmissions || kycStats.totalSubmissions}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(253, 203, 110, 0.2)' }}>
              <div className="stat-card-title">Pending Review</div>
              <div className="stat-card-value">{kycReportStats?.summary?.pending || kycStats.pending}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Approved</div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {kycReportStats?.summary?.approved || kycStats.approved}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-title">Avg Processing Time</div>
              <div className="stat-card-value">{kycStats.avgProcessingTime}h</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            {/* By Document Type */}
            <div className="card">
              <h4 className="card-title mb-2">By Document Type</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>Submissions</th>
                      <th>Approved</th>
                      <th>Rejected</th>
                      <th>Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kycReportStats?.byDocumentType || []).map((row, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: '500' }}>{row.type}</td>
                        <td>{row.submissions}</td>
                        <td style={{ color: 'var(--success)' }}>{row.approved}</td>
                        <td style={{ color: 'var(--danger)' }}>{row.rejected}</td>
                        <td style={{ color: 'var(--warning)' }}>{row.pending}</td>
                      </tr>
                    ))}
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
                    {formatPercent((kycReportStats?.summary?.approved || kycStats.approved) / (kycReportStats?.summary?.totalSubmissions || kycStats.totalSubmissions) * 100)}
                  </span>
                </div>
                <div className="progress-bar mb-2">
                  <div className="progress-fill" style={{
                    width: `${(kycReportStats?.summary?.approved || kycStats.approved) / (kycReportStats?.summary?.totalSubmissions || kycStats.totalSubmissions) * 100}%`,
                    background: 'var(--success)'
                  }}></div>
                </div>

                <div className="flex-between mb-2">
                  <span>Rejection Rate</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>
                    {formatPercent((kycReportStats?.summary?.rejected || kycStats.rejected) / (kycReportStats?.summary?.totalSubmissions || kycStats.totalSubmissions) * 100)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${(kycReportStats?.summary?.rejected || kycStats.rejected) / (kycReportStats?.summary?.totalSubmissions || kycStats.totalSubmissions) * 100}%`,
                    background: 'var(--danger)'
                  }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="card">
            <h4 className="card-title mb-2">Weekly KYC Trend</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Submissions</th>
                    <th>Approved</th>
                    <th>Rejected</th>
                    <th>Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(kycReportStats?.weeklyTrend || []).map((row, i) => (
                    <tr key={i}>
                      <td>{row.week}</td>
                      <td>{row.submissions}</td>
                      <td style={{ color: 'var(--success)' }}>{row.approved}</td>
                      <td style={{ color: 'var(--danger)' }}>{row.rejected}</td>
                      <td>{formatPercent(row.approved / row.submissions * 100)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
