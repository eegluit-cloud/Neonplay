import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAdmins, createAdmin, updateAdmin,
  updateAdminStatus, resetAdminPassword
} from '../services/api';

const Admins = () => {
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'support'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAdmins();
      setAdmins(response.admins || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load admins:', err);
      setError('Failed to load admins');
      setAdmins([]);
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const adminData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };

      const response = await createAdmin(adminData);
      setAdmins([...admins, response.admin]);
      setShowModal(null);
      resetForm();
      alert('Admin created successfully');
    } catch (err) {
      console.error('Failed to create admin:', err);
      setError(err.message || 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };

      await updateAdmin(editAdmin.id, adminData);
      setAdmins(admins.map(a => a.id === editAdmin.id ? { ...a, ...adminData } : a));
      setShowModal(null);
      setEditAdmin(null);
      resetForm();
      alert('Admin updated successfully');
    } catch (err) {
      console.error('Failed to update admin:', err);
      setError(err.message || 'Failed to update admin');
    }
  };

  const handleStatusChange = async (adminId, status) => {
    if (!window.confirm(`Are you sure you want to ${status === 'disabled' ? 'disable' : 'enable'} this admin?`)) return;

    try {
      await updateAdminStatus(adminId, status);
      setAdmins(admins.map(a => a.id === adminId ? { ...a, status } : a));
    } catch (err) {
      console.error('Failed to update admin status:', err);
      alert('Failed to update admin status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleResetPassword = async (adminId) => {
    const newPassword = window.prompt('Enter new password (min 8 characters):');
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      await resetAdminPassword(adminId, newPassword);
      alert('Password reset successfully');
    } catch (err) {
      console.error('Failed to reset password:', err);
      alert('Failed to reset password: ' + (err.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'support' });
  };

  const openEditModal = (admin) => {
    setEditAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      role: admin.role,
    });
    setShowModal('edit');
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'danger';
      case 'manager': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Admin Users</h3>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal('create'); }}>
            Add Admin
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{admin.firstName} {admin.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{admin.email}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${getRoleColor(admin.role)}`}>
                        {admin.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${admin.status === 'active' ? 'success' : 'danger'}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td>{formatDate(admin.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => openEditModal(admin)} className="btn btn-sm btn-secondary">
                          Edit
                        </button>
                        <button onClick={() => handleResetPassword(admin.id)} className="btn btn-sm btn-warning">
                          Reset Password
                        </button>
                        {admin.id !== currentAdmin.id && (
                          <button
                            onClick={() => handleStatusChange(admin.id, admin.status === 'active' ? 'disabled' : 'active')}
                            className={`btn btn-sm ${admin.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                          >
                            {admin.status === 'active' ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showModal === 'create' || showModal === 'edit') && (
        <div className="modal-overlay" onClick={() => { setShowModal(null); setEditAdmin(null); setError(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{showModal === 'create' ? 'Add Admin' : 'Edit Admin'}</h3>
              <button className="modal-close" onClick={() => { setShowModal(null); setEditAdmin(null); setError(''); }}>×</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={showModal === 'create' ? handleCreateAdmin : handleUpdateAdmin}>
              <div className="grid grid-2 gap-2">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              {showModal === 'create' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={8}
                      required
                    />
                  </div>
                </>
              )}

              {showModal === 'edit' && (
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="support">Support</option>
                  <option value="manager">Manager</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '20px' }}>
                <strong>Role Permissions:</strong>
                <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                  <li><strong>Support:</strong> View players, add notes, view KYC</li>
                  <li><strong>Manager:</strong> All support + approve KYC, manage bonuses, adjust balances</li>
                  <li><strong>Super Admin:</strong> Full access including admin management</li>
                </ul>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(null); setEditAdmin(null); setError(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {showModal === 'create' ? 'Create Admin' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
