const bcrypt = require('bcryptjs');
const { getDb } = require('../database/init');

const getAdmins = async (req, res) => {
  try {
    const db = getDb();
    const { status, role } = req.query;

    let query = `
      SELECT id, email, first_name, last_name, role, status, created_at, updated_at
      FROM admins WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const admins = db.prepare(query).all(...params);

    res.json({
      admins: admins.map(a => ({
        id: a.id,
        email: a.email,
        firstName: a.first_name,
        lastName: a.last_name,
        role: a.role,
        status: a.status,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }))
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to load admins' });
  }
};

const getAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const db = getDb();

    const admin = db.prepare(`
      SELECT id, email, first_name, last_name, role, status, created_at, updated_at
      FROM admins WHERE id = ?
    `).get(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Get recent activity
    const recentActivity = db.prepare(`
      SELECT action, entity_type, entity_id, created_at
      FROM admin_logs
      WHERE admin_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(adminId);

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        status: admin.status,
        createdAt: admin.created_at,
        updatedAt: admin.updated_at
      },
      recentActivity: recentActivity.map(a => ({
        action: a.action,
        entityType: a.entity_type,
        entityId: a.entity_id,
        createdAt: a.created_at
      }))
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Failed to load admin' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const db = getDb();

    // Check if requesting admin can create this role
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create new admins' });
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO admins (email, password_hash, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, passwordHash, firstName, lastName, role || 'support');

    res.status(201).json({
      message: 'Admin created',
      adminId: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { firstName, lastName, role } = req.body;
    const db = getDb();

    // Check permissions
    if (req.admin.role !== 'super_admin' && req.admin.id !== parseInt(adminId)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Only super_admin can change roles
    if (role && req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can change roles' });
    }

    const admin = db.prepare('SELECT id FROM admins WHERE id = ?').get(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    db.prepare(`
      UPDATE admins
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          role = COALESCE(?, role),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(firstName, lastName, role, adminId);

    res.json({ message: 'Admin updated' });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
};

const updateAdminStatus = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { status } = req.body;
    const db = getDb();

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can change admin status' });
    }

    // Prevent disabling self
    if (parseInt(adminId) === req.admin.id) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    const admin = db.prepare('SELECT id, role FROM admins WHERE id = ?').get(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Prevent disabling last super_admin
    if (admin.role === 'super_admin' && status === 'disabled') {
      const superAdminCount = db.prepare(`
        SELECT COUNT(*) as count FROM admins WHERE role = 'super_admin' AND status = 'active'
      `).get();

      if (superAdminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot disable the last super admin' });
      }
    }

    db.prepare('UPDATE admins SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, adminId);

    res.json({ message: `Admin ${status === 'active' ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { newPassword } = req.body;
    const db = getDb();

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can reset passwords' });
    }

    const admin = db.prepare('SELECT id FROM admins WHERE id = ?').get(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(passwordHash, adminId);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset admin password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const db = getDb();

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can delete admins' });
    }

    if (parseInt(adminId) === req.admin.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const admin = db.prepare('SELECT id, role FROM admins WHERE id = ?').get(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Prevent deleting last super_admin
    if (admin.role === 'super_admin') {
      const superAdminCount = db.prepare(`
        SELECT COUNT(*) as count FROM admins WHERE role = 'super_admin'
      `).get();

      if (superAdminCount.count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last super admin' });
      }
    }

    // Soft delete - just disable
    db.prepare('UPDATE admins SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('disabled', adminId);

    res.json({ message: 'Admin deleted' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};

module.exports = {
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  resetAdminPassword,
  deleteAdmin
};
