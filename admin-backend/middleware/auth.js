const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authenticateAdmin = async (req, res, next) => {
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

    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      status: admin.isActive ? 'active' : 'inactive'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Authentication error:', error);
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
    res.json = async (data) => {
      // Log after successful response
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          await prisma.adminAuditLog.create({
            data: {
              adminId: req.admin.id,
              action,
              entityType: entityType || 'unknown',
              entityId: req.params.id || req.params.playerId || null,
              newValues: { body: req.body, params: req.params },
              ipAddress: req.ip
            }
          });
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
