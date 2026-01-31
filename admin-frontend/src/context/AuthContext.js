import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, getProfile } from '../services/api';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing token and validate it
    const token = api.getToken();
    if (token) {
      // Try to get profile to validate token
      getProfile()
        .then(data => {
          setAdmin(data.admin);
          setLoading(false);
        })
        .catch(() => {
          // Token invalid, remove it
          api.removeToken();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await apiLogin(email, password);
      if (response.token) {
        api.setToken(response.token);
      }
      if (response.admin) {
        setAdmin(response.admin);
      }
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    api.removeToken();
    setAdmin(null);
  };

  const hasPermission = (requiredRoles) => {
    if (!admin) return false;
    if (typeof requiredRoles === 'string') {
      return admin.role === requiredRoles || admin.role === 'super_admin';
    }
    return requiredRoles.includes(admin.role) || admin.role === 'super_admin';
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!admin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
