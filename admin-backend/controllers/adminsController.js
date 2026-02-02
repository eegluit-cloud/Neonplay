const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

const getAdmins = async (req, res) => {
  try {
    const { status, role } = req.query;

    const where = {};

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive' || status === 'disabled') {
      where.isActive = false;
    }

    if (role) {
      where.role = role;
    }

    const admins = await prisma.adminUser.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      admins: admins.map(a => {
        const nameParts = a.name.split(' ');
        return {
          id: a.id,
          email: a.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          role: a.role,
          status: a.isActive ? 'active' : 'disabled',
          createdAt: a.createdAt,
          updatedAt: a.updatedAt
        };
      })
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ error: 'Failed to load admins' });
  }
};

const getAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Get recent activity
    const recentActivity = await prisma.adminAuditLog.findMany({
      where: { adminId },
      select: {
        action: true,
        entityType: true,
        entityId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const nameParts = admin.name.split(' ');

    res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: admin.role,
        status: admin.isActive ? 'active' : 'disabled',
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      },
      recentActivity: recentActivity.map(a => ({
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        createdAt: a.createdAt
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

    // Check if requesting admin can create this role
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can create new admins' });
    }

    // Check if email exists
    const existing = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name: `${firstName} ${lastName}`.trim(),
        role: role || 'support',
        isActive: true,
        createdBy: req.admin.id
      }
    });

    // Log creation
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'create_admin',
        entityType: 'admin',
        entityId: admin.id,
        newValues: {
          email,
          name: admin.name,
          role: admin.role
        },
        ipAddress: req.ip
      }
    });

    res.status(201).json({
      message: 'Admin created',
      adminId: admin.id
    });
  } catch (error) {
    console.error('Create admin error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { firstName, lastName, role } = req.body;

    // Check permissions
    if (req.admin.role !== 'super_admin' && req.admin.id !== adminId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Only super_admin can change roles
    if (role && req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can change roles' });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const data = {};
    if (firstName !== undefined || lastName !== undefined) {
      const nameParts = admin.name.split(' ');
      const currentFirstName = nameParts[0] || '';
      const currentLastName = nameParts.slice(1).join(' ') || '';
      const newFirstName = firstName !== undefined ? firstName : currentFirstName;
      const newLastName = lastName !== undefined ? lastName : currentLastName;
      data.name = `${newFirstName} ${newLastName}`.trim();
    }
    if (role !== undefined) data.role = role;

    await prisma.adminUser.update({
      where: { id: adminId },
      data
    });

    // Log update
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update_admin',
        entityType: 'admin',
        entityId: adminId,
        newValues: data,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Admin updated' });
  } catch (error) {
    console.error('Update admin error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(500).json({ error: 'Failed to update admin' });
  }
};

const updateAdminStatus = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { status } = req.body;

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can change admin status' });
    }

    // Prevent disabling self
    if (adminId === req.admin.id) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Prevent disabling last super_admin
    if (admin.role === 'super_admin' && status === 'disabled') {
      const superAdminCount = await prisma.adminUser.count({
        where: {
          role: 'super_admin',
          isActive: true
        }
      });

      if (superAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot disable the last super admin' });
      }
    }

    await prisma.adminUser.update({
      where: { id: adminId },
      data: { isActive: status === 'active' }
    });

    // Log status change
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update_admin_status',
        entityType: 'admin',
        entityId: adminId,
        newValues: { status },
        ipAddress: req.ip
      }
    });

    res.json({ message: `Admin ${status === 'active' ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Update admin status error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(500).json({ error: 'Failed to update admin status' });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { newPassword } = req.body;

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can reset passwords' });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.adminUser.update({
      where: { id: adminId },
      data: { passwordHash }
    });

    // Log password reset
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'reset_admin_password',
        entityType: 'admin',
        entityId: adminId,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset admin password error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only super admins can delete admins' });
    }

    if (adminId === req.admin.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Prevent deleting last super_admin
    if (admin.role === 'super_admin') {
      const superAdminCount = await prisma.adminUser.count({
        where: { role: 'super_admin' }
      });

      if (superAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last super admin' });
      }
    }

    // Soft delete - just disable
    await prisma.adminUser.update({
      where: { id: adminId },
      data: { isActive: false }
    });

    // Log deletion
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete_admin',
        entityType: 'admin',
        entityId: adminId,
        ipAddress: req.ip
      }
    });

    res.json({ message: 'Admin deleted' });
  } catch (error) {
    console.error('Delete admin error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Admin not found' });
    }
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
