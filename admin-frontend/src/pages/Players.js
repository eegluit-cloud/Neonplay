import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlayers, updatePlayerStatus } from '../services/api';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    kycStatus: '',
    minBalance: '',
    maxBalance: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    loadPlayers();
  }, [pagination.page, filters]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: 20,
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.kycStatus) params.kycStatus = filters.kycStatus;
      if (filters.minBalance) params.minBalance = filters.minBalance;
      if (filters.maxBalance) params.maxBalance = filters.maxBalance;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await getPlayers(params);

      setPlayers(response.players || []);

      // Backend returns pagination nested in response.pagination
      const paginationData = response.pagination || {};
      setPagination({
        page: paginationData.page || 1,
        pages: paginationData.pages || 1,
        total: paginationData.total || 0,
      });
      setSelectedPlayers([]);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load players:', err);
      setError(err.message || 'Failed to load players');
      setPlayers([]);
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusChange = async (playerId, newStatus) => {
    const reason = window.prompt(`Please provide a reason for ${newStatus === 'blocked' ? 'blocking' : 'changing status of'} this player:`);
    if (!reason) return;

    try {
      await updatePlayerStatus(playerId, newStatus, reason);
      alert(`Player status updated to ${newStatus}`);
      loadPlayers(); // Reload the players list
    } catch (err) {
      console.error('Failed to update player status:', err);
      alert('Failed to update player status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSelectPlayer = (playerId) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map(p => p.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPlayers.length === 0) return;

    if (bulkAction === 'block') {
      const reason = window.prompt('Reason for blocking selected players:');
      if (!reason) return;

      try {
        await Promise.all(selectedPlayers.map(id => updatePlayerStatus(id, 'blocked', reason)));
        alert(`${selectedPlayers.length} player(s) blocked`);
        loadPlayers();
      } catch (err) {
        console.error('Bulk block failed:', err);
        alert('Failed to block some players: ' + (err.message || 'Unknown error'));
      }
    } else if (bulkAction === 'activate') {
      try {
        await Promise.all(selectedPlayers.map(id => updatePlayerStatus(id, 'active', 'Bulk activation')));
        alert(`${selectedPlayers.length} player(s) activated`);
        loadPlayers();
      } catch (err) {
        console.error('Bulk activate failed:', err);
        alert('Failed to activate some players: ' + (err.message || 'Unknown error'));
      }
    } else if (bulkAction === 'suspend') {
      const reason = window.prompt('Reason for suspending selected players:');
      if (!reason) return;

      try {
        await Promise.all(selectedPlayers.map(id => updatePlayerStatus(id, 'suspended', reason)));
        alert(`${selectedPlayers.length} player(s) suspended`);
        loadPlayers();
      } catch (err) {
        console.error('Bulk suspend failed:', err);
        alert('Failed to suspend some players: ' + (err.message || 'Unknown error'));
      }
    } else if (bulkAction === 'export') {
      handleExport();
    }

    setShowBulkModal(false);
    setBulkAction('');
    setSelectedPlayers([]);
  };

  const handleExport = () => {
    const dataToExport = selectedPlayers.length > 0
      ? players.filter(p => selectedPlayers.includes(p.id))
      : players;

    const csv = [
      ['ID', 'Email', 'First Name', 'Last Name', 'Balance', 'Bonus', 'Status', 'KYC', 'Registered'].join(','),
      ...dataToExport.map(p => [
        p.id, p.email, p.firstName || '', p.lastName || '',
        p.balance || 0, p.bonusBalance || 0, p.status, p.kycStatus,
        new Date(p.createdAt).toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `players-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    alert(`Exported ${dataToExport.length} player(s) from current page`);
  };

  const clearFilters = () => {
    setFilters({
      search: '', status: '', kycStatus: '', minBalance: '', maxBalance: '',
      dateFrom: '', dateTo: '', sortBy: 'createdAt', sortOrder: 'desc'
    });
    setPagination({ ...pagination, page: 1 });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const activeFiltersCount = [
    filters.status, filters.kycStatus, filters.minBalance, filters.maxBalance,
    filters.dateFrom, filters.dateTo
  ].filter(Boolean).length;

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

      {/* Quick Filters */}
      <div className="quick-filters">
        <button
          className={`quick-filter ${!filters.status && !filters.kycStatus ? 'active' : ''}`}
          onClick={() => { setFilters({ ...filters, status: '', kycStatus: '' }); setPagination({ ...pagination, page: 1 }); }}
        >
          All Players
        </button>
        <button
          className={`quick-filter ${filters.status === 'active' && !filters.kycStatus ? 'active' : ''}`}
          onClick={() => { setFilters({ ...filters, status: 'active', kycStatus: '' }); setPagination({ ...pagination, page: 1 }); }}
        >
          Active
        </button>
        <button
          className={`quick-filter ${filters.status === 'blocked' && !filters.kycStatus ? 'active' : ''}`}
          onClick={() => { setFilters({ ...filters, status: 'blocked', kycStatus: '' }); setPagination({ ...pagination, page: 1 }); }}
        >
          Blocked
        </button>
        <button
          className={`quick-filter ${filters.kycStatus === 'pending' && !filters.status ? 'active' : ''}`}
          onClick={() => { setFilters({ ...filters, status: '', kycStatus: 'pending' }); setPagination({ ...pagination, page: 1 }); }}
        >
          KYC Pending
        </button>
        <button
          className={`quick-filter ${filters.kycStatus === 'verified' && !filters.status ? 'active' : ''}`}
          onClick={() => { setFilters({ ...filters, status: '', kycStatus: 'verified' }); setPagination({ ...pagination, page: 1 }); }}
        >
          KYC Verified
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card mb-2">
        <div className="form-inline">
          <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by ID, email, name, or phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <select
              className="form-select"
              value={filters.kycStatus}
              onChange={(e) => handleFilterChange('kycStatus', e.target.value)}
            >
              <option value="">All KYC</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
          <button
            className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{ whiteSpace: 'nowrap' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <div className="form-inline" style={{ marginTop: '15px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label-sm">Min Balance</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="$0"
                  value={filters.minBalance}
                  onChange={(e) => handleFilterChange('minBalance', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label-sm">Max Balance</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="No limit"
                  value={filters.maxBalance}
                  onChange={(e) => handleFilterChange('maxBalance', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label-sm">Registered From</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label-sm">Registered To</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label-sm">Sort By</label>
                <select
                  className="form-select"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="createdAt">Registration Date</option>
                  <option value="lastLogin">Last Login</option>
                  <option value="balance">Balance</option>
                  <option value="bonusBalance">Bonus Balance</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 0.5, marginBottom: 0 }}>
                <label className="form-label-sm">Order</label>
                <select
                  className="form-select"
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ alignSelf: 'flex-end' }}>
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedPlayers.length > 0 && (
        <div className="bulk-actions-bar">
          <span className="bulk-count">{selectedPlayers.length} player(s) selected</span>
          <div className="bulk-buttons">
            <button className="btn btn-sm btn-success" onClick={() => { setBulkAction('activate'); setShowBulkModal(true); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Activate
            </button>
            <button className="btn btn-sm btn-warning" onClick={() => { setBulkAction('suspend'); setShowBulkModal(true); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              Suspend
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => { setBulkAction('block'); setShowBulkModal(true); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              Block
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handleExport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Selected
            </button>
            <button className="btn btn-sm btn-secondary" onClick={() => setSelectedPlayers([])}>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Players Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Players ({pagination.total})</h3>
          <div className="card-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleExport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : players.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedPlayers.length === players.length && players.length > 0}
                      onChange={handleSelectAll}
                      className="table-checkbox"
                    />
                  </th>
                  <th>Player</th>
                  <th>Balance</th>
                  <th>Bonus</th>
                  <th>Status</th>
                  <th>KYC</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className={selectedPlayers.includes(player.id) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.id)}
                        onChange={() => handleSelectPlayer(player.id)}
                        className="table-checkbox"
                      />
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{player.firstName} {player.lastName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{player.email}</div>
                        {player.tags?.length > 0 && (
                          <div style={{ marginTop: '5px' }}>
                            {player.tags.map(tag => (
                              <span key={tag.id} style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                marginRight: '5px',
                                background: tag.color + '33',
                                color: tag.color
                              }}>
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{formatCurrency(player.balance)}</td>
                    <td>{formatCurrency(player.bonusBalance)}</td>
                    <td>
                      <span className={`badge badge-${player.status === 'active' ? 'success' : player.status === 'suspended' ? 'warning' : 'danger'}`}>
                        {player.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${player.kycStatus === 'verified' ? 'success' : player.kycStatus === 'pending' ? 'warning' : 'danger'}`}>
                        {player.kycStatus}
                      </span>
                    </td>
                    <td>{formatDate(player.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/players/${player.id}`} className="btn btn-sm btn-primary">
                          View
                        </Link>
                        {player.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(player.id, 'blocked')}
                            className="btn btn-sm btn-danger"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(player.id, 'active')}
                            className="btn btn-sm btn-success"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No players found</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination mt-2">
            <button
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </button>
            <span style={{ padding: '8px 14px', color: 'var(--gray)' }}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Bulk Action Confirmation Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Bulk Action</h3>
              <button className="modal-close" onClick={() => setShowBulkModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '15px' }}>
                Are you sure you want to <strong>{bulkAction}</strong> {selectedPlayers.length} selected player(s)?
              </p>
              {(bulkAction === 'block' || bulkAction === 'suspend') && (
                <div className="alert alert-warning">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  This action will immediately affect all selected players.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button
                className={`btn ${bulkAction === 'activate' ? 'btn-success' : bulkAction === 'suspend' ? 'btn-warning' : 'btn-danger'}`}
                onClick={handleBulkAction}
              >
                {bulkAction === 'activate' ? 'Activate' : bulkAction === 'suspend' ? 'Suspend' : 'Block'} Players
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
