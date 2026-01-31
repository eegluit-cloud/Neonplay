const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database/init');

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role, type: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const token = generateToken(admin);

    // Log login
    db.prepare(`
      INSERT INTO admin_logs (admin_id, action, details, ip_address)
      VALUES (?, 'login', ?, ?)
    `).run(admin.id, JSON.stringify({ email }), req.ip);

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const db = getDb();
    const admin = db.prepare(`
      SELECT id, email, first_name, last_name, role, status, created_at
      FROM admins WHERE id = ?
    `).get(req.admin.id);

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role,
        status: admin.status,
        createdAt: admin.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = getDb();

    const admin = db.prepare('SELECT password_hash FROM admins WHERE id = ?').get(req.admin.id);

    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(passwordHash, req.admin.id);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 50, adminId, action, startDate, endDate } = req.query;

    let query = `
      SELECT al.*, a.email as admin_email, a.first_name, a.last_name
      FROM admin_logs al
      JOIN admins a ON al.admin_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (adminId) {
      query += ' AND al.admin_id = ?';
      params.push(adminId);
    }

    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }

    if (startDate) {
      query += ' AND al.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND al.created_at <= ?';
      params.push(endDate);
    }

    // Get total count
    const countQuery = query.replace(/SELECT al\.\*, a\.email as admin_email, a\.first_name, a\.last_name/, 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    // Add pagination
    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const logs = db.prepare(query).all(...params);

    res.json({
      logs: logs.map(l => ({
        id: l.id,
        adminId: l.admin_id,
        adminEmail: l.admin_email,
        adminName: `${l.first_name || ''} ${l.last_name || ''}`.trim(),
        action: l.action,
        entityType: l.entity_type,
        entityId: l.entity_id,
        details: l.details ? JSON.parse(l.details) : null,
        ipAddress: l.ip_address,
        createdAt: l.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to load activity logs' });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword,
  getActivityLogs
};
