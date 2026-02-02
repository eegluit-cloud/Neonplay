import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKycStats, getKycQueue, reviewDocument } from '../services/api';

const KYC = () => {
  const [stats, setStats] = useState({});
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [status, setStatus] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [status, pagination.page]);

  const loadStats = async () => {
    try {
      const response = await getKycStats();
      setStats(response.stats || {});
    } catch (err) {
      console.error('Failed to load KYC stats:', err);
      setError('Failed to load KYC stats');
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status,
        page: pagination.page,
        limit: 20
      };

      const response = await getKycQueue(params);
      setDocuments(response.documents || []);

      // Backend returns pagination nested in response.pagination
      const paginationData = response.pagination || {};
      setPagination({
        page: paginationData.page || 1,
        pages: paginationData.pages || 1,
        total: paginationData.total || 0
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load KYC documents:', err);
      setError('Failed to load KYC documents');
      setDocuments([]);
      setLoading(false);
    }
  };

  const handleReview = async (action) => {
    if (!selectedDoc) return;

    try {
      await reviewDocument(selectedDoc.id, action, reviewNotes);
      setSelectedDoc(null);
      setReviewNotes('');
      alert(`Document ${action}d successfully`);
      loadDocuments(); // Reload documents
      loadStats(); // Reload stats
    } catch (err) {
      console.error('Failed to review document:', err);
      alert('Failed to review document: ' + (err.message || 'Unknown error'));
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  const getDocTypeLabel = (type) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-title">Pending Documents</div>
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{stats.pending_documents || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Verified Players</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>{stats.verified_players || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Under Review</div>
          <div className="stat-card-value">{stats.under_review_players || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">Rejected</div>
          <div className="stat-card-value" style={{ color: 'var(--danger)' }}>{stats.rejected_players || 0}</div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="quick-filters">
        <button
          className={`quick-filter ${status === 'pending' ? 'active' : ''}`}
          onClick={() => { setStatus('pending'); setPagination({ ...pagination, page: 1 }); }}
        >
          Pending ({stats.pending_documents || 0})
        </button>
        <button
          className={`quick-filter ${status === 'verified' ? 'active' : ''}`}
          onClick={() => { setStatus('verified'); setPagination({ ...pagination, page: 1 }); }}
        >
          Verified
        </button>
        <button
          className={`quick-filter ${status === 'rejected' ? 'active' : ''}`}
          onClick={() => { setStatus('rejected'); setPagination({ ...pagination, page: 1 }); }}
        >
          Rejected
        </button>
      </div>

      {/* Documents Queue */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">KYC Documents</h3>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Document Type</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <Link to={`/players/${doc.playerId}`} style={{ color: 'var(--primary)' }}>
                        {doc.playerName || doc.playerEmail}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{doc.playerEmail}</div>
                    </td>
                    <td>{getDocTypeLabel(doc.docType)}</td>
                    <td>
                      <span className={`badge badge-${doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'danger' : 'warning'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>{formatDate(doc.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => setSelectedDoc(doc)} className="btn btn-sm btn-primary">
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No documents to review</p>
          </div>
        )}

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

      {/* Review Modal */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Review Document</h3>
              <button className="modal-close" onClick={() => setSelectedDoc(null)}>×</button>
            </div>

            <div className="grid grid-2 gap-2 mb-2">
              <div>
                <div style={{ color: 'var(--gray)', marginBottom: '5px' }}>Player</div>
                <div>{selectedDoc.playerName || selectedDoc.playerEmail}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray)', marginBottom: '5px' }}>Document Type</div>
                <div>{getDocTypeLabel(selectedDoc.documentType)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray)', marginBottom: '5px' }}>Uploaded</div>
                <div>{formatDate(selectedDoc.submittedAt)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--gray)', marginBottom: '5px' }}>Status</div>
                <span className={`badge badge-${selectedDoc.status === 'approved' ? 'success' : selectedDoc.status === 'rejected' ? 'danger' : 'warning'}`}>
                  {selectedDoc.status}
                </span>
              </div>
            </div>

            {/* Document Preview */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 'var(--border-radius)',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</div>
              <p style={{ color: 'var(--gray)' }}>Document: {selectedDoc.originalName || selectedDoc.filePath}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginTop: '10px' }}>
                In production, the actual document image would be displayed here.
              </p>
            </div>

            {selectedDoc.status === 'pending' && (
              <>
                <div className="form-group">
                  <label className="form-label">Review Notes</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this document..."
                  />
                </div>

                <div className="modal-footer">
                  <button className="btn btn-danger" onClick={() => handleReview('reject')}>
                    Reject
                  </button>
                  <button className="btn btn-success" onClick={() => handleReview('approve')}>
                    Approve
                  </button>
                </div>
              </>
            )}

            {selectedDoc.status !== 'pending' && selectedDoc.adminNotes && (
              <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ color: 'var(--gray)', marginBottom: '5px' }}>Review Notes</div>
                <div>{selectedDoc.adminNotes}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '10px' }}>
                  Reviewed by: {selectedDoc.reviewerEmail} on {formatDate(selectedDoc.reviewedAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;
