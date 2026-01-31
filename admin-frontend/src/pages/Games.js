import React, { useState, useEffect } from 'react';
import { games as staticGames, categories as staticCategories, providers as staticProviders } from '../data/staticData';

const aggregatorsData = [
  { id: 1, name: 'SoftSwiss', status: 'active', providerCount: 4, gameCount: 8 }
];

const Games = () => {
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aggregators, setAggregators] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: '', providerId: '', categoryId: '', status: '' });
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    loadCategories();
    loadAggregators();
    loadProviders();
  }, []);

  useEffect(() => {
    if (activeTab === 'games') loadGames();
  }, [activeTab, pagination.page, filters]);

  const loadCategories = () => {
    setCategories(staticCategories.map(c => ({
      ...c,
      type: 'custom',
      status: 'active',
      sortOrder: c.id,
      icon: c.id === 1 ? '🎰' : c.id === 2 ? '🃏' : c.id === 3 ? '🎥' : '💰'
    })));
  };

  const loadAggregators = () => {
    setAggregators(aggregatorsData);
  };

  const loadProviders = () => {
    setProviders(staticProviders.map(p => ({
      ...p,
      aggregatorName: 'SoftSwiss',
      commissionRate: 15
    })));
  };

  const loadGames = () => {
    setLoading(true);
    let filtered = [...staticGames];

    if (filters.search) {
      filtered = filtered.filter(g => g.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.providerId) {
      filtered = filtered.filter(g => g.providerId === parseInt(filters.providerId));
    }
    if (filters.categoryId) {
      filtered = filtered.filter(g => g.categoryId === parseInt(filters.categoryId));
    }
    if (filters.status) {
      filtered = filtered.filter(g => g.status === filters.status);
    }

    const total = filtered.length;
    const pages = Math.ceil(total / 30) || 1;
    setGames(filtered);
    setPagination({ page: 1, pages });
    setLoading(false);
  };

  const handleUpdateCategory = (categoryId, data) => {
    setCategories(categories.map(c => c.id === categoryId ? { ...c, ...data } : c));
  };

  const handleUpdateAggregator = (aggregatorId, data) => {
    setAggregators(aggregators.map(a => a.id === aggregatorId ? { ...a, ...data } : a));
  };

  const handleUpdateProvider = (providerId, data) => {
    setProviders(providers.map(p => p.id === providerId ? { ...p, ...data } : p));
  };

  const handleUpdateGame = (gameId, data) => {
    setGames(games.map(g => g.id === gameId ? { ...g, ...data } : g));
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCat = {
      id: categories.length + 1,
      name: formData.get('name'),
      slug: formData.get('slug'),
      icon: formData.get('icon') || '🎮',
      type: 'custom',
      status: 'active',
      gameCount: 0,
      sortOrder: categories.length + 1
    };
    setCategories([...categories, newCat]);
    setShowModal(null);
    alert('Category created successfully');
  };

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>Games</button>
        <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories</button>
        <button className={`tab ${activeTab === 'providers' ? 'active' : ''}`} onClick={() => setActiveTab('providers')}>Providers</button>
        <button className={`tab ${activeTab === 'aggregators' ? 'active' : ''}`} onClick={() => setActiveTab('aggregators')}>Aggregators</button>
      </div>

      {/* Games Tab */}
      {activeTab === 'games' && (
        <div>
          <div className="card mb-2">
            <div className="form-inline">
              <input
                type="text"
                className="form-input"
                placeholder="Search games..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{ flex: 2 }}
              />
              <select
                className="form-select"
                value={filters.providerId}
                onChange={(e) => setFilters({ ...filters, providerId: e.target.value })}
              >
                <option value="">All Providers</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select
                className="form-select"
                value={filters.categoryId}
                onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="card">
            {loading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Game</th>
                      <th>Provider</th>
                      <th>RTP</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(game => (
                      <tr key={game.id}>
                        <td>
                          <div style={{ fontWeight: '500' }}>{game.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                            {game.categories?.map(c => c.name).join(', ')}
                          </div>
                        </td>
                        <td>{game.providerName}</td>
                        <td>{game.rtp}%</td>
                        <td>
                          <span className={`badge badge-${game.status === 'active' ? 'success' : 'danger'}`}>{game.status}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleUpdateGame(game.id, { status: game.status === 'active' ? 'disabled' : 'active' })}
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
            )}
            {pagination.pages > 1 && (
              <div className="pagination mt-2">
                <button disabled={pagination.page === 1} onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>Previous</button>
                <span style={{ padding: '8px 14px', color: 'var(--gray)' }}>Page {pagination.page} of {pagination.pages}</span>
                <button disabled={pagination.page === pagination.pages} onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>Next</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Categories</h3>
            <button className="btn btn-primary" onClick={() => setShowModal('category')}>Add Category</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Games</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.sortOrder}</td>
                    <td>{cat.icon} {cat.name}</td>
                    <td><span className={`badge badge-${cat.type === 'system' ? 'info' : 'primary'}`}>{cat.type}</span></td>
                    <td>{cat.gameCount}</td>
                    <td><span className={`badge badge-${cat.status === 'active' ? 'success' : 'danger'}`}>{cat.status}</span></td>
                    <td>
                      <button
                        onClick={() => handleUpdateCategory(cat.id, { status: cat.status === 'active' ? 'disabled' : 'active' })}
                        className={`btn btn-sm ${cat.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        disabled={cat.type === 'system'}
                      >
                        {cat.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
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
            <h3 className="card-title">Providers</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Aggregator</th>
                  <th>Commission</th>
                  <th>Games</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(prov => (
                  <tr key={prov.id}>
                    <td>{prov.name}</td>
                    <td>{prov.aggregatorName}</td>
                    <td>{prov.commissionRate}%</td>
                    <td>{prov.gameCount}</td>
                    <td><span className={`badge badge-${prov.status === 'active' ? 'success' : 'danger'}`}>{prov.status}</span></td>
                    <td>
                      <button
                        onClick={() => handleUpdateProvider(prov.id, { status: prov.status === 'active' ? 'disabled' : 'active' })}
                        className={`btn btn-sm ${prov.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      >
                        {prov.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
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
            <h3 className="card-title">Aggregators</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Aggregator</th>
                  <th>Providers</th>
                  <th>Games</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {aggregators.map(agg => (
                  <tr key={agg.id}>
                    <td>{agg.name}</td>
                    <td>{agg.providerCount}</td>
                    <td>{agg.gameCount}</td>
                    <td><span className={`badge badge-${agg.status === 'active' ? 'success' : 'danger'}`}>{agg.status}</span></td>
                    <td>
                      <button
                        onClick={() => handleUpdateAggregator(agg.id, { status: agg.status === 'active' ? 'disabled' : 'active' })}
                        className={`btn btn-sm ${agg.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                      >
                        {agg.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showModal === 'category' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Category</h3>
              <button className="modal-close" onClick={() => setShowModal(null)}>×</button>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input type="text" name="slug" className="form-input" pattern="[a-z0-9-]+" required />
              </div>
              <div className="form-group">
                <label className="form-label">Icon (emoji)</label>
                <input type="text" name="icon" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" rows="3" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Games;
