const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

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

    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    const token = generateToken(admin);

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.ip
      }
    });

    // Log login
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        action: 'login',
        entityType: 'admin',
        entityId: admin.id,
        newValues: { email },
        ipAddress: req.ip
      }
    });

    // Parse name into firstName and lastName
    const nameParts = admin.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName,
        lastName,
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
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Parse name into firstName and lastName
    const nameParts = admin.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        firstName,
        lastName,
        role: admin.role,
        status: admin.isActive ? 'active' : 'inactive',
        createdAt: admin.createdAt
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

    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: {
        passwordHash: true
      }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.adminUser.update({
      where: { id: req.admin.id },
      data: { passwordHash }
    });

    // Log password change
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'change_password',
        entityType: 'admin',
        entityId: req.admin.id,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
};

const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, adminId, action, startDate, endDate } = req.query;

    const where = {};

    if (adminId) {
      where.adminId = adminId;
    }

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const total = await prisma.adminAuditLog.count({ where });

    const logs = await prisma.adminAuditLog.findMany({
      where,
      include: {
        admin: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      logs: logs.map(l => ({
        id: l.id,
        adminId: l.adminId,
        adminEmail: l.admin.email,
        adminName: l.admin.name,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        details: l.newValues || null,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt
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
