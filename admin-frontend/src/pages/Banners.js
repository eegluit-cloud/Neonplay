import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBanners, deleteBanner, reorderBanners } from '../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002/api';

const platformBadge = (p) => {
  const map = { all: '#6366f1', desktop: '#0ea5e9', mobile: '#10b981', tablet: '#f59e0b' };
  return (
    <span style={{
      background: map[p] || '#6b7280', color: '#fff',
      padding: '2px 8px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700
    }}>{p}</span>
  );
};

const Banners = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragging, setDragging] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data.banners || []);
    } catch { alert('Failed to load banners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (banner) => {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    setDeleting(banner.id);
    try {
      await deleteBanner(banner.id);
      setBanners(prev => prev.filter(b => b.id !== banner.id));
    } catch (err) { alert('Failed to delete: ' + err.message); }
    finally { setDeleting(null); }
  };

  const handleToggleActive = async (banner) => {
    try {
      await fetch(`${API_URL}/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
    } catch { alert('Failed to update status'); }
  };

  // Drag-and-drop reorder
  const handleDragStart = (e, index) => {
    setDragging(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragging === null || dragging === index) return;
    const next = [...banners];
    const [moved] = next.splice(dragging, 1);
    next.splice(index, 0, moved);
    setBanners(next);
    setDragging(index);
  };

  const handleDragEnd = async () => {
    setDragging(null);
    setSavingOrder(true);
    try {
      const order = banners.map((b, i) => ({ id: b.id, sortOrder: i }));
      await reorderBanners(order);
    } catch { alert('Failed to save order'); }
    finally { setSavingOrder(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Hero Banners</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--gray)' }}>
            Manage banners shown in the lobby hero carousel. Drag to reorder.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {savingOrder && <span style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Saving order…</span>}
          <button className="btn btn-primary" onClick={() => navigate('/banners/new')}>+ New Banner</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" /></div>
      ) : banners.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--gray)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🖼️</div>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>No banners yet</div>
          <div style={{ fontSize: '0.875rem', marginBottom: '20px' }}>Create your first banner to display in the lobby hero section.</div>
          <button className="btn btn-primary" onClick={() => navigate('/banners/new')}>+ Create Banner</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="card"
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '14px 18px', cursor: 'grab',
                opacity: dragging === index ? 0.5 : 1,
                border: dragging === index ? '2px dashed var(--primary)' : undefined,
              }}
            >
              {/* Drag handle */}
              <div style={{ color: '#9ca3af', fontSize: '1.2rem', cursor: 'grab', userSelect: 'none' }}>⠿</div>

              {/* Preview */}
              <div style={{
                width: '120px', height: '60px', flexShrink: 0,
                borderRadius: '8px', overflow: 'hidden', background: banner.backgroundGradient || '#1f2937',
                position: 'relative',
              }}>
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `http://13.228.114.152:8002${banner.imageUrl}`}
                    alt={banner.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.7rem', padding: '4px', textAlign: 'center',
                    background: banner.backgroundGradient || 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  }}>
                    {banner.videoUrl ? '🎬 Video' : banner.title}
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {banner.title}
                  {!banner.isActive && (
                    <span style={{ background: '#f3f4f6', color: '#9ca3af', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700 }}>INACTIVE</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {banner.subtitle && <span>{banner.subtitle}</span>}
                  {banner.ctaLink && (
                    <span>→ <code style={{ background: '#f3f4f6', padding: '0 4px', borderRadius: '3px', fontSize: '0.75rem' }}>{banner.ctaLink}</code></span>
                  )}
                  {platformBadge(banner.platform)}
                  <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '1px 7px', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700 }}>
                    📍 {banner.displayPage || 'lobby'}
                  </span>
                </div>
              </div>

              {/* Order badge */}
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', width: '28px', textAlign: 'center' }}>#{index + 1}</div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  className="btn btn-sm"
                  style={{
                    background: banner.isActive ? '#fee2e2' : '#dcfce7',
                    color: banner.isActive ? '#991b1b' : '#166534',
                    border: `1px solid ${banner.isActive ? '#fecaca' : '#bbf7d0'}`,
                    fontSize: '0.75rem',
                  }}
                  onClick={() => handleToggleActive(banner)}
                  title={banner.isActive ? 'Deactivate' : 'Activate'}
                >
                  {banner.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/banners/${banner.id}`)}>Edit</button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                  onClick={() => handleDelete(banner)}
                  disabled={deleting === banner.id}
                >
                  {deleting === banner.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--gray)' }}>
        Player frontend fetches banners via:{' '}
        <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>
          GET /api/v1/cms/hero-banners
        </code>
        {' '}(player-backend, port 4000)
      </div>
    </div>
  );
};

export default Banners;
