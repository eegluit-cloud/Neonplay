const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8002/api';

class ApiService {
  constructor() {
    this.baseUrl = API_URL;
  }

  getToken() {
    return localStorage.getItem('admin_token');
  }

  setToken(token) {
    localStorage.setItem('admin_token', token);
  }

  removeToken() {
    localStorage.removeItem('admin_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiService();

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getProfile = () => api.get('/auth/profile');
export const changePassword = (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword });
export const getActivityLogs = (params) => api.get(`/auth/activity-logs?${new URLSearchParams(params)}`);

// Dashboard / Reports
export const getDashboardSummary = () => api.get('/reports/dashboard');
export const getTransactionReport = (params) => api.get(`/reports/transactions?${new URLSearchParams(params)}`);
export const getBankingReport = (params) => api.get(`/reports/banking?${new URLSearchParams(params)}`);
export const getBonusReport = (params) => api.get(`/reports/bonuses?${new URLSearchParams(params)}`);
export const getPlayerReport = (params) => api.get(`/reports/players?${new URLSearchParams(params)}`);
export const getGameReport = (params) => api.get(`/reports/games?${new URLSearchParams(params)}`);
export const exportReport = (report, params) => api.get(`/reports/export?report=${report}&${new URLSearchParams(params)}`);

// Players
export const getPlayers = (params) => api.get(`/players?${new URLSearchParams(params)}`);
export const getPlayer = (playerId) => api.get(`/players/${playerId}`);
export const updatePlayer = (playerId, data) => api.put(`/players/${playerId}`, data);
export const updatePlayerStatus = (playerId, status, reason) => api.patch(`/players/${playerId}/status`, { status, reason });
export const adjustBalance = (playerId, data) => api.post(`/players/${playerId}/balance`, data);
export const addPlayerNote = (playerId, note) => api.post(`/players/${playerId}/notes`, { note });
export const getPlayerTags = () => api.get('/players/tags');
export const createTag = (name, color) => api.post('/players/tags', { name, color });
export const assignTag = (playerId, tagId) => api.post(`/players/${playerId}/tags`, { tagId });
export const removeTag = (playerId, tagId) => api.delete(`/players/${playerId}/tags/${tagId}`);
export const getPlayerTransactions = (playerId, params) => api.get(`/players/${playerId}/transactions?${new URLSearchParams(params)}`);
export const processWithdrawal = (transactionId, action, notes) => api.post(`/players/transactions/${transactionId}/process`, { action, notes });

// KYC
export const getKycStats = () => api.get('/kyc/stats');
export const getKycQueue = (params) => api.get(`/kyc/queue?${new URLSearchParams(params)}`);
export const getPlayerKyc = (playerId) => api.get(`/kyc/player/${playerId}`);
export const reviewDocument = (documentId, action, notes) => api.post(`/kyc/document/${documentId}/review`, { action, notes });
export const requestDocuments = (playerId, message, requiredDocs) => api.post(`/kyc/player/${playerId}/request-documents`, { message, requiredDocs });

// Games Management
export const getCategories = () => api.get('/games/categories');
export const createCategory = (data) => api.post('/games/categories', data);
export const updateCategory = (categoryId, data) => api.put(`/games/categories/${categoryId}`, data);
export const deleteCategory = (categoryId) => api.delete(`/games/categories/${categoryId}`);
export const reorderCategories = (order) => api.post('/games/categories/reorder', { order });
export const getAggregators = () => api.get('/games/aggregators');
export const updateAggregator = (aggregatorId, data) => api.put(`/games/aggregators/${aggregatorId}`, data);
export const getProviders = (params) => api.get(`/games/providers?${new URLSearchParams(params || {})}`);
export const updateProvider = (providerId, data) => api.put(`/games/providers/${providerId}`, data);
export const getGames = (params) => api.get(`/games?${new URLSearchParams(params)}`);
export const getGame = (gameId) => api.get(`/games/${gameId}`);
export const updateGame = (gameId, data) => api.put(`/games/${gameId}`, data);
export const bulkUpdateGames = (data) => api.post('/games/bulk-update', data);

// Bonus Management
export const getBonusStats = () => api.get('/bonus/stats');
export const getBonuses = (params) => api.get(`/bonus?${new URLSearchParams(params)}`);
export const getBonus = (bonusId) => api.get(`/bonus/${bonusId}`);
export const createBonus = (data) => api.post('/bonus', data);
export const updateBonus = (bonusId, data) => api.put(`/bonus/${bonusId}`, data);
export const deleteBonus = (bonusId) => api.delete(`/bonus/${bonusId}`);
export const getPlayerBonuses = (params) => api.get(`/bonus/player-bonuses?${new URLSearchParams(params)}`);
export const awardBonus = (data) => api.post('/bonus/award', data);
export const cancelPlayerBonus = (playerBonusId, reason) => api.post(`/bonus/player-bonuses/${playerBonusId}/cancel`, { reason });

// Admin Management
export const getAdmins = (params) => api.get(`/admins?${new URLSearchParams(params || {})}`);
export const getAdmin = (adminId) => api.get(`/admins/${adminId}`);
export const createAdmin = (data) => api.post('/admins', data);
export const updateAdmin = (adminId, data) => api.put(`/admins/${adminId}`, data);
export const updateAdminStatus = (adminId, status) => api.patch(`/admins/${adminId}/status`, { status });
export const resetAdminPassword = (adminId, newPassword) => api.post(`/admins/${adminId}/reset-password`, { newPassword });
export const deleteAdmin = (adminId) => api.delete(`/admins/${adminId}`);

export { api };
export default api;
