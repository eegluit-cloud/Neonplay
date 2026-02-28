import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBonus, uploadImage } from '../services/api';

const hint = { fontSize: '0.72rem', color: 'var(--gray)', marginTop: '3px', lineHeight: '1.4' };

const BonusCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', code: '', type: 'deposit',
    amount: '', percentage: '',
    bonusValueType: 'fixed',
    wageringReq: '30',
    minDeposit: '', maxBonusCap: '',
    isAutoCredit: false, isStackable: false,
    expiryDays: '30',
    userSegment: 'all',
    countryRestrictions: '',
    description: '', terms: '', imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await createBonus({
        name: formData.name,
        code: formData.code,
        type: formData.type,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        percentage: formData.percentage ? parseInt(formData.percentage) : 0,
        bonusValueType: formData.bonusValueType,
        wageringReq: parseInt(formData.wageringReq) || 1,
        minDeposit: formData.minDeposit ? parseFloat(formData.minDeposit) : 0,
        maxBonusCap: formData.maxBonusCap ? parseFloat(formData.maxBonusCap) : null,
        isAutoCredit: formData.isAutoCredit,
        isStackable: formData.isStackable,
        expiryDays: formData.expiryDays ? parseInt(formData.expiryDays) : null,
        userSegment: formData.userSegment !== 'all' ? formData.userSegment : null,
        countryRestrictions: formData.countryRestrictions
          ? formData.countryRestrictions.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
          : [],
        description: formData.description,
        terms: formData.terms,
        imageUrl: formData.imageUrl,
      });
      if (r.bonusId) {
        navigate(`/bonuses/${r.bonusId}`);
      } else {
        navigate('/bonuses');
      }
    } catch (err) {
      alert('Failed to create bonus: ' + (err.message || 'Unknown error'));
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const r = await uploadImage(file);
      set('imageUrl', r.imageUrl);
    } catch { alert('Failed to upload image'); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/bonuses')}>← Bonuses</button>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>Create Bonus</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Bonus Details</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray)' }}>
            After creating, you'll be taken to the bonus page to configure game contributions.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-input" value={formData.name}
                onChange={e => set('name', e.target.value)} required placeholder="e.g. Welcome Deposit Bonus" />
              <div style={hint}>Internal name shown in the admin panel and optionally to players.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Code (optional)</label>
              <input type="text" className="form-input" value={formData.code}
                onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. WELCOME50" />
              <div style={hint}>Players enter this promo code to claim the bonus. Leave blank if no code is required.</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select className="form-select" value={formData.type} onChange={e => set('type', e.target.value)}>
                <option value="deposit">Deposit Bonus — triggered on deposit</option>
                <option value="joining">Joining / Welcome — given on registration</option>
                <option value="birthday">Birthday Bonus — given on player's birthday</option>
                <option value="reload">Reload Bonus — for returning depositors</option>
                <option value="losing">Cashback / Losing — refund on net losses</option>
                <option value="custom">Custom — manually assigned</option>
              </select>
              <div style={hint}>Determines when and how the bonus is triggered. Affects eligibility logic.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Bonus Value Type</label>
              <select className="form-select" value={formData.bonusValueType} onChange={e => set('bonusValueType', e.target.value)}>
                <option value="fixed">Fixed Amount — player always gets a set USDC amount</option>
                <option value="percentage">Percentage — player gets % of their deposit</option>
              </select>
              <div style={hint}>Fixed gives a flat amount (e.g. $50). Percentage matches a portion of the deposit (e.g. 100% up to $200).</div>
            </div>
          </div>

          <div className="grid grid-3 gap-2">
            <div className="form-group">
              <label className="form-label">Fixed Amount (USDC)</label>
              <input type="number" step="0.01" min="0" className="form-input" value={formData.amount}
                onChange={e => set('amount', e.target.value)} placeholder="e.g. 50" />
              <div style={hint}>Flat bonus credited to the player. Used when Value Type is "Fixed".</div>
            </div>
            <div className="form-group">
              <label className="form-label">Percentage Bonus (%)</label>
              <input type="number" step="1" min="0" max="1000" className="form-input" value={formData.percentage}
                onChange={e => set('percentage', e.target.value)} placeholder="e.g. 100" />
              <div style={hint}>100 = 100% match. Player deposits $100 → gets $100 bonus (subject to Max Cap). Used when Value Type is "Percentage".</div>
            </div>
            <div className="form-group">
              <label className="form-label">Max Bonus Cap (USDC)</label>
              <input type="number" step="0.01" min="0" className="form-input" value={formData.maxBonusCap}
                onChange={e => set('maxBonusCap', e.target.value)} placeholder="No cap" />
              <div style={hint}>Limits the maximum bonus a player can receive. E.g. 100% match with $200 cap → deposit $500 but only get $200 bonus.</div>
            </div>
          </div>

          <div className="grid grid-3 gap-2">
            <div className="form-group">
              <label className="form-label">Wagering Requirement (x) *</label>
              <input type="number" step="1" min="0" className="form-input" value={formData.wageringReq}
                onChange={e => set('wageringReq', e.target.value)} required />
              <div style={hint}>Player must wager this many times the bonus before withdrawing. 30x on $50 bonus = must wager $1,500 total. Set 0 for no wagering.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Min Deposit (USDC)</label>
              <input type="number" step="0.01" min="0" className="form-input" value={formData.minDeposit}
                onChange={e => set('minDeposit', e.target.value)} placeholder="No minimum" />
              <div style={hint}>Player's deposit must be at least this amount to qualify for the bonus. Leave blank for no minimum.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Days After Claim</label>
              <input type="number" step="1" min="1" className="form-input" value={formData.expiryDays}
                onChange={e => set('expiryDays', e.target.value)} placeholder="Never expires" />
              <div style={hint}>Bonus expires this many days after being claimed. E.g. 30 means player has 30 days to complete wagering. Leave blank = never expires.</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">User Segment</label>
              <select className="form-select" value={formData.userSegment} onChange={e => set('userSegment', e.target.value)}>
                <option value="all">All Users</option>
                <option value="new">New Users Only</option>
                <option value="vip">VIP Users Only</option>
              </select>
              <div style={hint}>Restricts who can receive this bonus. "New" = players who haven't deposited before. "VIP" = players with an active VIP tier.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Country Restrictions</label>
              <input type="text" className="form-input" value={formData.countryRestrictions}
                onChange={e => set('countryRestrictions', e.target.value)} placeholder="e.g. US, GB, CA" />
              <div style={hint}>Comma-separated ISO country codes. Only players from these countries can claim the bonus. Leave blank to allow all countries.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', margin: '4px 0 20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={formData.isAutoCredit} onChange={e => set('isAutoCredit', e.target.checked)} />
              <div>
                <strong>Auto Credit</strong>
                <div style={hint}>Automatically credit the bonus when the trigger condition is met (e.g. on deposit). If off, the player must manually claim it.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={formData.isStackable} onChange={e => set('isStackable', e.target.checked)} />
              <div>
                <strong>Stackable</strong>
                <div style={hint}>Allow this bonus to be active alongside other bonuses. If off, the player can only have one active bonus at a time.</div>
              </div>
            </label>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="3" value={formData.description}
                onChange={e => set('description', e.target.value)} placeholder="Short summary shown to players on the promotions page." />
              <div style={hint}>Shown to players in the app. Keep it brief and attractive.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Terms & Conditions</label>
              <textarea className="form-input" rows="3" value={formData.terms}
                onChange={e => set('terms', e.target.value)} placeholder="Full T&C text for this bonus..." />
              <div style={hint}>Full legal terms for this bonus. Displayed in the bonus detail view in the player app.</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Promotion Image</label>
            <input type="file" className="form-input" accept="image/*" onChange={handleImageUpload} />
            <div style={hint}>Banner image shown on the promotions page. Recommended size: 600×300px.</div>
            {formData.imageUrl && (
              <img
                src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `http://localhost:8002${formData.imageUrl}`}
                alt="Preview"
                style={{ marginTop: '10px', maxWidth: '320px', maxHeight: '160px', borderRadius: '8px', objectFit: 'contain' }}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/bonuses')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '200px' }}>
              {submitting ? 'Creating…' : 'Create Bonus & Configure Games →'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BonusCreate;
