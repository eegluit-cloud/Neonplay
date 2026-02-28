import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getBonus, updateBonus, getGames,
  setGameContributions, assignBonusToPlayer
} from '../services/api';

const hint = { fontSize: '0.72rem', color: 'var(--gray)', marginTop: '3px', lineHeight: '1.4' };

const BonusDetail = () => {
  const { bonusId } = useParams();
  const navigate = useNavigate();

  const [bonus, setBonus] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  // Details form
  const [formData, setFormData] = useState({});
  const [savingDetails, setSavingDetails] = useState(false);

  // Game contributions
  const [allGames, setAllGames] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [gameSearch, setGameSearch] = useState('');
  const [savingGames, setSavingGames] = useState(false);

  // Assign
  const [assignPlayerId, setAssignPlayerId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // ─── Load ────────────────────────────────────────────────────────────────
  const loadBonus = useCallback(async () => {
    try {
      const r = await getBonus(bonusId);
      const b = r.bonus;
      setBonus(b);
      setFormData({
        name: b.name || '',
        code: b.code || '',
        type: b.type || 'deposit',
        amount: b.amount?.toString() || '',
        percentage: b.percentage?.toString() || '',
        bonusValueType: b.bonusValueType || 'fixed',
        wageringReq: b.wageringReq?.toString() || '30',
        minDeposit: b.minDeposit?.toString() || '',
        maxBonusCap: b.maxBonusCap?.toString() || '',
        isAutoCredit: b.isAutoCredit || false,
        isStackable: b.isStackable || false,
        expiryDays: b.expiryDays?.toString() || '',
        userSegment: b.userSegment || 'all',
        countryRestrictions: Array.isArray(b.countryRestrictions)
          ? b.countryRestrictions.join(', ')
          : (b.countryRestrictions || ''),
        description: b.description || '',
        terms: b.terms || '',
        imageUrl: b.imageUrl || '',
        status: b.status || 'active',
      });
      return b.gameContributions || [];
    } catch (err) {
      setError('Failed to load bonus');
      return [];
    }
  }, [bonusId]);

  const loadGames = useCallback(async (existingContributions = []) => {
    setGamesLoading(true);
    try {
      const r = await getGames({ limit: 500, page: 1 });
      const list = r.games || r.data || [];
      const existingMap = {};
      existingContributions.forEach(ec => { existingMap[ec.gameId] = ec; });
      setAllGames(list);
      setContributions(list.map(g => ({
        gameId: g.id,
        gameName: g.name,
        thumbnailUrl: g.thumbnailUrl,
        contributionPercent: existingMap[g.id]?.contributionPercent ?? 100,
        enabled: !!existingMap[g.id],
      })));
    } catch {
      setAllGames([]);
    } finally {
      setGamesLoading(false);
    }
  }, []);

  useEffect(() => {
    setPageLoading(true);
    loadBonus()
      .then(existing => loadGames(existing))
      .finally(() => setPageLoading(false));
  }, [loadBonus, loadGames]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      await updateBonus(bonusId, {
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
        status: formData.status,
      });
      const existing = await loadBonus();
      alert('Bonus details saved');
    } catch (err) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveGames = async () => {
    setSavingGames(true);
    try {
      const enabled = contributions
        .filter(c => c.enabled)
        .map(c => ({ gameId: c.gameId, contributionPercent: parseFloat(c.contributionPercent) || 100 }));
      await setGameContributions(bonusId, enabled);
      alert(`Saved ${enabled.length} game contribution(s)`);
    } catch (err) {
      alert('Failed to save games: ' + (err.message || 'Unknown error'));
    } finally {
      setSavingGames(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignPlayerId.trim()) return;
    setAssigning(true);
    try {
      await assignBonusToPlayer(bonusId, assignPlayerId.trim());
      setAssignPlayerId('');
      alert('Bonus assigned to player successfully');
    } catch (err) {
      alert('Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setAssigning(false);
    }
  };

  const toggleGame = (gameId) =>
    setContributions(prev => prev.map(c => c.gameId === gameId ? { ...c, enabled: !c.enabled } : c));

  const setPercent = (gameId, val) =>
    setContributions(prev => prev.map(c => c.gameId === gameId ? { ...c, contributionPercent: val } : c));

  const setAll = (enabled, percent = null) =>
    setContributions(prev => prev.map(c => ({
      ...c,
      enabled,
      ...(percent !== null ? { contributionPercent: percent } : {}),
    })));

  // ─── Derived ─────────────────────────────────────────────────────────────
  const filtered = contributions.filter(c =>
    c.gameName.toLowerCase().includes(gameSearch.toLowerCase())
  );
  const enabledCount = contributions.filter(c => c.enabled).length;

  // ─── Loading / Error ─────────────────────────────────────────────────────
  if (pageLoading) {
    return <div className="loading" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/bonuses')}>← Back to Bonuses</button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/bonuses')}>← Bonuses</button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{bonus?.name}</h2>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span className={`badge badge-${bonus?.type === 'joining' ? 'success' : bonus?.type === 'deposit' ? 'primary' : bonus?.type === 'birthday' ? 'warning' : 'secondary'}`}>
              {bonus?.type}
            </span>
            <span className={`badge badge-${bonus?.status === 'active' ? 'success' : 'danger'}`}>{bonus?.status}</span>
            {bonus?.isAutoCredit && <span className="badge badge-primary">Auto Credit</span>}
          </div>
        </div>
      </div>

      {/* ── Section 1: Bonus Details ─────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Bonus Details</h3>
        </div>
        <form onSubmit={handleSaveDetails} style={{ padding: '0 0 8px' }}>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input type="text" className="form-input" value={formData.name}
                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
              <div style={hint}>Internal name shown in the admin panel and optionally to players.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Code (optional)</label>
              <input type="text" className="form-input" value={formData.code}
                onChange={e => setFormData(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
              <div style={hint}>Players enter this promo code to claim the bonus. Leave blank if no code is required.</div>
            </div>
          </div>

          <div className="grid grid-3 gap-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={formData.type}
                onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}>
                <option value="deposit">Deposit — triggered on deposit</option>
                <option value="joining">Joining / Welcome — on registration</option>
                <option value="birthday">Birthday — on player's birthday</option>
                <option value="reload">Reload — for returning depositors</option>
                <option value="losing">Cashback / Losing — refund on net losses</option>
                <option value="custom">Custom — manually assigned</option>
              </select>
              <div style={hint}>Determines when and how the bonus is triggered. Affects eligibility logic.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Bonus Value Type</label>
              <select className="form-select" value={formData.bonusValueType}
                onChange={e => setFormData(f => ({ ...f, bonusValueType: e.target.value }))}>
                <option value="fixed">Fixed Amount — flat USDC amount</option>
                <option value="percentage">% of Deposit — match player's deposit</option>
              </select>
              <div style={hint}>Fixed gives a flat amount (e.g. $50). Percentage matches a portion of the deposit (e.g. 100% up to $200).</div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={formData.status}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active — players can claim this bonus</option>
                <option value="inactive">Inactive — bonus is paused / hidden</option>
              </select>
              <div style={hint}>Inactive bonuses cannot be claimed or auto-credited. Use this to pause a campaign.</div>
            </div>
          </div>

          <div className="grid grid-3 gap-2">
            <div className="form-group">
              <label className="form-label">Fixed Amount (USDC)</label>
              <input type="number" step="0.01" className="form-input" value={formData.amount}
                onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              <div style={hint}>Flat bonus credited to the player. Used when Value Type is "Fixed".</div>
            </div>
            <div className="form-group">
              <label className="form-label">Percentage Bonus (%)</label>
              <input type="number" step="1" min="0" max="1000" className="form-input" value={formData.percentage}
                onChange={e => setFormData(f => ({ ...f, percentage: e.target.value }))} placeholder="e.g. 100 for 100%" />
              <div style={hint}>100 = 100% match. Player deposits $100 → gets $100 bonus (subject to Max Cap). Used when Value Type is "Percentage".</div>
            </div>
            <div className="form-group">
              <label className="form-label">Max Bonus Cap (USDC)</label>
              <input type="number" step="0.01" className="form-input" value={formData.maxBonusCap}
                onChange={e => setFormData(f => ({ ...f, maxBonusCap: e.target.value }))} placeholder="No cap" />
              <div style={hint}>Limits the maximum bonus a player can receive. E.g. 100% match with $200 cap → deposit $500 but only get $200 bonus.</div>
            </div>
          </div>

          <div className="grid grid-3 gap-2">
            <div className="form-group">
              <label className="form-label">Wagering Requirement (x) *</label>
              <input type="number" step="1" min="0" className="form-input" value={formData.wageringReq}
                onChange={e => setFormData(f => ({ ...f, wageringReq: e.target.value }))} required />
              <div style={hint}>Player must wager this many times the bonus before withdrawing. 30x on $50 = must wager $1,500. Set 0 for no wagering.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Min Deposit (USDC)</label>
              <input type="number" step="0.01" className="form-input" value={formData.minDeposit}
                onChange={e => setFormData(f => ({ ...f, minDeposit: e.target.value }))} placeholder="No minimum" />
              <div style={hint}>Player's deposit must be at least this amount to qualify for the bonus. Leave blank for no minimum.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Days After Claim</label>
              <input type="number" step="1" min="1" className="form-input" value={formData.expiryDays}
                onChange={e => setFormData(f => ({ ...f, expiryDays: e.target.value }))} placeholder="Never expires" />
              <div style={hint}>Bonus expires this many days after being claimed. Player must complete wagering within this window. Leave blank = never expires.</div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">User Segment</label>
              <select className="form-select" value={formData.userSegment}
                onChange={e => setFormData(f => ({ ...f, userSegment: e.target.value }))}>
                <option value="all">All Users</option>
                <option value="new">New Users Only</option>
                <option value="vip">VIP Users Only</option>
              </select>
              <div style={hint}>Restricts who can receive this bonus. "New" = players who haven't deposited before. "VIP" = players with an active VIP tier.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Country Restrictions</label>
              <input type="text" className="form-input" value={formData.countryRestrictions}
                onChange={e => setFormData(f => ({ ...f, countryRestrictions: e.target.value }))}
                placeholder="e.g. US, GB, CA" />
              <div style={hint}>Comma-separated ISO country codes. Only players from these countries can claim the bonus. Leave blank to allow all countries.</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', margin: '4px 0 16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={formData.isAutoCredit}
                onChange={e => setFormData(f => ({ ...f, isAutoCredit: e.target.checked }))} />
              <div>
                <strong>Auto Credit</strong>
                <div style={hint}>Automatically credit the bonus when the trigger condition is met (e.g. on deposit). If off, the player must manually claim it.</div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={formData.isStackable}
                onChange={e => setFormData(f => ({ ...f, isStackable: e.target.checked }))} />
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
                onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
              <div style={hint}>Shown to players in the app on the promotions page. Keep it brief and attractive.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Terms & Conditions</label>
              <textarea className="form-input" rows="3" value={formData.terms}
                onChange={e => setFormData(f => ({ ...f, terms: e.target.value }))} />
              <div style={hint}>Full legal terms for this bonus. Displayed in the bonus detail view in the player app.</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingDetails}>
              {savingDetails ? 'Saving…' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Section 2: Game Wagering Contributions ───────────────────── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Game Wagering Contributions</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--gray)' }}>
              Only enabled games count toward wagering. Unlisted games = 0%.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              background: enabledCount > 0 ? '#dcfce7' : '#f3f4f6',
              color: enabledCount > 0 ? '#16a34a' : 'var(--gray)',
              borderRadius: '12px', padding: '4px 12px', fontSize: '0.875rem', fontWeight: '600'
            }}>
              {enabledCount} / {contributions.length} games enabled
            </span>
          </div>
        </div>

        <div style={{ padding: '0 0 16px' }}>
          {/* Controls bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search games…"
              value={gameSearch}
              onChange={e => setGameSearch(e.target.value)}
              style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}
            />
            <button className="btn btn-sm btn-secondary" onClick={() => setAll(true, 100)}>All 100%</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setAll(true, 50)}>All 50%</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setAll(false)}>Disable All</button>
          </div>

          {/* Games grid */}
          {gamesLoading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>No games found</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '10px',
            }}>
              {filtered.map(c => (
                <div
                  key={c.gameId}
                  onClick={() => toggleGame(c.gameId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    border: `2px solid ${c.enabled ? '#22c55e' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    background: c.enabled ? '#f0fdf4' : '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Thumbnail */}
                  {c.thumbnailUrl ? (
                    <img src={c.thumbnailUrl} alt={c.gameName}
                      style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '8px',
                      background: '#e5e7eb', flexShrink: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                    }}>🎮</div>
                  )}

                  {/* Name + toggle */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: '600', fontSize: '0.875rem',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{c.gameName}</div>
                    <div style={{ fontSize: '0.75rem', color: c.enabled ? '#16a34a' : 'var(--gray)', marginTop: '2px' }}>
                      {c.enabled ? 'Enabled' : 'Disabled — click to enable'}
                    </div>
                  </div>

                  {/* Percentage input */}
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                  >
                    <input
                      type="number" min="0" max="100" step="1"
                      value={c.contributionPercent}
                      onChange={e => setPercent(c.gameId, e.target.value)}
                      disabled={!c.enabled}
                      style={{
                        width: '58px', padding: '4px 6px',
                        border: '1px solid #d1d5db', borderRadius: '6px',
                        fontSize: '0.875rem', textAlign: 'center',
                        opacity: c.enabled ? 1 : 0.35,
                        background: c.enabled ? '#fff' : '#f3f4f6',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={handleSaveGames} disabled={savingGames}>
              {savingGames ? 'Saving…' : `Save ${enabledCount} Game Contribution${enabledCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 3: Assign to Player ──────────────────────────────── */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Assign to Player</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--gray)' }}>
              Manually assign this bonus to a player by their user ID.
            </p>
          </div>
        </div>
        <form onSubmit={handleAssign} style={{ paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="form-label">Player ID</label>
              <input
                type="text"
                className="form-input"
                value={assignPlayerId}
                onChange={e => setAssignPlayerId(e.target.value)}
                placeholder="Paste player UUID from the Players page"
                required
                style={{ marginBottom: 0 }}
              />
              <div style={hint}>The player's UUID — find it on the Players page by clicking a player. The bonus will be added to their available bonuses.</div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={assigning} style={{ flexShrink: 0 }}>
              {assigning ? 'Assigning…' : 'Assign Bonus'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default BonusDetail;
