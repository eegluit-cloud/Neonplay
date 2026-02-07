import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPlayer, getPlayerTransactions, adjustBalance,
  addPlayerNote, updatePlayerStatus, getBonuses, awardBonus
} from '../services/api';

const PlayerDetail = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [playerTransactions, setPlayerTransactions] = useState([]);
  const [playerBonuses, setPlayerBonuses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [bonuses, setBonusesList] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Transaction filters
  const [txFilter, setTxFilter] = useState({ type: '', status: '', search: '' });

  // Modals
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAction, setBalanceAction] = useState('add');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceCurrency, setBalanceCurrency] = useState('USD');
  const [balanceReason, setBalanceReason] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedKycStatus, setSelectedKycStatus] = useState('');
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [limits, setLimits] = useState({
    dailyDeposit: 10000, weeklyDeposit: 50000, monthlyDeposit: 100000,
    dailyLoss: '', weeklyLoss: '', sessionTime: '', coolingOff: ''
  });
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [exclusionPeriod, setExclusionPeriod] = useState('');
  const [exclusionReason, setExclusionReason] = useState('');

  // Activity log
  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Login', details: 'Successful login from Chrome/Windows', ip: '192.168.1.100', timestamp: new Date().toISOString() },
    { id: 2, action: 'Deposit', details: 'Deposited $500 via Credit Card', ip: '192.168.1.100', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, action: 'Game Play', details: 'Started playing Book of Dead', ip: '192.168.1.100', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, action: 'Withdrawal Request', details: 'Requested withdrawal of $200', ip: '192.168.1.100', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ]);

  useEffect(() => {
    loadPlayerData();
  }, [playerId]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load player details
      const playerData = await getPlayer(playerId);
      setPlayer(playerData.player);

      // Load transactions
      const transactionsData = await getPlayerTransactions(playerId, { limit: 50 });
      setPlayerTransactions(transactionsData.transactions || []);

      // Load bonuses list
      const bonusesData = await getBonuses({ status: 'active' });
      setBonusesList(bonusesData.bonuses || []);

      // Set player bonuses, notes, and game history from player data if available
      setPlayerBonuses(playerData.player.bonuses || []);
      setNotes(playerData.player.notes || []);
      setGameHistory(playerData.player.gameHistory || []);

      // Calculate stats from actual data
      const balance = playerData.player.balance || 0;
      const bonusBalance = playerData.player.bonusBalance || 0;
      const deposits = balance * 2; // TODO: Get from actual transaction data
      const withdrawals = balance * 0.5;
      const wagered = balance * 3;
      const ggr = wagered * 0.03;
      const bonusTotal = bonusBalance + (balance * 0.1);
      const rebates = wagered * 0.005;
      const ngr = ggr - bonusTotal - rebates;

      setStats({ deposits, withdrawals, wagered, ggr, bonusTotal, rebates, ngr });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load player data:', err);
      setError(err.message || 'Failed to load player data');
      setLoading(false);
    }
  };

  const addActivity = (action, details) => {
    setActivityLog([{ id: Date.now(), action, details, ip: '192.168.1.1', timestamp: new Date().toISOString() }, ...activityLog]);
  };

  const handleStatusChange = async (newStatus) => {
    const reason = window.prompt(`Reason for ${newStatus === 'suspended' ? 'suspending' : newStatus === 'blocked' ? 'blocking' : 'activating'}:`);
    if (!reason) return;

    try {
      await updatePlayerStatus(playerId, newStatus, reason);
      setPlayer({ ...player, status: newStatus });
      addActivity('Status Change', `Status changed to ${newStatus}. Reason: ${reason}`);
      setSuccess(`Player ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update player status:', err);
      setError(err.message || 'Failed to update player status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBalanceAdjust = async (e) => {
    e.preventDefault();
    const amount = parseFloat(balanceAmount);
    const adjustedAmount = balanceAction === 'deduct' ? -amount : amount;

    try {
      await adjustBalance(playerId, {
        amount: adjustedAmount,
        currency: balanceCurrency,
        reason: balanceReason,
        type: 'real'
      });

      setPlayer({ ...player, balance: player.balance + adjustedAmount });
      addActivity('Balance Adjustment', `${balanceAction === 'add' ? 'Added' : 'Deducted'} ${formatCurrency(amount)}. Reason: ${balanceReason}`);
      setSuccess(`Balance ${balanceAction === 'add' ? 'added' : 'deducted'} successfully`);
      setShowBalanceModal(false);
      setBalanceAmount('');
      setBalanceReason('');
      setTimeout(() => setSuccess(''), 3000);
      loadPlayerData(); // Reload player data
    } catch (err) {
      console.error('Failed to adjust balance:', err);
      setError(err.message || 'Failed to adjust balance');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleGrantBonus = async (e) => {
    e.preventDefault();
    const bonus = bonuses.find(b => b.id === parseInt(selectedBonus));
    const amount = parseFloat(bonusAmount) || bonus?.amount || 0;

    try {
      await awardBonus({
        playerId: parseInt(playerId),
        promotionId: parseInt(selectedBonus),
        amount: amount
      });

      setPlayer({ ...player, bonusBalance: player.bonusBalance + amount });
      addActivity('Bonus Grant', `Granted ${bonus?.name || 'Manual Bonus'} worth ${formatCurrency(amount)}`);
      setSuccess(`Bonus granted successfully`);
      setShowBonusModal(false);
      setSelectedBonus('');
      setBonusAmount('');
      setTimeout(() => setSuccess(''), 3000);
      loadPlayerData(); // Reload player data
    } catch (err) {
      console.error('Failed to grant bonus:', err);
      setError(err.message || 'Failed to grant bonus');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateLimits = (e) => {
    e.preventDefault();
    addActivity('Limits Updated', `Responsible gambling limits updated`);
    setSuccess('Limits updated successfully');
    setShowLimitsModal(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSelfExclusion = (e) => {
    e.preventDefault();
    setPlayer({ ...player, status: 'self_excluded' });
    addActivity('Self-Exclusion', `Self-excluded for ${exclusionPeriod}. Reason: ${exclusionReason}`);
    setSuccess(`Player self-excluded for ${exclusionPeriod}`);
    setShowExclusionModal(false);
    setExclusionPeriod('');
    setExclusionReason('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleForceLogout = () => {
    if (window.confirm('Force logout this player from all sessions?')) {
      addActivity('Force Logout', 'All sessions terminated by admin');
      setSuccess('Player logged out from all sessions');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleResetPassword = () => {
    if (window.confirm('Send password reset email to player?')) {
      addActivity('Password Reset', 'Password reset email sent');
      setSuccess('Password reset email sent');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleKycUpdate = (e) => {
    e.preventDefault();
    setPlayer({ ...player, kycStatus: selectedKycStatus });
    addActivity('KYC Update', `KYC status changed to ${selectedKycStatus}`);
    setSuccess(`KYC status updated to ${selectedKycStatus}`);
    setShowKycModal(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRemoveKyc = () => {
    if (window.confirm('Remove KYC verification?')) {
      setPlayer({ ...player, kycStatus: 'pending' });
      addActivity('KYC Removed', 'KYC verification removed');
      setSuccess('KYC verification removed');
      setShowKycModal(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addPlayerNote(playerId, newNote);
      const note = {
        id: notes.length + 1, playerId: parseInt(playerId), adminName: 'Current Admin',
        note: newNote, type: noteType, createdAt: new Date().toISOString()
      };
      setNotes([note, ...notes]);
      addActivity('Note Added', `Added ${noteType} note`);
      setNewNote('');
      setNoteType('general');
      setSuccess('Note added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to add note:', err);
      setError(err.message || 'Failed to add note');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount || 0);
  };
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getInitials = (firstName, lastName) => `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();

  const getRiskLevel = () => {
    if (player?.tags?.some(t => t.name === 'Suspicious')) return 'high';
    if (player?.tags?.some(t => t.name === 'VIP')) return 'low';
    return 'medium';
  };

  const getVipTier = () => {
    if (player?.tags?.some(t => t.name === 'VIP')) return 'gold';
    if (player?.tags?.some(t => t.name === 'High Roller')) return 'silver';
    return 'bronze';
  };

  const filteredTransactions = playerTransactions.filter(tx => {
    if (txFilter.type && tx.type !== txFilter.type) return false;
    if (txFilter.status && tx.status !== txFilter.status) return false;
    if (txFilter.search && !tx.reference?.toLowerCase().includes(txFilter.search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (error && !player) return (
    <div>
      <div className="alert alert-error">{error}</div>
      <button onClick={() => navigate('/players')} className="btn btn-secondary">Back to Players</button>
    </div>
  );

  const riskLevel = getRiskLevel();
  const vipTier = getVipTier();

  return (
    <div className="player-detail-page">
      {success && <div className="alert alert-success">{success}</div>}

      {/* Player Header */}
      <div className="player-header">
        <div className="player-header-left">
          <button onClick={() => navigate('/players')} className="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="player-avatar">{getInitials(player?.firstName, player?.lastName)}</div>
          <div className="player-info">
            <div className="player-name-row">
              <h1 className="player-username">{player?.firstName} {player?.lastName}</h1>
              <span className={`status-badge ${player?.status}`}>{player?.status}</span>
            </div>
            <div className="player-meta">
              <span className="player-email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                {player?.email}
              </span>
              <span className="player-country">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M2 12h20" />
                </svg>
                ID: {player?.id}
              </span>
            </div>
            <div className="player-tags">
              <span className={`player-tag tier ${vipTier}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                {vipTier}
              </span>
              <span className={`player-tag kyc ${player?.kycStatus}`}>KYC: {player?.kycStatus}</span>
              <span className={`player-tag risk ${riskLevel}`}>Risk: {riskLevel}</span>
            </div>
          </div>
        </div>
        <div className="player-header-actions">
          {player?.status === 'blocked' || player?.status === 'suspended' ? (
            <button onClick={() => handleStatusChange('active')} className="action-btn" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'var(--success)', color: 'var(--success)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Activate
            </button>
          ) : (
            <>
              <button onClick={() => handleStatusChange('suspended')} className="action-btn suspend" disabled={player?.status === 'suspended'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                Suspend
              </button>
              <button onClick={() => handleStatusChange('blocked')} className="action-btn ban" disabled={player?.status === 'blocked'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                Block
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="player-stats-row">
        <div className="player-stat-card green">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="12" r="3" /></svg></div>
          <div className="stat-content"><span className="stat-label">Balance</span><span className="stat-value">{formatCurrency(player?.balance)}</span></div>
        </div>
        <div className="player-stat-card purple">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
          <div className="stat-content"><span className="stat-label">Bonus</span><span className="stat-value">{formatCurrency(player?.bonusBalance)}</span></div>
        </div>
        <div className="player-stat-card cyan">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12l10-10 10 10" /></svg></div>
          <div className="stat-content"><span className="stat-label">Deposits</span><span className="stat-value">{formatCurrency(stats?.deposits)}</span></div>
        </div>
        <div className="player-stat-card yellow">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-20M2 12l10 10 10-10" /></svg></div>
          <div className="stat-content"><span className="stat-label">Withdrawals</span><span className="stat-value">{formatCurrency(stats?.withdrawals)}</span></div>
        </div>
        <div className="player-stat-card orange">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
          <div className="stat-content"><span className="stat-label">Wagered</span><span className="stat-value">{formatCurrency(stats?.wagered)}</span></div>
        </div>
        <div className="player-stat-card red">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></div>
          <div className="stat-content"><span className="stat-label">GGR</span><span className="stat-value">{formatCurrency(stats?.ggr)}</span></div>
        </div>
        <div className="player-stat-card teal">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg></div>
          <div className="stat-content"><span className="stat-label">NGR</span><span className="stat-value">{formatCurrency(stats?.ngr)}</span></div>
        </div>
        <div className="player-stat-card pink">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div>
          <div className="stat-content"><span className="stat-label">Rebates</span><span className="stat-value">{formatCurrency(stats?.rebates)}</span></div>
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="quick-actions-section">
        <h3 className="section-label">Admin Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-item" onClick={() => { setBalanceAction('add'); setShowBalanceModal(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            Add Funds
          </button>
          <button className="quick-action-item" onClick={() => { setBalanceAction('deduct'); setShowBalanceModal(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            Deduct Funds
          </button>
          <button className="quick-action-item" onClick={() => setShowBonusModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /></svg>
            Grant Bonus
          </button>
          <button className="quick-action-item" onClick={() => { setSelectedKycStatus(player?.kycStatus || ''); setShowKycModal(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Update KYC
          </button>
          <button className="quick-action-item" onClick={() => setShowLimitsModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v10" /><path d="M1 12h6m6 0h10" /></svg>
            Set Limits
          </button>
          <button className="quick-action-item" onClick={() => setShowExclusionModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            Self-Exclude
          </button>
          <button className="quick-action-item" onClick={handleForceLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Force Logout
          </button>
          <button className="quick-action-item" onClick={handleResetPassword}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Reset Password
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="player-content-grid">
        <div className="player-left-column">
          <div className="player-card">
            <h3 className="player-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Personal Information
            </h3>
            <div className="info-list">
              <div className="info-row"><span className="info-label">Full Name</span><span className="info-value">{player?.firstName} {player?.lastName}</span></div>
              <div className="info-row"><span className="info-label">Email</span><span className="info-value">{player?.email}</span></div>
              <div className="info-row"><span className="info-label">Phone</span><span className="info-value">{player?.phone || '-'}</span></div>
              <div className="info-row"><span className="info-label">Country</span><span className="info-value">United States</span></div>
              <div className="info-row"><span className="info-label">Currency</span><span className="info-value">USD</span></div>
              <div className="info-row"><span className="info-label">Registered</span><span className="info-value">{formatDate(player?.createdAt)}</span></div>
              <div className="info-row"><span className="info-label">Last Login</span><span className="info-value">{formatDate(player?.lastLogin)}</span></div>
            </div>
          </div>
          <div className="player-card">
            <h3 className="player-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Responsible Gambling
            </h3>
            <div className="info-list">
              <div className="info-row"><span className="info-label">Daily Deposit</span><span className="info-value">{formatCurrency(limits.dailyDeposit)}</span></div>
              <div className="info-row"><span className="info-label">Weekly Deposit</span><span className="info-value">{formatCurrency(limits.weeklyDeposit)}</span></div>
              <div className="info-row"><span className="info-label">Monthly Deposit</span><span className="info-value">{formatCurrency(limits.monthlyDeposit)}</span></div>
              <div className="info-row"><span className="info-label">Loss Limit</span><span className="info-value">{limits.dailyLoss ? formatCurrency(limits.dailyLoss) : 'Not Set'}</span></div>
              <div className="info-row"><span className="info-label">Self-Exclusion</span><span className="info-value" style={{ color: 'var(--success)' }}>Not Active</span></div>
            </div>
          </div>
        </div>

        <div className="player-right-column">
          <div className="player-tabs">
            {['transactions', 'activity', 'bonuses', 'notes', 'sessions', 'kyc'].map(tab => (
              <button key={tab} className={`player-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="player-tab-content">
            {activeTab === 'transactions' && (
              <div className="transactions-panel">
                <div className="panel-header">
                  <h4 className="panel-title">Transactions</h4>
                  <div className="panel-filters">
                    <select className="form-select" style={{ width: 'auto', padding: '8px 12px' }} value={txFilter.type} onChange={e => setTxFilter({ ...txFilter, type: e.target.value })}>
                      <option value="">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdrawal">Withdrawals</option>
                      <option value="bet">Bets</option>
                      <option value="win">Wins</option>
                      <option value="bonus">Bonuses</option>
                    </select>
                    <select className="form-select" style={{ width: 'auto', padding: '8px 12px' }} value={txFilter.status} onChange={e => setTxFilter({ ...txFilter, status: e.target.value })}>
                      <option value="">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                <div className="transactions-table">
                  <div className="table-header"><span>Ref</span><span>Type</span><span>Currency</span><span>Amount</span><span>Status</span><span>Date</span></div>
                  {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                    <div key={tx.id} className="table-row">
                      <span className="tx-ref">{tx.reference?.substring(0, 12)}...</span>
                      <span className={`tx-type ${tx.type}`}>{tx.type}</span>
                      <span className="tx-currency">{tx.currency || 'USD'}</span>
                      <span className="tx-amount">{tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}</span>
                      <span className={`tx-status ${tx.status}`}>{tx.status}</span>
                      <span className="tx-date">{formatDate(tx.createdAt)}</span>
                    </div>
                  )) : <div className="empty-panel">No transactions found</div>}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-panel">
                <h4 className="panel-title">Activity Log</h4>
                <div className="activity-list">
                  {activityLog.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div className="activity-content">
                        <div className="activity-action">{activity.action}</div>
                        <div className="activity-details">{activity.details}</div>
                        <div className="activity-meta">
                          <span>IP: {activity.ip}</span>
                          <span>{formatDateTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bonuses' && (
              <div className="bonuses-panel">
                <div className="panel-header">
                  <h4 className="panel-title">Bonus History</h4>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowBonusModal(true)}>Grant Bonus</button>
                </div>
                <div className="bonuses-list">
                  {playerBonuses.length > 0 ? playerBonuses.map(bonus => (
                    <div key={bonus.id} className="bonus-item">
                      <div className="bonus-info">
                        <div className="bonus-name">{bonus.bonusName}</div>
                        <div className="bonus-amount">{formatCurrency(bonus.amount)}</div>
                      </div>
                      <div className="bonus-progress">
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(100, (bonus.wagered / bonus.wageringTarget) * 100)}%` }}></div></div>
                        <span>{Math.round((bonus.wagered / bonus.wageringTarget) * 100)}% wagered</span>
                      </div>
                      <span className={`badge badge-${bonus.status === 'active' ? 'primary' : bonus.status === 'completed' ? 'success' : 'danger'}`}>{bonus.status}</span>
                    </div>
                  )) : <div className="empty-panel">No bonuses</div>}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="notes-panel">
                <form onSubmit={handleAddNote} className="add-note-form">
                  <select className="form-select" style={{ width: 'auto' }} value={noteType} onChange={e => setNoteType(e.target.value)}>
                    <option value="general">General</option>
                    <option value="warning">Warning</option>
                    <option value="important">Important</option>
                    <option value="fraud">Fraud Alert</option>
                  </select>
                  <input type="text" className="form-input" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." />
                  <button type="submit" className="btn btn-primary btn-sm">Add</button>
                </form>
                <div className="notes-list">
                  {notes.length > 0 ? notes.map(note => (
                    <div key={note.id} className={`note-item ${note.type || 'general'}`}>
                      {note.type && note.type !== 'general' && <span className={`note-badge ${note.type}`}>{note.type}</span>}
                      <div className="note-content">{note.note}</div>
                      <div className="note-meta"><span>{note.adminName}</span><span>{formatDate(note.createdAt)}</span></div>
                    </div>
                  )) : <div className="empty-panel">No notes yet</div>}
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="sessions-panel">
                <h4 className="panel-title">Active Sessions</h4>
                <div className="session-item active">
                  <div className="session-info">
                    <span className="session-device">Chrome on Windows</span>
                    <span className="session-ip">192.168.1.100</span>
                  </div>
                  <div className="session-actions">
                    <span className="session-status">Active Now</span>
                    <button className="btn btn-sm btn-danger" onClick={handleForceLogout}>Terminate</button>
                  </div>
                </div>
                <div className="session-item">
                  <div className="session-info">
                    <span className="session-device">Safari on iOS</span>
                    <span className="session-ip">192.168.1.101</span>
                  </div>
                  <div className="session-actions">
                    <span className="session-time">{formatDateTime(player?.lastLogin)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="kyc-panel">
                <div className="kyc-status-card">
                  <span className="kyc-label">Current Status</span>
                  <span className={`kyc-badge ${player?.kycStatus}`}>{player?.kycStatus}</span>
                </div>
                <div className="kyc-documents">
                  <h5>Documents</h5>
                  <div className="kyc-doc-item">
                    <div className="doc-info"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg><span>ID Card</span></div>
                    <span className={`doc-status ${player?.kycStatus === 'verified' ? 'approved' : 'pending'}`}>{player?.kycStatus === 'verified' ? 'Verified' : 'Pending'}</span>
                  </div>
                  <div className="kyc-doc-item">
                    <div className="doc-info"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg><span>Proof of Address</span></div>
                    <span className={`doc-status ${player?.kycStatus === 'verified' ? 'approved' : 'pending'}`}>{player?.kycStatus === 'verified' ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
                <button className="btn btn-primary mt-2" onClick={() => { setSelectedKycStatus(player?.kycStatus || ''); setShowKycModal(true); }}>Update KYC Status</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="modal-overlay" onClick={() => setShowBalanceModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{balanceAction === 'add' ? 'Add Funds' : 'Deduct Funds'}</h3>
              <button className="modal-close" onClick={() => setShowBalanceModal(false)}>×</button>
            </div>
            <form onSubmit={handleBalanceAdjust}>
              <div className="form-group">
                <label className="form-label">Current Balance</label>
                <div className="current-balance">{formatCurrency(player?.balance)}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-select" value={balanceCurrency} onChange={e => setBalanceCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="DOGE">DOGE</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input type="number" step="0.01" min="0" className="form-input" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Reason (required)</label>
                <select className="form-select" value={balanceReason} onChange={e => setBalanceReason(e.target.value)} required>
                  <option value="">Select reason...</option>
                  <option value="Manual adjustment">Manual adjustment</option>
                  <option value="Compensation">Compensation</option>
                  <option value="Correction">Correction</option>
                  <option value="Promotion">Promotion</option>
                  <option value="Fraud recovery">Fraud recovery</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBalanceModal(false)}>Cancel</button>
                <button type="submit" className={`btn ${balanceAction === 'add' ? 'btn-success' : 'btn-danger'}`}>{balanceAction === 'add' ? 'Add Funds' : 'Deduct Funds'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bonus Modal */}
      {showBonusModal && (
        <div className="modal-overlay" onClick={() => setShowBonusModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Grant Bonus</h3>
              <button className="modal-close" onClick={() => setShowBonusModal(false)}>×</button>
            </div>
            <form onSubmit={handleGrantBonus}>
              <div className="form-group">
                <label className="form-label">Select Bonus</label>
                <select className="form-select" value={selectedBonus} onChange={e => setSelectedBonus(e.target.value)}>
                  <option value="">Manual Amount</option>
                  {bonuses.filter(b => b.status === 'active').map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input type="number" step="0.01" min="0" className="form-input" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} placeholder={selectedBonus ? 'Leave empty for default' : 'Enter amount'} required={!selectedBonus} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBonusModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Grant Bonus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Limits Modal */}
      {showLimitsModal && (
        <div className="modal-overlay" onClick={() => setShowLimitsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Responsible Gambling Limits</h3>
              <button className="modal-close" onClick={() => setShowLimitsModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateLimits}>
              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Daily Deposit Limit</label>
                  <input type="number" className="form-input" value={limits.dailyDeposit} onChange={e => setLimits({ ...limits, dailyDeposit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weekly Deposit Limit</label>
                  <input type="number" className="form-input" value={limits.weeklyDeposit} onChange={e => setLimits({ ...limits, weeklyDeposit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Deposit Limit</label>
                  <input type="number" className="form-input" value={limits.monthlyDeposit} onChange={e => setLimits({ ...limits, monthlyDeposit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Daily Loss Limit</label>
                  <input type="number" className="form-input" value={limits.dailyLoss} onChange={e => setLimits({ ...limits, dailyLoss: e.target.value })} placeholder="Not set" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Session Time Limit (minutes)</label>
                <input type="number" className="form-input" value={limits.sessionTime} onChange={e => setLimits({ ...limits, sessionTime: e.target.value })} placeholder="Not set" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLimitsModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Limits</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Self-Exclusion Modal */}
      {showExclusionModal && (
        <div className="modal-overlay" onClick={() => setShowExclusionModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Self-Exclusion</h3>
              <button className="modal-close" onClick={() => setShowExclusionModal(false)}>×</button>
            </div>
            <form onSubmit={handleSelfExclusion}>
              <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                <strong>Warning:</strong> Self-exclusion will prevent the player from accessing their account.
              </div>
              <div className="form-group">
                <label className="form-label">Exclusion Period</label>
                <select className="form-select" value={exclusionPeriod} onChange={e => setExclusionPeriod(e.target.value)} required>
                  <option value="">Select period...</option>
                  <option value="24 hours">24 Hours (Cooling Off)</option>
                  <option value="7 days">7 Days</option>
                  <option value="30 days">30 Days</option>
                  <option value="6 months">6 Months</option>
                  <option value="1 year">1 Year</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea className="form-input" rows="3" value={exclusionReason} onChange={e => setExclusionReason(e.target.value)} placeholder="Enter reason for self-exclusion..." required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExclusionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Apply Self-Exclusion</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Modal */}
      {showKycModal && (
        <div className="modal-overlay" onClick={() => setShowKycModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Update KYC Status</h3>
              <button className="modal-close" onClick={() => setShowKycModal(false)}>×</button>
            </div>
            <form onSubmit={handleKycUpdate}>
              <div className="form-group">
                <label className="form-label">Current Status</label>
                <div className="current-kyc-status"><span className={`kyc-badge ${player?.kycStatus}`}>{player?.kycStatus}</span></div>
              </div>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={selectedKycStatus} onChange={e => setSelectedKycStatus(e.target.value)} required>
                  <option value="">Select status...</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="modal-footer kyc-modal-footer">
                <button type="button" className="btn btn-danger" onClick={handleRemoveKyc} disabled={player?.kycStatus === 'pending'}>Remove KYC</button>
                <div className="modal-footer-right">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowKycModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!selectedKycStatus || selectedKycStatus === player?.kycStatus}>Update</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDetail;
