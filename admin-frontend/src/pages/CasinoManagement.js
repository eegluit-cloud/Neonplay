import React, { useState, useEffect } from 'react';
import {
  getCategories, getAggregators, getProviders, getGames,
  createCategory, updateCategory, deleteCategory,
  updateAggregator, updateProvider, updateGame
} from '../services/api';

const CasinoManagement = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '', slug: '', description: '', icon: 'star', displayOrder: 1, status: 'active', showOnHomepage: true
  });

  // Aggregators state
  const [aggregators, setAggregators] = useState([]);

  // Providers state
  const [providers, setProviders] = useState([]);
  const [providerFilter, setProviderFilter] = useState({ aggregator: '', status: '' });

  // Games state
  const [games, setGames] = useState([]);
  const [gameSearch, setGameSearch] = useState('');
  const [gameFilter, setGameFilter] = useState({ provider: '', category: '', status: '' });
  const [selectedGames, setSelectedGames] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [categoriesRes, aggregatorsRes, providersRes, gamesRes] = await Promise.all([
        getCategories(),
        getAggregators(),
        getProviders(),
        getGames({ limit: 100 })
      ]);

      setCategories(categoriesRes.categories || []);
      setAggregators(aggregatorsRes.aggregators || []);
      setProviders(providersRes.providers || []);
      setGames(gamesRes.games || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load casino management data:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  // Category functions
  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      if (editCategory) {
        await updateCategory(editCategory.id, categoryForm);
        setCategories(categories.map(c => c.id === editCategory.id ? { ...c, ...categoryForm } : c));
        alert('Category updated successfully');
      } else {
        const categoryData = {
          ...categoryForm,
          slug: categoryForm.name.toLowerCase().replace(/\s+/g, '-')
        };
        const response = await createCategory(categoryData);
        setCategories([...categories, response.category]);
        alert('Category created successfully');
      }
      closeCategoryModal();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category: ' + (err.message || 'Unknown error'));
    }
  };

  const openEditCategory = (category) => {
    setEditCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      displayOrder: category.displayOrder,
      status: category.status,
      showOnHomepage: category.showOnHomepage
    });
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditCategory(null);
    setCategoryForm({ name: '', slug: '', description: '', icon: 'star', displayOrder: 1, status: 'active', showOnHomepage: true });
  };

  const toggleCategoryStatus = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const newStatus = category.status === 'active' ? 'inactive' : 'active';

    try {
      await updateCategory(categoryId, { status: newStatus });
      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error('Failed to toggle category status:', err);
      alert('Failed to toggle category status: ' + (err.message || 'Unknown error'));
    }
  };

  const deleteCategoryFunc = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      alert('Category deleted successfully');
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category: ' + (err.message || 'Unknown error'));
    }
  };

  // Aggregator functions
  const toggleAggregatorStatus = (aggregatorId) => {
    setAggregators(aggregators.map(a =>
      a.id === aggregatorId ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ));
  };

  const syncAggregator = (aggregatorId) => {
    alert('Sync started. This may take a few minutes.');
    setAggregators(aggregators.map(a =>
      a.id === aggregatorId ? { ...a, lastSync: new Date().toISOString() } : a
    ));
  };

  // Provider functions
  const toggleProviderStatus = (providerId) => {
    setProviders(providers.map(p =>
      p.id === providerId ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
    ));
  };

  const filteredProviders = providers.filter(p => {
    if (providerFilter.aggregator && p.aggregatorId !== parseInt(providerFilter.aggregator)) return false;
    if (providerFilter.status && p.status !== providerFilter.status) return false;
    return true;
  });

  // Game functions
  const filteredGames = games.filter(g => {
    if (gameSearch && !g.name.toLowerCase().includes(gameSearch.toLowerCase())) return false;
    if (gameFilter.provider && g.providerId !== parseInt(gameFilter.provider)) return false;
    if (gameFilter.status && g.status !== gameFilter.status) return false;
    return true;
  });

  const toggleGameSelection = (gameId) => {
    setSelectedGames(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const selectAllGames = () => {
    if (selectedGames.length === filteredGames.length) {
      setSelectedGames([]);
    } else {
      setSelectedGames(filteredGames.map(g => g.id));
    }
  };

  const toggleGameStatus = (gameId) => {
    setGames(games.map(g =>
      g.id === gameId ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g
    ));
  };

  const bulkToggleStatus = (status) => {
    setGames(games.map(g =>
      selectedGames.includes(g.id) ? { ...g, status } : g
    ));
    setSelectedGames([]);
    alert(`${selectedGames.length} games ${status === 'active' ? 'enabled' : 'disabled'}`);
  };

  const assignGamesToCategory = (categoryId) => {
    const newAssignments = selectedGames
      .filter(gameId => !assignments.some(a => a.gameId === gameId && a.categoryId === categoryId))
      .map(gameId => ({
        id: Math.max(0, ...assignments.map(a => a.id)) + 1,
        gameId,
        categoryId
      }));
    setAssignments([...assignments, ...newAssignments]);
    setShowAssignModal(false);
    setSelectedGames([]);
    alert(`${newAssignments.length} games assigned to category`);
  };

  const getGameCategories = (gameId) => {
    const categoryIds = assignments.filter(a => a.gameId === gameId).map(a => a.categoryId);
    return categories.filter(c => categoryIds.includes(c.id));
  };

  const removeGameFromCategory = (gameId, categoryId) => {
    setAssignments(assignments.filter(a => !(a.gameId === gameId && a.categoryId === categoryId)));
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  const iconOptions = ['star', 'fire', 'diamond', 'gift', 'trending-up', 'sparkles', 'crown', 'lightning'];

  return (
    <div>
      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading" style={{ marginBottom: '20px' }}>
          <div className="spinner"></div>
          <p>Loading casino management data...</p>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={`tab ${activeTab === 'aggregators' ? 'active' : ''}`}
            onClick={() => setActiveTab('aggregators')}
          >
            Aggregators
          </button>
          <button
            className={`tab ${activeTab === 'providers' ? 'active' : ''}`}
            onClick={() => setActiveTab('providers')}
          >
            Providers
          </button>
          <button
            className={`tab ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            Games
          </button>
        </div>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Custom Game Categories</h3>
            <button className="btn btn-primary" onClick={() => setShowCategoryModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Category
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Games</th>
                  <th>Homepage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.sort((a, b) => a.displayOrder - b.displayOrder).map(category => (
                  <tr key={category.id}>
                    <td>{category.displayOrder}</td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{category.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{category.slug}</div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>{category.description}</td>
                    <td>{assignments.filter(a => a.categoryId === category.id).length}</td>
                    <td>
                      <span className={`badge badge-${category.showOnHomepage ? 'success' : 'secondary'}`}>
                        {category.showOnHomepage ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${category.status === 'active' ? 'success' : 'danger'}`}>
                        {category.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => openEditCategory(category)} className="btn btn-sm btn-secondary">
                          Edit
                        </button>
                        <button onClick={() => toggleCategoryStatus(category.id)} className="btn btn-sm btn-warning">
                          {category.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => deleteCategory(category.id)} className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aggregators Tab */}
      {activeTab === 'aggregators' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Game Aggregators</h3>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Aggregator</th>
                  <th>API Endpoint</th>
                  <th>Providers</th>
                  <th>Games</th>
                  <th>Last Sync</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aggregators.map(agg => (
                  <tr key={agg.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{agg.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{agg.slug}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{agg.apiUrl || 'N/A'}</td>
                    <td>{agg.providerCount || 0}</td>
                    <td>{(agg.gameCount || 0).toLocaleString()}</td>
                    <td style={{ fontSize: '0.85rem' }}>{agg.createdAt ? formatDate(agg.createdAt) : 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${agg.status === 'active' ? 'success' : 'danger'}`}>
                        {agg.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => syncAggregator(agg.id)} className="btn btn-sm btn-primary">
                          Sync
                        </button>
                        <button onClick={() => toggleAggregatorStatus(agg.id)} className={`btn btn-sm ${agg.status === 'active' ? 'btn-danger' : 'btn-success'}`}>
                          {agg.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Game Providers</h3>
          </div>

          <div className="filters-bar">
            <select
              className="form-select"
              value={providerFilter.aggregator}
              onChange={(e) => setProviderFilter({ ...providerFilter, aggregator: e.target.value })}
            >
              <option value="">All Aggregators</option>
              {aggregators.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={providerFilter.status}
              onChange={(e) => setProviderFilter({ ...providerFilter, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Aggregator</th>
                  <th>Games</th>
                  <th>Total Bets</th>
                  <th>Total Wins</th>
                  <th>GGR</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProviders.map(provider => (
                  <tr key={provider.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{provider.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{provider.slug}</div>
                    </td>
                    <td>{provider.aggregatorName}</td>
                    <td>{provider.gameCount}</td>
                    <td>${provider.totalBets?.toLocaleString() || 0}</td>
                    <td>${provider.totalWins?.toLocaleString() || 0}</td>
                    <td style={{ color: 'var(--success)' }}>
                      ${((provider.totalBets || 0) - (provider.totalWins || 0)).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${provider.status === 'active' ? 'success' : 'danger'}`}>
                        {provider.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleProviderStatus(provider.id)}
                        className={`btn btn-sm ${provider.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      >
                        {provider.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Games Management</h3>
            {selectedGames.length > 0 && (
              <div className="bulk-actions">
                <span className="bulk-count">{selectedGames.length} selected</span>
                <button onClick={() => bulkToggleStatus('active')} className="btn btn-sm btn-success">Enable</button>
                <button onClick={() => bulkToggleStatus('inactive')} className="btn btn-sm btn-danger">Disable</button>
                <button onClick={() => setShowAssignModal(true)} className="btn btn-sm btn-primary">Assign to Category</button>
              </div>
            )}
          </div>

          <div className="filters-bar">
            <input
              type="text"
              className="form-input"
              placeholder="Search games..."
              value={gameSearch}
              onChange={(e) => setGameSearch(e.target.value)}
              style={{ maxWidth: '250px' }}
            />
            <select
              className="form-select"
              value={gameFilter.provider}
              onChange={(e) => setGameFilter({ ...gameFilter, provider: e.target.value })}
            >
              <option value="">All Providers</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              className="form-select"
              value={gameFilter.status}
              onChange={(e) => setGameFilter({ ...gameFilter, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedGames.length === filteredGames.length && filteredGames.length > 0}
                      onChange={selectAllGames}
                    />
                  </th>
                  <th>Game</th>
                  <th>Provider</th>
                  <th>RTP</th>
                  <th>Categories</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.slice(0, 50).map(game => (
                  <tr key={game.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedGames.includes(game.id)}
                        onChange={() => toggleGameSelection(game.id)}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={game.thumbnail}
                          alt={game.name}
                          style={{ width: '50px', height: '38px', borderRadius: '4px', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div>
                          <div style={{ fontWeight: '500' }}>{game.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{game.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td>{game.providerName}</td>
                    <td>{game.rtp}%</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {getGameCategories(game.id).map(cat => (
                          <span key={cat.id} className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                            {cat.name}
                            <button
                              onClick={() => removeGameFromCategory(game.id, cat.id)}
                              style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${game.status === 'active' ? 'success' : 'danger'}`}>
                        {game.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleGameStatus(game.id)}
                        className={`btn btn-sm ${game.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      >
                        {game.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredGames.length > 50 && (
            <div style={{ padding: '15px', textAlign: 'center', color: 'var(--gray)' }}>
              Showing 50 of {filteredGames.length} games. Use search or filters to narrow results.
            </div>
          )}
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={closeCategoryModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button className="modal-close" onClick={closeCategoryModal}>×</button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Weekly Featured"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <select
                    className="form-select"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) })}
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={categoryForm.status}
                    onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Show on Homepage</label>
                  <select
                    className="form-select"
                    value={categoryForm.showOnHomepage ? 'yes' : 'no'}
                    onChange={(e) => setCategoryForm({ ...categoryForm, showOnHomepage: e.target.value === 'yes' })}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeCategoryModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign to Category Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Games to Category</h3>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>

            <div style={{ padding: '20px' }}>
              <p style={{ marginBottom: '15px' }}>{selectedGames.length} games selected</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {categories.filter(c => c.status === 'active').map(cat => (
                  <button
                    key={cat.id}
                    className="btn btn-secondary"
                    onClick={() => assignGamesToCategory(cat.id)}
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                  >
                    {cat.name}
                    <span style={{ marginLeft: 'auto', opacity: 0.7 }}>
                      ({assignments.filter(a => a.categoryId === cat.id).length} games)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasinoManagement;
