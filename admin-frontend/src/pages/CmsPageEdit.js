import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCmsPage, createCmsPage, updateCmsPage } from '../services/api';

const hint = { fontSize: '0.72rem', color: 'var(--gray)', marginTop: '3px', lineHeight: '1.4' };

// Toolbar actions for common HTML snippets
const TOOLBAR = [
  { label: 'H1', tag: 'h1', wrap: true },
  { label: 'H2', tag: 'h2', wrap: true },
  { label: 'H3', tag: 'h3', wrap: true },
  { label: 'B', tag: 'strong', wrap: true },
  { label: 'I', tag: 'em', wrap: true },
  { label: 'P', tag: 'p', wrap: true },
  { label: 'UL', snippet: '<ul>\n  <li></li>\n  <li></li>\n</ul>' },
  { label: 'OL', snippet: '<ol>\n  <li></li>\n  <li></li>\n</ol>' },
  { label: 'A', snippet: '<a href="URL">Link text</a>' },
  { label: 'HR', snippet: '<hr />' },
];

const PREVIEW_CSS = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #1f2937; line-height: 1.7; max-width: 820px; margin: 0 auto; }
  h1 { font-size: 2rem; font-weight: 700; margin: 0 0 16px; }
  h2 { font-size: 1.5rem; font-weight: 700; margin: 24px 0 12px; }
  h3 { font-size: 1.2rem; font-weight: 600; margin: 20px 0 10px; }
  p { margin: 0 0 14px; }
  a { color: #6366f1; }
  ul, ol { margin: 0 0 14px; padding-left: 24px; }
  li { margin: 4px 0; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  table { border-collapse: collapse; width: 100%; margin: 0 0 14px; }
  th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
  th { background: #f9fafb; font-weight: 600; }
  blockquote { border-left: 4px solid #e5e7eb; margin: 0 0 14px 0; padding: 8px 16px; color: #6b7280; }
`;

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const CmsPageEdit = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pageId } = useParams();
  const isNew = pageId === 'new';
  const textareaRef = useRef(null);
  const iframeRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    content: '',
    status: 'draft',
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [activeTab, setActiveTab] = useState('split'); // 'split' | 'editor' | 'preview'

  // Load page on edit
  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      try {
        const data = await getCmsPage(pageId);
        const p = data.page;
        setFormData({
          title: p.title || '',
          slug: p.slug || '',
          metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
          content: p.content || '',
          status: p.status || 'draft',
        });
        setSlugManuallyEdited(true); // Don't auto-generate slug for existing pages
      } catch {
        alert('Failed to load page');
        navigate('/cms');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageId]);

  // Auto-generate slug from title (new pages only)
  const set = (key, val) => {
    setFormData(f => {
      const next = { ...f, [key]: val };
      if (key === 'title' && !slugManuallyEdited) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    setFormData(f => ({ ...f, slug: e.target.value }));
  };

  // Insert snippet at cursor in textarea
  const insertSnippet = useCallback((item) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = formData.content.substring(start, end);
    let insert;
    if (item.wrap) {
      insert = `<${item.tag}>${selected || 'Content here'}</${item.tag}>`;
    } else {
      insert = item.snippet;
    }
    const newContent = formData.content.substring(0, start) + insert + formData.content.substring(end);
    setFormData(f => ({ ...f, content: newContent }));
    // Restore cursor
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + insert.length;
      ta.selectionEnd = start + insert.length;
    }, 0);
  }, [formData.content]);

  // Update iframe preview
  const updatePreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><style>${PREVIEW_CSS}</style></head><body>${formData.content}</body></html>`);
    doc.close();
  }, [formData.content]);

  useEffect(() => {
    updatePreview();
  }, [formData.content, activeTab]);

  const handleSubmit = async (e, submitStatus) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        status: submitStatus || formData.status,
      };

      if (isNew) {
        const r = await createCmsPage(payload);
        navigate(`/cms/${r.pageId}`);
      } else {
        await updateCmsPage(pageId, payload);
        setFormData(f => ({ ...f, status: submitStatus || f.status }));
      }
    } catch (err) {
      alert('Failed to save page: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const showEditor = activeTab === 'split' || activeTab === 'editor';
  const showPreview = activeTab === 'split' || activeTab === 'preview';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/cms')}>{t('cms.backToCmsPages')}</button>
        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
          {isNew ? t('cms.newCmsPage') : `${t('cms.editPrefix')} ${formData.title || '…'}`}
        </h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Status badge */}
          <span style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: formData.status === 'published' ? '#dcfce7' : '#fef9c3',
            color: formData.status === 'published' ? '#166534' : '#854d0e',
          }}>
            {formData.status === 'published' ? t('cms.published') : t('cms.draft')}
          </span>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, null)}>
        {/* Meta fields */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">{t('cms.pageDetails')}</h3>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">{t('cms.titleLabel')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={e => set('title', e.target.value)}
                required
                placeholder="e.g. Terms & Conditions"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('cms.slugLabel')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.slug}
                onChange={handleSlugChange}
                required
                placeholder="e.g. terms-and-conditions"
              />
              <div style={hint}>
                Used in the URL: <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px' }}>/page/{formData.slug || 'your-slug'}</code>
              </div>
            </div>
          </div>

          <div className="grid grid-2 gap-2">
            <div className="form-group">
              <label className="form-label">{t('cms.metaTitle')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.metaTitle}
                onChange={e => set('metaTitle', e.target.value)}
                placeholder="Browser tab title (defaults to page title)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('cms.metaDescription')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.metaDescription}
                onChange={e => set('metaDescription', e.target.value)}
                placeholder="SEO description (150–160 chars)"
              />
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{t('cms.htmlContent')}</h3>

            {/* View toggle */}
            <div style={{
              display: 'flex',
              background: '#f3f4f6',
              borderRadius: '8px',
              padding: '2px',
              gap: '2px',
            }}>
              {[
                { id: 'editor', label: 'Editor only' },
                { id: 'split', label: 'Split view' },
                { id: 'preview', label: 'Preview only' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: activeTab === tab.id ? '#fff' : 'transparent',
                    color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                    boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar - only show when editor is visible */}
          {showEditor && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              padding: '10px 16px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fafafa',
            }}>
              {TOOLBAR.map(item => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => insertSnippet(item)}
                  title={item.snippet || `<${item.tag}>…</${item.tag}>`}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '5px',
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#374151',
                    fontSize: '0.78rem',
                    fontWeight: item.label === 'B' ? '700' : item.label === 'I' ? 'normal' : '500',
                    fontStyle: item.label === 'I' ? 'italic' : 'normal',
                    cursor: 'pointer',
                    minWidth: '34px',
                  }}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFormData(f => ({ ...f, content: '' }))}
                title="Clear all content"
                style={{
                  marginLeft: 'auto',
                  padding: '3px 10px',
                  borderRadius: '5px',
                  border: '1px solid #fecaca',
                  background: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Editor + Preview panes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: activeTab === 'split' ? '1fr 1fr' : '1fr',
            minHeight: '560px',
          }}>
            {showEditor && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                borderRight: activeTab === 'split' ? '1px solid #e5e7eb' : 'none',
              }}>
                <div style={{
                  padding: '6px 16px',
                  background: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  HTML Editor
                </div>
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={e => set('content', e.target.value)}
                  placeholder="<h1>Page Title</h1>\n<p>Content goes here…</p>"
                  spellCheck={false}
                  style={{
                    flex: 1,
                    padding: '16px',
                    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
                    fontSize: '0.83rem',
                    lineHeight: '1.6',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    background: '#1e1e2e',
                    color: '#cdd6f4',
                    minHeight: '520px',
                  }}
                />
              </div>
            )}

            {showPreview && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  padding: '6px 16px',
                  background: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span>Live Preview</span>
                  <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: '0' }}>
                    Sandboxed — scripts disabled
                  </span>
                </div>
                <iframe
                  ref={iframeRef}
                  sandbox="allow-same-origin"
                  title="CMS Preview"
                  style={{
                    flex: 1,
                    border: 'none',
                    background: '#fff',
                    minHeight: '520px',
                    width: '100%',
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ padding: '8px 16px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--gray)' }}>
              {formData.content.length} characters &nbsp;·&nbsp; HTML content is stored as-is and rendered on the player frontend.
            </span>
          </div>
        </div>

        {/* Action bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          padding: '16px 0',
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/cms')}
          >
            {t('cms.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={saving}
            onClick={(e) => handleSubmit(e, 'draft')}
          >
            {saving && formData.status === 'draft' ? t('bonuses.saving') : t('cms.saveAsDraft')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={(e) => handleSubmit(e, 'published')}
            style={{ minWidth: '160px' }}
          >
            {saving ? t('cms.publishing') : formData.status === 'published' ? t('cms.updatePublish') : t('cms.publishPage')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CmsPageEdit;
