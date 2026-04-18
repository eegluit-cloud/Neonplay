import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBanner, createBanner, updateBanner, uploadImage } from '../services/api';

const hint = { fontSize: '0.72rem', color: 'var(--gray)', marginTop: '3px', lineHeight: 1.4 };

const TARGET_PAGES = [
  { label: 'Home / Register', value: '/' },
  { label: 'Lobby', value: '/lobby' },
  { label: 'Casino', value: '/casino' },
  { label: 'Slots', value: '/slots' },
  { label: 'Live Casino', value: '/live-casino' },
  { label: 'Sports', value: '/sports' },
  { label: 'Promotions', value: '/promotions' },
  { label: 'VIP Club', value: '/vip' },
  { label: 'Leaderboard', value: '/leaderboard' },
  { label: 'Refer a Friend', value: '/refer-friend' },
  { label: 'Prizes', value: '/prizes' },
  { label: 'Hot Games', value: '/hot-games' },
  { label: 'New Releases', value: '/new-releases' },
  { label: 'Game Shows', value: '/game-shows' },
  { label: 'Custom URL', value: '__custom__' },
];

const DISPLAY_PAGES = [
  { label: 'All Pages', value: 'all' },
  { label: 'Lobby', value: 'lobby' },
  { label: 'Casino', value: 'casino' },
  { label: 'Slots', value: 'slots' },
  { label: 'Live Casino', value: 'live-casino' },
  { label: 'Sports', value: 'sports' },
  { label: 'Promotions', value: 'promotions' },
];

const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8002';

const BannerEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bannerId } = useParams();
  const isNew = bannerId === 'new';

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    imageUrl: '',
    videoUrl: '',
    backgroundGradient: '',
    platform: 'all',
    targetAudience: 'all',
    displayPage: 'lobby',
    sortOrder: '0',
    isActive: true,
    startsAt: '',
    endsAt: '',
  });
  const [ctaLinkMode, setCtaLinkMode] = useState('preset'); // 'preset' | 'custom'
  const [customCtaLink, setCustomCtaLink] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      try {
        const data = await getBanner(bannerId);
        const b = data.banner;
        const isPreset = TARGET_PAGES.some(p => p.value === b.ctaLink && p.value !== '__custom__');
        setForm({
          title: b.title || '',
          subtitle: b.subtitle || '',
          ctaText: b.ctaText || '',
          ctaLink: isPreset ? (b.ctaLink || '') : '',
          imageUrl: b.imageUrl || '',
          videoUrl: b.videoUrl || '',
          backgroundGradient: b.backgroundGradient || '',
          platform: b.platform || 'all',
          targetAudience: b.targetAudience || 'all',
          displayPage: b.displayPage || 'lobby',
          sortOrder: String(b.sortOrder ?? 0),
          isActive: b.isActive !== false,
          startsAt: b.startsAt ? b.startsAt.slice(0, 16) : '',
          endsAt: b.endsAt ? b.endsAt.slice(0, 16) : '',
        });
        if (!isPreset && b.ctaLink) {
          setCtaLinkMode('custom');
          setCustomCtaLink(b.ctaLink);
        }
      } catch {
        alert('Failed to load banner');
        navigate('/banners');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bannerId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const resolvedCtaLink = ctaLinkMode === 'custom' ? customCtaLink : form.ctaLink;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const r = await uploadImage(file);
      // Relative paths (local disk) need the full admin-backend base URL
      const imageUrl = r.imageUrl?.startsWith('/') ? `${API_BASE}${r.imageUrl}` : r.imageUrl;
      set('imageUrl', imageUrl);
    } catch { alert('Failed to upload image'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        ctaText: form.ctaText || null,
        ctaLink: resolvedCtaLink || null,
        imageUrl: form.imageUrl || null,
        videoUrl: form.videoUrl || null,
        backgroundGradient: form.backgroundGradient || null,
        platform: form.platform,
        targetAudience: form.targetAudience,
        displayPage: form.displayPage,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      };

      if (isNew) {
        const r = await createBanner(payload);
        navigate(`/banners/${r.bannerId}`);
      } else {
        await updateBanner(bannerId, payload);
      }
    } catch (err) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}><div className="spinner" /></div>;

  const previewUrl = form.imageUrl
    ? (form.imageUrl.startsWith('http') ? form.imageUrl : `${API_BASE}${form.imageUrl}`)
    : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/banners')}>{t('banners.backToBanners')}</button>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
          {isNew ? t('banners.newBannerTitle') : t('banners.editBannerTitle')}
        </h2>
        <div style={{ marginLeft: 'auto' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t('banners.active')}</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
          {/* Left column - Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Basic Info */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">{t('banners.bannerContent')}</h3></div>

              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">{t('banners.titleLabel')} *</label>
                  <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)}
                    required placeholder="e.g. Welcome Bonus — Up to $500" />
                  <div style={hint}>Main heading shown on the banner (bold, large text).</div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('banners.subtitleEyebrow')}</label>
                  <input className="form-input" value={form.subtitle} onChange={e => set('subtitle', e.target.value)}
                    placeholder="e.g. LIMITED TIME OFFER" />
                  <div style={hint}>Small text shown above the title (e.g. uppercase label).</div>
                </div>
              </div>

              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">{t('banners.ctaButtonText')}</label>
                  <input className="form-input" value={form.ctaText} onChange={e => set('ctaText', e.target.value)}
                    placeholder="e.g. Claim Now" />
                  <div style={hint}>Text for the call-to-action button. Leave blank to hide the button.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('banners.targetPage')}</label>
                  <select className="form-select" value={ctaLinkMode === 'custom' ? '__custom__' : (form.ctaLink || '')}
                    onChange={e => {
                      if (e.target.value === '__custom__') { setCtaLinkMode('custom'); }
                      else { setCtaLinkMode('preset'); set('ctaLink', e.target.value); }
                    }}>
                    <option value="">No redirect</option>
                    {TARGET_PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  {ctaLinkMode === 'custom' && (
                    <input className="form-input" style={{ marginTop: '6px' }} value={customCtaLink}
                      onChange={e => setCustomCtaLink(e.target.value)} placeholder="/page/my-page or https://..." />
                  )}
                  <div style={hint}>Where the user goes when they click the banner.</div>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">{t('banners.media')}</h3></div>

              <div className="form-group">
                <label className="form-label">{t('banners.uploadImage')}</label>
                <input type="file" className="form-input" accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload} disabled={uploading} />
                <div style={hint}>Recommended: 1200×500px or 16:5 ratio. Max 5MB. JPG/PNG/WebP.</div>
                {uploading && <div style={{ ...hint, color: 'var(--primary)' }}>Uploading…</div>}
                {form.imageUrl && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ ...hint, marginBottom: '4px' }}>Current URL: <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px' }}>{form.imageUrl}</code></div>
                    <button type="button" onClick={() => set('imageUrl', '')}
                      style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      ✕ Remove image
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('banners.orImageUrl')}</label>
                <input className="form-input" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                  placeholder="https://cdn.example.com/banner.jpg" />
                <div style={hint}>Paste an external image URL instead of uploading.</div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('banners.backgroundGradient')}</label>
                <input className="form-input" value={form.backgroundGradient}
                  onChange={e => set('backgroundGradient', e.target.value)}
                  placeholder="linear-gradient(135deg, #6366f1, #8b5cf6)" />
                <div style={hint}>Used as banner background when there's no image. Any valid CSS gradient.</div>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">{t('banners.settings')}</h3></div>

              <div className="grid grid-2 gap-2" style={{ marginBottom: '12px' }}>
                <div className="form-group">
                  <label className="form-label">{t('banners.displayPage')}</label>
                  <select className="form-select" value={form.displayPage} onChange={e => set('displayPage', e.target.value)}>
                    {DISPLAY_PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <div style={hint}>Which page in the player app shows this banner.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('banners.targetAudience')}</label>
                  <select className="form-select" value={form.targetAudience} onChange={e => set('targetAudience', e.target.value)}>
                    <option value="all">Everyone</option>
                    <option value="authenticated">Logged-in only</option>
                    <option value="guest">Guests only</option>
                  </select>
                  <div style={hint}>Who sees this banner.</div>
                </div>
              </div>

              <div className="grid grid-3 gap-2">
                <div className="form-group">
                  <label className="form-label">{t('banners.platform')}</label>
                  <select className="form-select" value={form.platform} onChange={e => set('platform', e.target.value)}>
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop only</option>
                    <option value="mobile">Mobile only</option>
                    <option value="tablet">Tablet only</option>
                  </select>
                  <div style={hint}>Which device sizes show this banner.</div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">{t('banners.sortOrderLabel')}</label>
                  <input type="number" className="form-input" value={form.sortOrder}
                    onChange={e => set('sortOrder', e.target.value)} min="0" />
                  <div style={hint}>Lower = shown first. Drag to reorder on list page.</div>
                </div>
              </div>

              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">{t('banners.activeFrom')}</label>
                  <input type="datetime-local" className="form-input" value={form.startsAt}
                    onChange={e => set('startsAt', e.target.value)} />
                  <div style={hint}>Leave blank to show immediately.</div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('banners.activeUntil')}</label>
                  <input type="datetime-local" className="form-input" value={form.endsAt}
                    onChange={e => set('endsAt', e.target.value)} />
                  <div style={hint}>Leave blank to show indefinitely.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Preview */}
          <div style={{ position: 'sticky', top: '16px' }}>
            <div className="card">
              <div className="card-header"><h3 className="card-title">{t('banners.preview')}</h3></div>

              <div style={{
                width: '100%', aspectRatio: '16/7', borderRadius: '10px', overflow: 'hidden',
                position: 'relative',
                background: form.backgroundGradient || 'linear-gradient(135deg, #1e1b4b, #312e81)',
              }}>
                {previewUrl && (
                  <img src={previewUrl} alt="preview"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {/* Left overlay */}
                {(form.title || form.subtitle) && (
                  <div style={{
                    position: 'absolute', inset: '0 50% 0 0',
                    background: 'linear-gradient(90deg,rgba(0,0,0,0.6),transparent)',
                  }} />
                )}
                {/* Text overlay */}
                <div style={{ position: 'absolute', inset: 0, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                  {form.subtitle && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24' }}>
                      {form.subtitle}
                    </span>
                  )}
                  {form.title && (
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                      {form.title}
                    </h3>
                  )}
                  {form.ctaText && (
                    <button style={{
                      marginTop: '6px', alignSelf: 'flex-start',
                      background: '#6366f1', color: '#fff', border: 'none',
                      padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'default',
                    }}>
                      {form.ctaText}
                    </button>
                  )}
                </div>
              </div>

              {/* Target URL display */}
              <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--gray)' }}>
                <strong>Clicks to:</strong>{' '}
                {resolvedCtaLink
                  ? <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>{resolvedCtaLink}</code>
                  : <em>No redirect</em>
                }
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--gray)' }}>
                <strong>Page:</strong> {DISPLAY_PAGES.find(p => p.value === form.displayPage)?.label || form.displayPage}
                &nbsp;·&nbsp; <strong>Platform:</strong> {form.platform}
                &nbsp;·&nbsp; <strong>Audience:</strong> {form.targetAudience}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
                {saving ? t('bonuses.saving') : isNew ? t('banners.createBannerAction') : t('banners.saveChanges')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/banners')} style={{ width: '100%' }}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BannerEdit;
