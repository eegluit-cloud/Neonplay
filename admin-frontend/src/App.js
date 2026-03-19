import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import PlayerDetail from './pages/PlayerDetail';
import KYC from './pages/KYC';
import Games from './pages/Games';
import Bonuses from './pages/Bonuses';
import Reports from './pages/Reports';
import Admins from './pages/Admins';
import CasinoManagement from './pages/CasinoManagement';
import VIP from './pages/VIP';
import CmsPages from './pages/CmsPages';
import CmsPageEdit from './pages/CmsPageEdit';
import Banners from './pages/Banners';
import BannerEdit from './pages/BannerEdit';
import Segments from './pages/Segments';
import SegmentEdit from './pages/SegmentEdit';
import BonusCreate from './pages/BonusCreate';
import BonusDetail from './pages/BonusDetail';

const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasPermission(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="players" element={<Players />} />
        <Route path="players/:playerId" element={<PlayerDetail />} />
        <Route path="kyc" element={<KYC />} />
        <Route path="games" element={<Games />} />
        <Route path="bonuses" element={<Bonuses />} />
        <Route path="bonuses/new" element={<BonusCreate />} />
        <Route path="bonuses/:bonusId" element={<BonusDetail />} />
        <Route path="segments" element={<Segments />} />
        <Route path="segments/new" element={<SegmentEdit />} />
        <Route path="segments/:segmentId" element={<SegmentEdit />} />
        <Route path="vip" element={<VIP />} />
        <Route path="reports" element={<Reports />} />
        <Route path="casino-management" element={<CasinoManagement />} />
        <Route path="cms" element={<CmsPages />} />
        <Route path="cms/:pageId" element={<CmsPageEdit />} />
        <Route path="banners" element={<Banners />} />
        <Route path="banners/:bannerId" element={<BannerEdit />} />
        <Route path="admins" element={
          <ProtectedRoute requiredRoles="super_admin">
            <Admins />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
