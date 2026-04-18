import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCmsPages, deleteCmsPage } from '../services/api';

const statusBadge = (status) => {
  const styles = {
    published: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
    draft: { background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' },
  };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '9999px',
      fontSize: '0.72rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      ...styles[status],
    }}>
      {status}
    </span>
  );
};

const CmsPages = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await getCmsPages(params);
      setPages(data.pages || []);
    } catch {
      alert('Failed to load CMS pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (page) => {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setDeleting(page.id);
    try {
      await deleteCmsPage(page.id);
      setPages(prev => prev.filter(p => p.id !== page.id));
    } catch (err) {
      alert('Failed to delete page: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>{t('cms.cmsPages')}</h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--gray)' }}>
            Manage static content pages served to the player frontend.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/cms/new')}>
          {t('cms.newPage')}
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'all', label: t('cms.all') },
          { key: 'published', label: t('cms.published') },
          { key: 'draft', label: t('cms.draft') },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid',
              fontSize: '0.825rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: filter === key ? 'var(--primary)' : 'transparent',
              color: filter === key ? '#fff' : 'var(--text)',
              borderColor: filter === key ? 'var(--primary)' : '#e5e7eb',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--gray)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.4 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{t('cms.noPagesYet')}</div>
            <div style={{ fontSize: '0.875rem' }}>Create your first CMS page to get started.</div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/cms/new')}>
              {t('cms.newPage')}
            </button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('cms.titleHeader')}</th>
                <th>{t('cms.slugHeader')}</th>
                <th>{t('common.status')}</th>
                <th>{t('cms.lastUpdated')}</th>
                <th style={{ textAlign: 'right' }}>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id}>
                  <td style={{ fontWeight: '600' }}>{page.title}</td>
                  <td>
                    <code style={{
                      background: '#f3f4f6',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      color: '#6b7280',
                    }}>
                      {page.slug}
                    </code>
                  </td>
                  <td>{statusBadge(page.status)}</td>
                  <td style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                    {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    }) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/cms/${page.id}`)}
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                        onClick={() => handleDelete(page)}
                        disabled={deleting === page.id}
                      >
                        {deleting === page.id ? '…' : t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer info */}
      <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--gray)' }}>
        Player frontend fetches pages via:{' '}
        <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>
          GET /api/cms/public/:slug
        </code>
        {' '}(admin-backend) or{' '}
        <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>
          GET /cms/pages/:slug
        </code>
        {' '}(player-backend)
      </div>
    </div>
  );
};

export default CmsPages;
