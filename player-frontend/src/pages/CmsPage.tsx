import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { NeonPlayLogo } from '@/components/NeonPlayLogo';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

const CmsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);

    fetch(`${API_BASE}/cms/pages/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => {
        setHtml(data.content || '');
        setTitle(data.title || slug);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse text-sm">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">Page not found.</p>
        <Link to="/" className="text-primary hover:underline text-sm">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <NeonPlayLogo size="sm" />
        </Link>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </header>
      <iframe
        srcDoc={html}
        title={title}
        className="flex-1 w-full border-none"
        style={{ minHeight: 'calc(100vh - 52px)' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
};

export default CmsPage;
