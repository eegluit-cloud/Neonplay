import React, { useState, useEffect } from 'react';
import {
  getVipTiers,
  createVipTier,
  updateVipTier,
  deleteVipTier
} from '../services/api';

const VIP = () => {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVipTiers();
      setTiers(response.tiers || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load VIP data:', err);
      setError('Failed to load VIP data');
      setLoading(false);
    }
  };

  const handleUpdateTier = async (tierId, data) => {
    try {
      await updateVipTier(tierId, data);
      await loadData();
      setEditingTier(null);
      setShowTierModal(false);
    } catch (err) {
      console.error('Failed to update tier:', err);
      alert('Failed to update tier: ' + err.message);
    }
  };

  const handleCreateTier = async (data) => {
    try {
      await createVipTier(data);
      await loadData();
      setShowTierModal(false);
    } catch (err) {
      console.error('Failed to create tier:', err);
      alert('Failed to create tier: ' + err.message);
    }
  };

  const handleDeleteTier = async (tierId, userCount) => {
    if (userCount > 0) {
      alert(`Cannot delete tier. ${userCount} user(s) are currently assigned to this tier.`);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this VIP tier?')) {
      return;
    }
    try {
      await deleteVipTier(tierId);
      await loadData();
    } catch (err) {
      console.error('Failed to delete tier:', err);
      alert('Failed to delete tier: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>VIP Tiers</h1>
        <button
          onClick={() => { setEditingTier(null); setShowTierModal(true); }}
          className="btn btn-primary"
        >
          Create New Tier
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1100px' }}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Level</th>
                <th style={{ width: '140px' }}>Name</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Min XP</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Benefits</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Cashback</th>
                <th style={{ width: '110px', textAlign: 'center' }}>Daily Bonus</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Weekly Bonus</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Monthly Bonus</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Users</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map(tier => (
                <tr key={tier.id}>
                  <td style={{ width: '80px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: tier.color || '#ccc',
                        display: 'inline-block',
                        flexShrink: 0
                      }}></span>
                      <strong>{tier.level}</strong>
                    </div>
                  </td>
                  <td style={{ width: '140px' }}>
                    <div>
                      <strong>{tier.name}</strong>
                      <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{tier.slug}</div>
                    </div>
                  </td>
                  <td style={{ width: '120px', textAlign: 'right' }}>
                    <strong>{parseInt(tier.minXp).toLocaleString()}</strong>
                  </td>
                  <td style={{ width: '100px', textAlign: 'center' }}>
                    <span className="badge badge-secondary">
                      {tier.benefits?.list ? tier.benefits.list.length : (Array.isArray(tier.benefits) ? tier.benefits.length : 0)}
                    </span>
                  </td>
                  <td style={{ width: '100px', textAlign: 'center' }}>
                    <span className="badge badge-success">{tier.cashbackPercent}%</span>
                  </td>
                  <td style={{ width: '110px', textAlign: 'center' }}>
                    <span className="badge badge-info">{tier.benefits?.dailyBonusPercent || 0}%</span>
                  </td>
                  <td style={{ width: '120px', textAlign: 'center' }}>
                    <span className="badge badge-info">{tier.benefits?.weeklyBonusPercent || 0}%</span>
                  </td>
                  <td style={{ width: '130px', textAlign: 'center' }}>
                    <span className="badge badge-info">{tier.benefits?.monthlyBonusPercent || 0}%</span>
                  </td>
                  <td style={{ width: '80px', textAlign: 'center' }}>
                    <span className="badge">{tier.userCount}</span>
                  </td>
                  <td style={{ width: '160px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => {
                          setEditingTier(tier);
                          setShowTierModal(true);
                        }}
                        className="btn btn-sm btn-secondary"
                        style={{ minWidth: '60px' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTier(tier.id, tier.userCount)}
                        className="btn btn-sm btn-danger"
                        disabled={tier.userCount > 0}
                        style={{ minWidth: '60px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tiers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No VIP tiers found. Create one to get started.
          </div>
        )}
      </div>

      {showTierModal && (
        <VipTierModal
          tier={editingTier}
          onClose={() => {
            setShowTierModal(false);
            setEditingTier(null);
          }}
          onSave={editingTier ? (data) => handleUpdateTier(editingTier.id, data) : handleCreateTier}
        />
      )}
    </div>
  );
};

const VipTierModal = ({ tier, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: tier?.name || '',
    slug: tier?.slug || '',
    level: tier?.level || 1,
    minXp: tier?.minXp || '0',
    iconUrl: tier?.iconUrl || '',
    color: tier?.color || '#CD7F32',
    cashbackPercent: tier?.cashbackPercent || 0,
    redemptionBonusPercent: tier?.redemptionBonusPercent || 0,
    dailyBonusPercent: tier?.benefits?.dailyBonusPercent || 0,
    weeklyBonusPercent: tier?.benefits?.weeklyBonusPercent || 0,
    monthlyBonusPercent: tier?.benefits?.monthlyBonusPercent || 0,
    benefits: tier?.benefits?.list || (Array.isArray(tier?.benefits) ? tier.benefits : []),
  });

  const [benefitInput, setBenefitInput] = useState('');
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(() => {
    // Convert relative URLs to absolute for preview
    if (tier?.iconUrl && tier.iconUrl.startsWith('/')) {
      return `http://localhost:8000${tier.iconUrl}`;
    }
    return tier?.iconUrl || '';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };
    if (iconFile) {
      dataToSend.iconFile = iconFile;
    }
    onSave(dataToSend);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIconFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefitInput.trim()]
      }));
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{tier ? 'Edit VIP Tier' : 'Create VIP Tier'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tier Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="e.g., Bronze, Silver, Gold"
            />
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input
                type="text"
                className="form-input"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required
                placeholder="bronze"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Level</label>
              <input
                type="number"
                className="form-input"
                value={formData.level}
                onChange={(e) => handleChange('level', parseInt(e.target.value))}
                required
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Min XP Required</label>
              <input
                type="number"
                className="form-input"
                value={formData.minXp}
                onChange={(e) => handleChange('minXp', e.target.value)}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tier Color</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  style={{ width: '56px', height: '56px', padding: '4px', cursor: 'pointer', border: '2px solid var(--border-color)', borderRadius: 'var(--border-radius)', background: 'rgba(6, 15, 29, 0.6)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="#CD7F32"
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Badge Icon</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  value={formData.iconUrl}
                  onChange={(e) => handleChange('iconUrl', e.target.value)}
                  placeholder="/icons/vip/starter.png"
                  style={{ marginBottom: '10px' }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconFileChange}
                  style={{ display: 'none' }}
                  id="iconFileInput"
                />
                <label htmlFor="iconFileInput" className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
                  Upload Icon
                </label>
              </div>
              {iconPreview && (
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={iconPreview}
                    alt="Icon preview"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="color: var(--text-dim); font-size: 10px; text-align: center;">Preview<br/>unavailable</div>';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Cashback %</label>
              <input
                type="number"
                className="form-input"
                value={formData.cashbackPercent}
                onChange={(e) => handleChange('cashbackPercent', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Redemption Bonus %</label>
              <input
                type="number"
                className="form-input"
                value={formData.redemptionBonusPercent}
                onChange={(e) => handleChange('redemptionBonusPercent', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-3 gap-2">
            <div className="form-group">
              <label className="form-label">Daily %</label>
              <input
                type="number"
                className="form-input"
                value={formData.dailyBonusPercent}
                onChange={(e) => handleChange('dailyBonusPercent', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weekly %</label>
              <input
                type="number"
                className="form-input"
                value={formData.weeklyBonusPercent}
                onChange={(e) => handleChange('weeklyBonusPercent', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Monthly %</label>
              <input
                type="number"
                className="form-input"
                value={formData.monthlyBonusPercent}
                onChange={(e) => handleChange('monthlyBonusPercent', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tier Benefits</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                type="text"
                className="form-input"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                placeholder="Add a benefit..."
                style={{ flex: 1 }}
              />
              <button type="button" onClick={handleAddBenefit} className="btn btn-sm btn-secondary">
                Add
              </button>
            </div>
            {formData.benefits.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="btn btn-sm btn-danger"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {tier ? 'Update Tier' : 'Create Tier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VIP;
