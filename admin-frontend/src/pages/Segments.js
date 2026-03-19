import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSegments, deleteSegment } from '../services/api';

const FIELD_LABELS = {
  deposit_amount: 'Deposit Amount',
  deposit_count: 'Deposit Count',
  withdraw_amount: 'Withdraw Amount',
  withdraw_count: 'Withdraw Count',
  wagering_amount: 'Wagering Amount',
  wagering_count: 'Wagering Count',
  win_amount: 'Win Amount',
  players_status: 'Players Status',
  signup: 'Signup',
  age: 'Age',
  gender: 'Gender',
  gross_gaming_revenue: 'Gross Gaming Revenue',
  last_login: 'Last Login',
};

const Segments = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getSegments({ limit: 100 });
      setSegments(r.segments || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (seg) => {
    if (seg.bonusCount > 0) {
      alert(`Cannot delete "${seg.name}" — it is linked to ${seg.bonusCount} bonus(es).`);
      return;
    }
    if (!window.confirm(`Delete segment "${seg.name}"?`)) return;
    try {
      await deleteSegment(seg.id);
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>Segmentation</h2>
        <button className="btn btn-primary" onClick={() => navigate('/segments/new')}>
          + Create Segment
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        ) : segments.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray)' }}>
            No segments yet. Create one to target specific player groups with bonuses.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Comment</th>
                <th>Conditions</th>
                <th>Bonuses</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {segments.map(seg => (
                <tr key={seg.id}>
                  <td style={{ fontWeight: 600 }}>{seg.name}</td>
                  <td style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{seg.comment || '—'}</td>
                  <td>
                    {Array.isArray(seg.conditions) && seg.conditions.map((c, i) => (
                      <span key={i} style={{
                        display: 'inline-block',
                        background: '#e8f0fe', color: '#1a56db',
                        borderRadius: '4px', padding: '2px 7px',
                        fontSize: '0.75rem', marginRight: '4px', marginBottom: '2px'
                      }}>
                        {FIELD_LABELS[c.field] || c.field} {c.operator} {c.value}{c.value2 ? ` — ${c.value2}` : ''}
                      </span>
                    ))}
                  </td>
                  <td>{seg.bonusCount}</td>
                  <td>
                    <span className={`badge badge-${seg.isActive ? 'success' : 'secondary'}`}>
                      {seg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.83rem', color: 'var(--gray)' }}>
                    {new Date(seg.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/segments/${seg.id}`)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(seg)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Segments;
