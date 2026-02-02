const prisma = require('../lib/prisma');
const path = require('path');
const fs = require('fs');

// Note: The current Prisma schema does not have a dedicated KYC documents model.
// This controller provides basic KYC functionality using the User model's identityVerifiedAt field.
// TODO: Add a proper KYC documents model to the Prisma schema for full document management.

const getKycQueue = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    // Map status to query filter
    let where = {};
    if (status === 'pending') {
      where.identityVerifiedAt = null;
      where.isActive = true;
    } else if (status === 'verified') {
      where.identityVerifiedAt = { not: null };
    } else if (status === 'rejected') {
      // For rejected, we'll assume users with identity fields filled but not verified
      where.identityVerifiedAt = null;
      where.OR = [
        { firstName: { not: null } },
        { lastName: { not: null } }
      ];
    }

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        identityVerifiedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      documents: users.map(u => ({
        id: u.id,
        playerId: u.id,
        playerEmail: u.email,
        playerName: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        docType: 'identity', // Placeholder since there's no document model
        status: u.identityVerifiedAt ? 'verified' : 'pending',
        createdAt: u.createdAt,
        reviewedAt: u.identityVerifiedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get KYC queue error:', error);
    res.status(500).json({ error: 'Failed to load KYC queue' });
  }
};

const getPlayerKyc = async (req, res) => {
  try {
    const { playerId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        identityVerifiedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({
      player: {
        id: user.id,
        email: user.email,
        kycStatus: user.identityVerifiedAt ? 'verified' : 'pending'
      },
      documents: [
        {
          id: user.id,
          docType: 'identity',
          status: user.identityVerifiedAt ? 'verified' : 'pending',
          reviewedAt: user.identityVerifiedAt
        }
      ]
    });
  } catch (error) {
    console.error('Get player KYC error:', error);
    res.status(500).json({ error: 'Failed to load player KYC' });
  }
};

const reviewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { action, notes } = req.body;

    // In this simplified version, documentId is actually the playerId
    const playerId = documentId;

    const user = await prisma.user.findUnique({
      where: { id: playerId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (user.identityVerifiedAt) {
      return res.status(400).json({ error: 'Player already verified' });
    }

    const newStatus = action === 'approve' ? 'verified' : 'rejected';

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: playerId },
        data: {
          identityVerifiedAt: new Date()
        }
      });
    }

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin?.id || 'system',
        action: action === 'approve' ? 'verify_kyc' : 'reject_kyc',
        entityType: 'user',
        entityId: playerId,
        newValues: {
          status: newStatus,
          notes
        },
        reason: notes,
        ipAddress: req.ip
      }
    });

    res.json({
      message: `KYC ${newStatus}`,
      documentStatus: newStatus,
      playerKycStatus: newStatus
    });
  } catch (error) {
    console.error('Review document error:', error);
    res.status(500).json({ error: 'Failed to review KYC' });
  }
};

const requestAdditionalDocuments = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { message, requiredDocs } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: playerId },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Log the request
    await prisma.adminAuditLog.create({
      data: {
        adminId: req.admin?.id || 'system',
        action: 'request_kyc_documents',
        entityType: 'user',
        entityId: playerId,
        newValues: {
          requiredDocs,
          message
        },
        reason: `Additional documents requested: ${requiredDocs.join(', ')}. Message: ${message}`,
        ipAddress: req.ip
      }
    });

    // TODO: Send email notification to the player
    console.log(`Email would be sent to ${user.email} requesting: ${requiredDocs.join(', ')}`);

    res.json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Request documents error:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
};

const getKycStats = async (req, res) => {
  try {
    const verifiedPlayers = await prisma.user.count({
      where: { identityVerifiedAt: { not: null } }
    });

    const pendingPlayers = await prisma.user.count({
      where: {
        identityVerifiedAt: null,
        isActive: true
      }
    });

    const totalPlayers = await prisma.user.count();

    res.json({
      stats: {
        pending_documents: pendingPlayers,
        pending_players: pendingPlayers,
        verified_players: verifiedPlayers,
        rejected_players: 0, // Not tracked in current schema
        pending_status_players: pendingPlayers,
        under_review_players: 0 // Not tracked in current schema
      }
    });
  } catch (error) {
    console.error('Get KYC stats error:', error);
    res.status(500).json({ error: 'Failed to load KYC stats' });
  }
};

module.exports = {
  getKycQueue,
  getPlayerKyc,
  reviewDocument,
  requestAdditionalDocuments,
  getKycStats
};
