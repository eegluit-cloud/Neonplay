import React, { useState, useEffect } from 'react';
import {
  getBonusStats, getBonuses, createBonus, updateBonus, deleteBonus,
  getPlayerBonuses, cancelPlayerBonus, uploadImage
} from '../services/api';

const Bonuses = () => {
  const [activeTab, setActiveTab] = useState('bonuses');
  const [stats, setStats] = useState({});
  const [bonuses, setBonuses] = useState([]);
  const [playerBonusesList, setPlayerBonusesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showModal, setShowModal] = useState(null);
  const [editBonus, setEditBonus] = useState(null);
  const [formData, setFormData] = useState({
    name: '', code: '', type: 'deposit', amount: '', percentage: '',
    wageringReq: '30', minDeposit: '', maxCap: '', description: '', terms: '', imageUrl: ''
  });

  useEffect(() => {
    loadStats();
    loadBonuses();
  }, []);

  useEffect(() => {
    if (activeTab === 'player-bonuses') loadPlayerBonuses();
  }, [activeTab, pagination.page]);

  const loadStats = async () => {
    try {
      const response = await getBonusStats();
      setStats(response.stats || {});
    } catch (err) {
      console.error('Failed to load bonus stats:', err);
      setError('Failed to load bonus stats');
    }
  };

  const loadBonuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBonuses({ page: 1, limit: 100 });
      setBonuses(response.bonuses || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load bonuses:', err);
      setError('Failed to load bonuses');
      setBonuses([]);
      setLoading(false);
    }
  };

  const loadPlayerBonuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: 20
      };
      const response = await getPlayerBonuses(params);
      setPlayerBonusesList(response.playerBonuses || []);

      // Backend returns pagination nested in response.pagination
      const paginationData = response.pagination || {};
      setPagination({
        page: paginationData.page || 1,
        pages: paginationData.pages || 1,
        total: paginationData.total || 0
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load player bonuses:', err);
      setError('Failed to load player bonuses');
      setPlayerBonusesList([]);
      setLoading(false);
    }
  };

  const handleCreateBonus = async (e) => {
    e.preventDefault();
    const bonusData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      percentage: parseFloat(formData.percentage) || 0,
      wageringReq: parseFloat(formData.wageringReq) || 1,
      minDeposit: parseFloat(formData.minDeposit) || 0,
      maxCap: formData.maxCap ? parseFloat(formData.maxCap) : null,
    };

    try {
      const response = await createBonus(bonusData);
      setBonuses([...bonuses, response.bonus]);
      setShowModal(null);
      resetForm();
      alert('Bonus created successfully');
      loadStats(); // Reload stats
    } catch (err) {
      console.error('Failed to create bonus:', err);
      alert('Failed to create bonus: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpdateBonus = async (e) => {
    e.preventDefault();
    const bonusData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      percentage: parseFloat(formData.percentage) || 0,
      wageringReq: parseFloat(formData.wageringReq) || 1,
      minDeposit: parseFloat(formData.minDeposit) || 0,
      maxCap: formData.maxCap ? parseFloat(formData.maxCap) : null,
    };

    try {
      await updateBonus(editBonus.id, bonusData);
      setBonuses(bonuses.map(b => b.id === editBonus.id ? { ...b, ...bonusData } : b));
      setShowModal(null);
      setEditBonus(null);
      resetForm();
      alert('Bonus updated successfully');
    } catch (err) {
      console.error('Failed to update bonus:', err);
      alert('Failed to update bonus: ' + (err.message || 'Unknown error'));
    }
  };

  const handleStatusChange = (bonusId, status) => {
    setBonuses(bonuses.map(b => b.id === bonusId ? { ...b, status } : b));
  };

  const handleCancelPlayerBonus = (playerBonusId) => {
    const reason = window.prompt('Reason for cancellation:');
    if (!reason) return;
    setPlayerBonusesList(playerBonusesList.map(pb =>
      pb.id === playerBonusId ? { ...pb, status: 'cancelled' } : pb
    ));
    alert('Player bonus cancelled');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadImage(file);
      setFormData({ ...formData, imageUrl: response.imageUrl });
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to upload image');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', code: '', type: 'deposit', amount: '', percentage: '',
      wageringReq: '30', minDeposit: '', maxCap: '', description: '', terms: '', imageUrl: ''
    });
  };

  const openEditModal = (bonus) => {
    setEditBonus(bonus);
    setFormData({
      name: bonus.name,
      code: bonus.code || '',
      type: bonus.type,
      amount: bonus.amount?.toString() || '',
      percentage: bonus.percentage?.toString() || '',
      wageringReq: bonus.wageringReq?.toString() || '30',
      minDeposit: bonus.minDeposit?.toString() || '',
      maxCap: bonus.maxCap?.toString() || '',
      description: bonus.description || '',
      terms: bonus.terms || '',
      imageUrl: bonus.imageUrl || ''
    });
    setShowModal('edit');
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

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
          <div className="stat-card-value">{formatCurrency(stats.total_bonus_given)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Total Wagered</div>
          <div className="stat-card-value">{formatCurrency(stats.total_wagered_on_bonuses)}</div>
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
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal('create'); }}>
              Create Bonus
            </button>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Wagering</th>
                    <th>Claims</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map(bonus => (
                    <tr key={bonus.id}>
                      <td>
                        <div style={{ fontWeight: '500' }}>{bonus.name}</div>
                        {bonus.code && <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Code: {bonus.code}</div>}
                      </td>
                      <td><span className={`badge badge-${bonus.type === 'joining' ? 'success' : bonus.type === 'deposit' ? 'primary' : 'warning'}`}>{bonus.type}</span></td>
                      <td>
                        {bonus.amount > 0 && formatCurrency(bonus.amount)}
                        {bonus.percentage > 0 && ` ${bonus.percentage}%`}
                        {bonus.maxCap && <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Max: {formatCurrency(bonus.maxCap)}</div>}
                      </td>
                      <td>{bonus.wageringReq}x</td>
                      <td>{bonus.currentClaims}{bonus.maxClaims && `/${bonus.maxClaims}`}</td>
                      <td><span className={`badge badge-${bonus.status === 'active' ? 'success' : 'danger'}`}>{bonus.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => openEditModal(bonus)} className="btn btn-sm btn-secondary">Edit</button>
                          <button
                            onClick={() => handleStatusChange(bonus.id, bonus.status === 'active' ? 'inactive' : 'active')}
                            className={`btn btn-sm ${bonus.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                          >
                            {bonus.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
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
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Bonus</th>
                    <th>Amount</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playerBonusesList.map(pb => (
                    <tr key={pb.id}>
                      <td>{pb.playerEmail}</td>
                      <td>{pb.bonusName}</td>
                      <td>{formatCurrency(pb.amount)}</td>
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
                          <button onClick={() => handleCancelPlayerBonus(pb.id)} className="btn btn-sm btn-danger">Cancel</button>
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
              <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>Previous</button>
              <span style={{ padding: '8px 14px', color: 'var(--gray)' }}>Page {pagination.page} of {pagination.pages}</span>
              <button disabled={pagination.page === pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>Next</button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showModal === 'create' || showModal === 'edit') && (
        <div className="modal-overlay" onClick={() => { setShowModal(null); setEditBonus(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{showModal === 'create' ? 'Create Bonus' : 'Edit Bonus'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(null); setEditBonus(null); }}>×</button>
            </div>
            <form onSubmit={showModal === 'create' ? handleCreateBonus : handleUpdateBonus}>
              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Code (optional)</label>
                  <input type="text" className="form-input" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                  <option value="joining">Joining</option>
                  <option value="deposit">Deposit</option>
                  <option value="losing">Losing/Cashback</option>
                  <option value="reload">Reload</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Fixed Amount</label>
                  <input type="number" step="0.01" className="form-input" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Percentage</label>
                  <input type="number" step="0.01" className="form-input" value={formData.percentage} onChange={(e) => setFormData({ ...formData, percentage: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-3 gap-2">
                <div className="form-group">
                  <label className="form-label">Wagering Req (x)</label>
                  <input type="number" step="0.1" className="form-input" value={formData.wageringReq} onChange={(e) => setFormData({ ...formData, wageringReq: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Deposit</label>
                  <input type="number" step="0.01" className="form-input" value={formData.minDeposit} onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Cap</label>
                  <input type="number" step="0.01" className="form-input" value={formData.maxCap} onChange={(e) => setFormData({ ...formData, maxCap: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Terms</label>
                <textarea className="form-input" rows="2" value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
              </div>


              <div className="form-group">
                <label className="form-label">Promotion Image</label>
                <input
                  type="file"
                  className="form-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {formData.imageUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:8002${formData.imageUrl}`}
                      alt="Promotion Preview"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(null); setEditBonus(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{showModal === 'create' ? 'Create' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div >
      )}
    </div >
  );
};

export default Bonuses;
