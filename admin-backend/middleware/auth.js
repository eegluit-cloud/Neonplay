const jwt = require('jsonwebtoken');
const { getDb } = require('../database/init');

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const db = getDb();
    const admin = db.prepare('SELECT id, email, role, status FROM admins WHERE id = ?').get(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Log admin actions
const logAction = (action, entityType = null) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Log after successful response
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const db = getDb();
          db.prepare(`
            INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            req.admin.id,
            action,
            entityType,
            req.params.id || req.params.playerId || null,
            JSON.stringify({ body: req.body, params: req.params }),
            req.ip
          );
        } catch (err) {
          console.error('Failed to log admin action:', err);
        }
      }
      return originalJson(data);
    };
    next();
  };
};

module.exports = { authenticateAdmin, requireRole, logAction };
