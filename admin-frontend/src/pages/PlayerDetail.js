import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getPlayer, getPlayerTransactions, adjustBalance,
  addPlayerNote, updatePlayerStatus, getBonuses, awardBonus
} from '../services/api';

const PlayerDetail = () => {
  const { t } = useTranslation();
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
    // Map non-ISO-4217 currency codes to displayable format
    const cryptoCurrencies = ['USDC', 'USDT', 'BTC', 'ETH', 'SOL', 'DOGE', 'BNB', 'XRP'];
    if (cryptoCurrencies.includes(currency)) {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount || 0);
    } catch {
      return `${Number(amount || 0).toFixed(2)} ${currency}`;
    }
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
      <button onClick={() => navigate('/players')} className="btn btn-secondary">{t('playerDetail.backToPlayers')}</button>
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
              {t('playerDetail.activate')}
            </button>
          ) : (
            <>
              <button onClick={() => handleStatusChange('suspended')} className="action-btn suspend" disabled={player?.status === 'suspended'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                {t('playerDetail.suspend')}
              </button>
              <button onClick={() => handleStatusChange('blocked')} className="action-btn ban" disabled={player?.status === 'blocked'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                {t('playerDetail.block')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="player-stats-row">
        <div className="player-stat-card green">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="12" r="3" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.balance')}</span><span className="stat-value">{formatCurrency(player?.balance)}</span></div>
        </div>
        <div className="player-stat-card purple">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.bonus')}</span><span className="stat-value">{formatCurrency(player?.bonusBalance)}</span></div>
        </div>
        <div className="player-stat-card cyan">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M2 12l10-10 10 10" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.deposits')}</span><span className="stat-value">{formatCurrency(stats?.deposits)}</span></div>
        </div>
        <div className="player-stat-card yellow">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22v-20M2 12l10 10 10-10" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.withdrawals')}</span><span className="stat-value">{formatCurrency(stats?.withdrawals)}</span></div>
        </div>
        <div className="player-stat-card orange">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.wagered')}</span><span className="stat-value">{formatCurrency(stats?.wagered)}</span></div>
        </div>
        <div className="player-stat-card red">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.ggr')}</span><span className="stat-value">{formatCurrency(stats?.ggr)}</span></div>
        </div>
        <div className="player-stat-card teal">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.ngr')}</span><span className="stat-value">{formatCurrency(stats?.ngr)}</span></div>
        </div>
        <div className="player-stat-card pink">
          <div className="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg></div>
          <div className="stat-content"><span className="stat-label">{t('playerDetail.rebates')}</span><span className="stat-value">{formatCurrency(stats?.rebates)}</span></div>
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="quick-actions-section">
        <h3 className="section-label">{t('playerDetail.adminActions')}</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-item" onClick={() => { setBalanceAction('add'); setShowBalanceModal(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            {t('playerDetail.addFunds')}
          </button>
          <button className="quick-action-item" onClick={() => { setBalanceAction('deduct'); setShowBalanceModal(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
            {t('playerDetail.deductFunds')}
          </button>
          <button className="quick-action-item" onClick={() => setShowBonusModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /></svg>
            {t('playerDetail.grantBonus')}
          </button>
          <button className="quick-action-item" onClick={() => { setSelectedKycStatus(player?.kycStatus || ''); setShowKycModal(true); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            {t('playerDetail.updateKyc')}
          </button>
          <button className="quick-action-item" onClick={() => setShowLimitsModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v10" /><path d="M1 12h6m6 0h10" /></svg>
            {t('playerDetail.setLimits')}
          </button>
          <button className="quick-action-item" onClick={() => setShowExclusionModal(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
            {t('playerDetail.selfExclude')}
          </button>
          <button className="quick-action-item" onClick={handleForceLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            {t('playerDetail.forceLogout')}
          </button>
          <button className="quick-action-item" onClick={handleResetPassword}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            {t('playerDetail.resetPassword')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="player-content-grid">
        <div className="player-left-column">
          <div className="player-card">
            <h3 className="player-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              {t('playerDetail.personalInformation')}
            </h3>
            <div className="info-list">
              <div className="info-row"><span className="info-label">{t('playerDetail.fullName')}</span><span className="info-value">{player?.firstName} {player?.lastName}</span></div>
              <div className="info-row"><span className="info-label">{t('common.email')}</span><span className="info-value">{player?.email}</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.phone')}</span><span className="info-value">{player?.phone || '-'}</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.country')}</span><span className="info-value">United States</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.currency')}</span><span className="info-value">USD</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.registered')}</span><span className="info-value">{formatDate(player?.createdAt)}</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.lastLogin')}</span><span className="info-value">{formatDate(player?.lastLogin)}</span></div>
            </div>
          </div>
          <div className="player-card">
            <h3 className="player-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              {t('playerDetail.responsibleGambling')}
            </h3>
            <div className="info-list">
              <div className="info-row"><span className="info-label">{t('playerDetail.dailyDeposit')}</span><span className="info-value">{formatCurrency(limits.dailyDeposit)}</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.weeklyDeposit')}</span><span className="info-value">{formatCurrency(limits.weeklyDeposit)}</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.monthlyDeposit')}</span><span className="info-value">{formatCurrency(limits.monthlyDeposit)}</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.lossLimit')}</span><span className="info-value">{limits.dailyLoss ? formatCurrency(limits.dailyLoss) : t('playerDetail.notSet')}</span></div>
              <div className="info-row"><span className="info-label">{t('playerDetail.selfExclusion')}</span><span className="info-value" style={{ color: 'var(--success)' }}>{t('playerDetail.notActive')}</span></div>
            </div>
          </div>
        </div>

        <div className="player-right-column">
          <div className="player-tabs">
            {[
              { key: 'transactions', label: t('playerDetail.transactions') },
              { key: 'activity', label: t('playerDetail.activity') },
              { key: 'bonuses', label: t('playerDetail.bonuses') },
              { key: 'notes', label: t('playerDetail.notes') },
              { key: 'sessions', label: t('playerDetail.sessions') },
              { key: 'kyc', label: t('playerDetail.kyc') },
            ].map(tab => (
              <button key={tab.key} className={`player-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="player-tab-content">
            {activeTab === 'transactions' && (
              <div className="transactions-panel">
                <div className="panel-header">
                  <h4 className="panel-title">{t('playerDetail.transactions')}</h4>
                  <div className="panel-filters">
                    <select className="form-select" style={{ width: 'auto', padding: '8px 12px' }} value={txFilter.type} onChange={e => setTxFilter({ ...txFilter, type: e.target.value })}>
                      <option value="">{t('playerDetail.allTypes')}</option>
                      <option value="deposit">{t('playerDetail.depositsOption')}</option>
                      <option value="withdrawal">{t('playerDetail.withdrawalsOption')}</option>
                      <option value="bet">{t('playerDetail.betsOption')}</option>
                      <option value="win">{t('playerDetail.winsOption')}</option>
                      <option value="bonus">{t('playerDetail.bonusesOption')}</option>
                    </select>
                    <select className="form-select" style={{ width: 'auto', padding: '8px 12px' }} value={txFilter.status} onChange={e => setTxFilter({ ...txFilter, status: e.target.value })}>
                      <option value="">{t('playerDetail.allStatus')}</option>
                      <option value="completed">{t('playerDetail.completedOption')}</option>
                      <option value="pending">{t('common.pending')}</option>
                      <option value="rejected">{t('common.rejected')}</option>
                    </select>
                  </div>
                </div>
                <div className="transactions-table">
                  <div className="table-header"><span>{t('playerDetail.ref')}</span><span>{t('common.type')}</span><span>{t('playerDetail.currency')}</span><span>{t('common.amount')}</span><span>{t('common.status')}</span><span>{t('common.date')}</span></div>
                  {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                    <div key={tx.id} className="table-row">
                      <span className="tx-ref">{tx.reference?.substring(0, 12)}...</span>
                      <span className={`tx-type ${tx.type}`}>{tx.type}</span>
                      <span className="tx-currency">{tx.currency || 'USD'}</span>
                      <span className="tx-amount">{tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}</span>
                      <span className={`tx-status ${tx.status}`}>{tx.status}</span>
                      <span className="tx-date">{formatDate(tx.createdAt)}</span>
                    </div>
                  )) : <div className="empty-panel">{t('playerDetail.noTransactions')}</div>}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="activity-panel">
                <h4 className="panel-title">{t('playerDetail.activityLog')}</h4>
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
                  <h4 className="panel-title">{t('playerDetail.bonusHistory')}</h4>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowBonusModal(true)}>{t('playerDetail.grantBonus')}</button>
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
                  )) : <div className="empty-panel">{t('playerDetail.noBonuses')}</div>}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="notes-panel">
                <form onSubmit={handleAddNote} className="add-note-form">
                  <select className="form-select" style={{ width: 'auto' }} value={noteType} onChange={e => setNoteType(e.target.value)}>
                    <option value="general">{t('playerDetail.noteGeneral')}</option>
                    <option value="warning">{t('playerDetail.noteWarning')}</option>
                    <option value="important">{t('playerDetail.noteImportant')}</option>
                    <option value="fraud">{t('playerDetail.noteFraud')}</option>
                  </select>
                  <input type="text" className="form-input" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder={t('playerDetail.addNotePlaceholder')} />
                  <button type="submit" className="btn btn-primary btn-sm">{t('playerDetail.add')}</button>
                </form>
                <div className="notes-list">
                  {notes.length > 0 ? notes.map(note => (
                    <div key={note.id} className={`note-item ${note.type || 'general'}`}>
                      {note.type && note.type !== 'general' && <span className={`note-badge ${note.type}`}>{note.type}</span>}
                      <div className="note-content">{note.note}</div>
                      <div className="note-meta"><span>{note.adminName}</span><span>{formatDate(note.createdAt)}</span></div>
                    </div>
                  )) : <div className="empty-panel">{t('playerDetail.noNotes')}</div>}
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="sessions-panel">
                <h4 className="panel-title">{t('playerDetail.activeSessions')}</h4>
                <div className="session-item active">
                  <div className="session-info">
                    <span className="session-device">Chrome on Windows</span>
                    <span className="session-ip">192.168.1.100</span>
                  </div>
                  <div className="session-actions">
                    <span className="session-status">{t('playerDetail.activeNow')}</span>
                    <button className="btn btn-sm btn-danger" onClick={handleForceLogout}>{t('playerDetail.terminate')}</button>
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
                  <span className="kyc-label">{t('playerDetail.currentStatus')}</span>
                  <span className={`kyc-badge ${player?.kycStatus}`}>{player?.kycStatus}</span>
                </div>
                <div className="kyc-documents">
                  <h5>{t('playerDetail.documents')}</h5>
                  <div className="kyc-doc-item">
                    <div className="doc-info"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg><span>{t('playerDetail.idCard')}</span></div>
                    <span className={`doc-status ${player?.kycStatus === 'verified' ? 'approved' : 'pending'}`}>{player?.kycStatus === 'verified' ? t('common.verified') : t('common.pending')}</span>
                  </div>
                  <div className="kyc-doc-item">
                    <div className="doc-info"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg><span>{t('playerDetail.proofOfAddress')}</span></div>
                    <span className={`doc-status ${player?.kycStatus === 'verified' ? 'approved' : 'pending'}`}>{player?.kycStatus === 'verified' ? t('common.verified') : t('common.pending')}</span>
                  </div>
                </div>
                <button className="btn btn-primary mt-2" onClick={() => { setSelectedKycStatus(player?.kycStatus || ''); setShowKycModal(true); }}>{t('playerDetail.updateKycStatus')}</button>
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
              <h3 className="modal-title">{balanceAction === 'add' ? t('playerDetail.addFunds') : t('playerDetail.deductFunds')}</h3>
              <button className="modal-close" onClick={() => setShowBalanceModal(false)}>×</button>
            </div>
            <form onSubmit={handleBalanceAdjust}>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.currentBalance')}</label>
                <div className="current-balance">{formatCurrency(player?.balance)}</div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.currency')}</label>
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
                <label className="form-label">{t('common.amount')}</label>
                <input type="number" step="0.01" min="0" className="form-input" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.reasonRequired')}</label>
                <select className="form-select" value={balanceReason} onChange={e => setBalanceReason(e.target.value)} required>
                  <option value="">{t('playerDetail.selectReason')}</option>
                  <option value="Manual adjustment">{t('playerDetail.manualAdjustment')}</option>
                  <option value="Compensation">{t('playerDetail.compensation')}</option>
                  <option value="Correction">{t('playerDetail.correction')}</option>
                  <option value="Promotion">{t('playerDetail.promotionReason')}</option>
                  <option value="Fraud recovery">{t('playerDetail.fraudRecovery')}</option>
                  <option value="Other">{t('playerDetail.other')}</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBalanceModal(false)}>{t('common.cancel')}</button>
                <button type="submit" className={`btn ${balanceAction === 'add' ? 'btn-success' : 'btn-danger'}`}>{balanceAction === 'add' ? t('playerDetail.addFunds') : t('playerDetail.deductFunds')}</button>
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
              <h3 className="modal-title">{t('playerDetail.grantBonus')}</h3>
              <button className="modal-close" onClick={() => setShowBonusModal(false)}>×</button>
            </div>
            <form onSubmit={handleGrantBonus}>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.selectBonus')}</label>
                <select className="form-select" value={selectedBonus} onChange={e => setSelectedBonus(e.target.value)}>
                  <option value="">{t('playerDetail.manualAmount')}</option>
                  {bonuses.filter(b => b.status === 'active').map(b => <option key={b.id} value={b.id}>{b.name} ({b.type})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('common.amount')}</label>
                <input type="number" step="0.01" min="0" className="form-input" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} placeholder={selectedBonus ? t('playerDetail.leaveEmptyForDefault') : t('common.amount')} required={!selectedBonus} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBonusModal(false)}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('playerDetail.grantBonus')}</button>
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
              <h3 className="modal-title">{t('playerDetail.responsibleGamblingLimits')}</h3>
              <button className="modal-close" onClick={() => setShowLimitsModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateLimits}>
              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">{t('playerDetail.dailyDepositLimit')}</label>
                  <input type="number" className="form-input" value={limits.dailyDeposit} onChange={e => setLimits({ ...limits, dailyDeposit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('playerDetail.weeklyDepositLimit')}</label>
                  <input type="number" className="form-input" value={limits.weeklyDeposit} onChange={e => setLimits({ ...limits, weeklyDeposit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('playerDetail.monthlyDepositLimit')}</label>
                  <input type="number" className="form-input" value={limits.monthlyDeposit} onChange={e => setLimits({ ...limits, monthlyDeposit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('playerDetail.dailyLossLimit')}</label>
                  <input type="number" className="form-input" value={limits.dailyLoss} onChange={e => setLimits({ ...limits, dailyLoss: e.target.value })} placeholder={t('playerDetail.notSet')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.sessionTimeLimit')}</label>
                <input type="number" className="form-input" value={limits.sessionTime} onChange={e => setLimits({ ...limits, sessionTime: e.target.value })} placeholder={t('playerDetail.notSet')} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLimitsModal(false)}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('playerDetail.updateLimits')}</button>
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
              <h3 className="modal-title">{t('playerDetail.selfExclusion')}</h3>
              <button className="modal-close" onClick={() => setShowExclusionModal(false)}>×</button>
            </div>
            <form onSubmit={handleSelfExclusion}>
              <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
                <strong>Warning:</strong> {t('playerDetail.selfExclusionWarning')}
              </div>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.exclusionPeriod')}</label>
                <select className="form-select" value={exclusionPeriod} onChange={e => setExclusionPeriod(e.target.value)} required>
                  <option value="">{t('playerDetail.selectPeriod')}</option>
                  <option value="24 hours">{t('playerDetail.period24h')}</option>
                  <option value="7 days">{t('playerDetail.period7d')}</option>
                  <option value="30 days">{t('playerDetail.period30d')}</option>
                  <option value="6 months">{t('playerDetail.period6m')}</option>
                  <option value="1 year">{t('playerDetail.period1y')}</option>
                  <option value="permanent">{t('playerDetail.periodPermanent')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.exclusionReason')}</label>
                <textarea className="form-input" rows="3" value={exclusionReason} onChange={e => setExclusionReason(e.target.value)} placeholder={t('playerDetail.exclusionReason') + '...'} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExclusionModal(false)}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-danger">{t('playerDetail.applySelfExclusion')}</button>
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
              <h3 className="modal-title">{t('playerDetail.updateKycStatus')}</h3>
              <button className="modal-close" onClick={() => setShowKycModal(false)}>×</button>
            </div>
            <form onSubmit={handleKycUpdate}>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.currentStatus')}</label>
                <div className="current-kyc-status"><span className={`kyc-badge ${player?.kycStatus}`}>{player?.kycStatus}</span></div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('playerDetail.newStatus')}</label>
                <select className="form-select" value={selectedKycStatus} onChange={e => setSelectedKycStatus(e.target.value)} required>
                  <option value="">{t('playerDetail.selectStatus')}</option>
                  <option value="pending">{t('common.pending')}</option>
                  <option value="under_review">{t('playerDetail.kycUnderReview')}</option>
                  <option value="verified">{t('common.verified')}</option>
                  <option value="rejected">{t('common.rejected')}</option>
                </select>
              </div>
              <div className="modal-footer kyc-modal-footer">
                <button type="button" className="btn btn-danger" onClick={handleRemoveKyc} disabled={player?.kycStatus === 'pending'}>{t('playerDetail.removeKyc')}</button>
                <div className="modal-footer-right">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowKycModal(false)}>{t('common.cancel')}</button>
                  <button type="submit" className="btn btn-primary" disabled={!selectedKycStatus || selectedKycStatus === player?.kycStatus}>{t('playerDetail.update')}</button>
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
