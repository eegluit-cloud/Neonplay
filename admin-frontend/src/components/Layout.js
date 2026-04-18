import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const getSectionForPath = (path) => {
  if (path === '/dashboard') return 'overview';
  if (['/players', '/kyc', '/games', '/bonuses', '/segments', '/vip', '/casino-management', '/cms', '/banners'].some(p => path.startsWith(p))) return 'management';
  if (path === '/reports') return 'analytics';
  if (path === '/admins') return 'settings';
  return null;
};

const Layout = () => {
  const { admin, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('admin_language') || 'en');

  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_sections');
      return saved ? JSON.parse(saved) : { overview: true, management: true, analytics: true, settings: true };
    } catch { return { overview: true, management: true, analytics: true, settings: true }; }
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_sections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    const activeSection = getSectionForPath(location.pathname);
    if (activeSection && !expandedSections[activeSection]) {
      setExpandedSections(prev => ({ ...prev, [activeSection]: true }));
    }
  }, [location.pathname]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileSidebarOpen) setMobileSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileSidebarOpen]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLangChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('admin_language', lang);
    setCurrentLang(lang);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return t('pageTitles.dashboard');
    if (path === '/players' || path.startsWith('/players/')) return t('pageTitles.players');
    if (path === '/kyc') return t('pageTitles.kyc');
    if (path === '/games') return t('pageTitles.games');
    if (path === '/bonuses' || path.startsWith('/bonuses/')) return t('pageTitles.bonuses');
    if (path === '/segments' || path.startsWith('/segments/')) return t('pageTitles.segments');
    if (path === '/cms' || path.startsWith('/cms/')) return t('pageTitles.cms');
    if (path === '/banners' || path.startsWith('/banners/')) return t('pageTitles.banners');
    if (path === '/vip') return t('pageTitles.vip');
    if (path === '/reports') return t('pageTitles.reports');
    if (path === '/admins') return t('pageTitles.admins');
    if (path === '/casino-management') return t('pageTitles.casinoManagement');
    return t('pageTitles.adminPanel');
  };

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="admin-layout">
      {mobileSidebarOpen && <div className="sidebar-overlay" onClick={closeMobileSidebar} />}

      <aside className={`sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{fontSize: '18px', fontWeight: 'bold', color: '#f59e0b', display: 'block', paddingTop: '4px'}}>Neon Play</span>
          </div>
          <div className="sidebar-subtitle">{t('layout.adminBackoffice')}</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <button
              className={`sidebar-section-title collapsible ${expandedSections.overview ? 'expanded' : ''}`}
              onClick={() => toggleSection('overview')}
            >
              <span>{t('layout.overview')}</span>
              <svg className="collapse-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div className={`sidebar-section-content ${expandedSections.overview ? 'expanded' : ''}`}>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </span>
                {t('layout.dashboard')}
              </NavLink>
            </div>
          </div>

          <div className="sidebar-section">
            <button
              className={`sidebar-section-title collapsible ${expandedSections.management ? 'expanded' : ''}`}
              onClick={() => toggleSection('management')}
            >
              <span>{t('layout.management')}</span>
              <svg className="collapse-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div className={`sidebar-section-content ${expandedSections.management ? 'expanded' : ''}`}>
              <NavLink to="/players" className={({ isActive }) => `sidebar-link ${isActive || location.pathname.startsWith('/players/') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                {t('layout.players')}
              </NavLink>
              <NavLink to="/kyc" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </span>
                {t('layout.kycVerification')}
              </NavLink>
              <NavLink to="/games" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="10 8 16 12 10 16 10 8"/>
                  </svg>
                </span>
                {t('layout.games')}
              </NavLink>
              <NavLink to="/bonuses" className={({ isActive }) => `sidebar-link ${isActive || location.pathname.startsWith('/bonuses/') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 12 20 22 4 22 4 12"/>
                    <rect x="2" y="7" width="20" height="5"/>
                    <line x1="12" y1="22" x2="12" y2="7"/>
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </span>
                {t('layout.bonuses')}
              </NavLink>
              <NavLink to="/segments" className={({ isActive }) => `sidebar-link ${isActive || location.pathname.startsWith('/segments/') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                {t('layout.segmentation')}
              </NavLink>
              <NavLink to="/vip" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/>
                  </svg>
                </span>
                {t('layout.vip')}
              </NavLink>
              <NavLink to="/casino-management" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </span>
                {t('layout.casinoManagement')}
              </NavLink>
              <NavLink to="/cms" className={({ isActive }) => `sidebar-link ${isActive || location.pathname.startsWith('/cms/') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </span>
                {t('layout.cmsPages')}
              </NavLink>
              <NavLink to="/banners" className={({ isActive }) => `sidebar-link ${isActive || location.pathname.startsWith('/banners/') ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </span>
                {t('layout.heroBanners')}
              </NavLink>
            </div>
          </div>

          <div className="sidebar-section">
            <button
              className={`sidebar-section-title collapsible ${expandedSections.analytics ? 'expanded' : ''}`}
              onClick={() => toggleSection('analytics')}
            >
              <span>{t('layout.analytics')}</span>
              <svg className="collapse-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div className={`sidebar-section-content ${expandedSections.analytics ? 'expanded' : ''}`}>
              <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                <span className="sidebar-link-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </span>
                {t('layout.reports')}
              </NavLink>
            </div>
          </div>

          {hasPermission('super_admin') && (
            <div className="sidebar-section">
              <button
                className={`sidebar-section-title collapsible ${expandedSections.settings ? 'expanded' : ''}`}
                onClick={() => toggleSection('settings')}
              >
                <span>{t('layout.settings')}</span>
                <svg className="collapse-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div className={`sidebar-section-content ${expandedSections.settings ? 'expanded' : ''}`}>
                <NavLink to="/admins" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={closeMobileSidebar}>
                  <span className="sidebar-link-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </span>
                  {t('layout.adminUsers')}
                </NavLink>
              </div>
            </div>
          )}
        </nav>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileSidebarOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="topbar-title">{getPageTitle()}</div>
          <div className="topbar-user">
            {/* Language Switcher */}
            <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
              <button
                onClick={() => handleLangChange('en')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  background: currentLang === 'en' ? '#f59e0b' : 'transparent',
                  borderColor: currentLang === 'en' ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                  color: currentLang === 'en' ? '#000' : 'inherit',
                  fontWeight: currentLang === 'en' ? '600' : '400',
                }}
              >
                EN
              </button>
              <button
                onClick={() => handleLangChange('ko')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  background: currentLang === 'ko' ? '#f59e0b' : 'transparent',
                  borderColor: currentLang === 'ko' ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                  color: currentLang === 'ko' ? '#000' : 'inherit',
                  fontWeight: currentLang === 'ko' ? '600' : '400',
                }}
              >
                한국어
              </button>
            </div>
            <div className="topbar-user-info">
              <div className="topbar-user-name">{admin?.firstName} {admin?.lastName}</div>
              <div className="topbar-user-role">{admin?.role?.replace('_', ' ')}</div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {t('layout.logout')}
            </button>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
