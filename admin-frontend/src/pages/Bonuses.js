import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBonusStats, getBonuses, getPlayerBonuses, cancelPlayerBonus } from '../services/api';

const Bonuses = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('bonuses');
  const [stats, setStats] = useState({});
  const [bonuses, setBonuses] = useState([]);
  const [playerBonusesList, setPlayerBonusesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => { loadStats(); loadBonuses(); }, []);
  useEffect(() => { if (activeTab === 'player-bonuses') loadPlayerBonuses(); }, [activeTab, pagination.page]);

  const loadStats = async () => {
    try { const r = await getBonusStats(); setStats(r.stats || {}); } catch { /* silent */ }
  };

  const loadBonuses = async () => {
    try {
      setLoading(true); setError(null);
      const r = await getBonuses({ page: 1, limit: 100 });
      setBonuses(r.bonuses || []);
    } catch { setError('Failed to load bonuses'); setBonuses([]); }
    finally { setLoading(false); }
  };

  const loadPlayerBonuses = async () => {
    try {
      setLoading(true); setError(null);
      const r = await getPlayerBonuses({ page: pagination.page, limit: 20 });
      setPlayerBonusesList(r.playerBonuses || []);
      const pg = r.pagination || {};
      setPagination({ page: pg.page || 1, pages: pg.pages || 1, total: pg.total || 0 });
    } catch { setError('Failed to load player bonuses'); setPlayerBonusesList([]); }
    finally { setLoading(false); }
  };

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Active Campaigns</div>
          <div className="stat-card-value">{stats.active_bonuses || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Active Player Bonuses</div>
          <div className="stat-card-value">{stats.active_player_bonuses || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Bonus Given</div>
          <div className="stat-card-value">{fmt(stats.total_bonus_given)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Wagered</div>
          <div className="stat-card-value">{fmt(stats.total_wagered_on_bonuses)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'bonuses' ? 'active' : ''}`} onClick={() => setActiveTab('bonuses')}>Bonus Campaigns</button>
        <button className={`tab ${activeTab === 'player-bonuses' ? 'active' : ''}`} onClick={() => setActiveTab('player-bonuses')}>Player Bonuses</button>
      </div>

      {/* Bonus Campaigns */}
      {activeTab === 'bonuses' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Bonus Campaigns</h3>
            <button className="btn btn-primary" onClick={() => navigate('/bonuses/new')}>
              + Create Bonus
            </button>
          </div>

          {loading ? <div className="loading"><div className="spinner"></div></div> : error ? (
            <div style={{ padding: '24px', color: 'var(--danger)' }}>{error}</div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Wagering</th>
                    <th>Games</th>
                    <th>Auto Credit</th>
                    <th>Claims</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', color: 'var(--gray)', padding: '40px' }}>
                        No bonus campaigns yet.{' '}
                        <span
                          onClick={() => navigate('/bonuses/new')}
                          style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Create your first bonus
                        </span>
                      </td>
                    </tr>
                  ) : bonuses.map(bonus => (
                    <tr key={bonus.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/bonuses/${bonus.id}`)}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{bonus.name}</div>
                        {bonus.code && <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Code: {bonus.code}</div>}
                        {bonus.expiryDays && <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Expires {bonus.expiryDays}d after claim</div>}
                      </td>
                      <td>
                        <span className={`badge badge-${bonus.type === 'joining' ? 'success' : bonus.type === 'deposit' ? 'primary' : bonus.type === 'birthday' ? 'warning' : 'secondary'}`}>
                          {bonus.type}
                        </span>
                      </td>
                      <td>
                        {bonus.amount > 0 && <div>{fmt(bonus.amount)}</div>}
                        {bonus.percentage > 0 && <div>{bonus.percentage}%</div>}
                        {bonus.maxBonusCap > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Cap: {fmt(bonus.maxBonusCap)}</div>}
                      </td>
                      <td>{bonus.wageringReq}x</td>
                      <td>
                        <span style={{
                          background: bonus.gamesConfigured > 0 ? '#dcfce7' : '#f3f4f6',
                          color: bonus.gamesConfigured > 0 ? '#16a34a' : 'var(--gray)',
                          borderRadius: '12px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: '600'
                        }}>
                          {bonus.gamesConfigured || 0} game{bonus.gamesConfigured !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${bonus.isAutoCredit ? 'success' : 'secondary'}`}>
                          {bonus.isAutoCredit ? 'Auto' : 'Manual'}
                        </span>
                      </td>
                      <td>{bonus.currentClaims}{bonus.maxClaims ? `/${bonus.maxClaims}` : ''}</td>
                      <td>
                        <span className={`badge badge-${bonus.status === 'active' ? 'success' : 'danger'}`}>{bonus.status}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn btn-sm btn-primary" onClick={() => navigate(`/bonuses/${bonus.id}`)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Player Bonuses */}
      {activeTab === 'player-bonuses' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Player Bonuses</h3>
          </div>
          {loading ? <div className="loading"><div className="spinner"></div></div> : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Player</th><th>Bonus</th><th>Amount</th><th>Progress</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {playerBonusesList.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--gray)', padding: '24px' }}>No player bonuses found</td></tr>
                  ) : playerBonusesList.map(pb => (
                    <tr key={pb.id}>
                      <td>{pb.playerEmail}</td>
                      <td>{pb.bonusName}</td>
                      <td>{fmt(pb.amount)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="progress-bar" style={{ width: '80px' }}>
                            <div className="progress-fill" style={{ width: `${pb.progress}%` }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem' }}>{pb.progress}%</span>
                        </div>
                      </td>
                      <td><span className={`badge badge-${pb.status === 'active' ? 'primary' : pb.status === 'completed' ? 'success' : 'danger'}`}>{pb.status}</span></td>
                      <td>
                        {pb.status === 'active' && (
                          <button onClick={() => cancelPlayerBonus(pb.id, 'Admin cancelled')} className="btn btn-sm btn-danger">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination.pages > 1 && (
            <div className="pagination mt-2">
              <button disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</button>
              <span style={{ padding: '8px 14px', color: 'var(--gray)' }}>Page {pagination.page} of {pagination.pages}</span>
              <button disabled={pagination.page === pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bonuses;
