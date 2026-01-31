const { getDb } = require('../database/init');
const path = require('path');
const fs = require('fs');

const getKycQueue = async (req, res) => {
  try {
    const db = getDb();
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    let query = `
      SELECT kd.*, p.email as player_email, p.first_name, p.last_name, a.email as reviewer_email
      FROM kyc_documents kd
      JOIN players p ON kd.player_id = p.id
      LEFT JOIN admins a ON kd.reviewed_by = a.id
      WHERE kd.status = ?
    `;
    const params = [status];

    const countQuery = query.replace(/SELECT kd\.\*, p\.email.*/, 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' ORDER BY kd.created_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const documents = db.prepare(query).all(...params);

    res.json({
      documents: documents.map(d => ({
        id: d.id,
        playerId: d.player_id,
        playerEmail: d.player_email,
        playerName: `${d.first_name || ''} ${d.last_name || ''}`.trim(),
        docType: d.doc_type,
        filePath: d.file_path,
        originalName: d.original_name,
        status: d.status,
        adminNotes: d.admin_notes,
        reviewerEmail: d.reviewer_email,
        createdAt: d.created_at,
        reviewedAt: d.reviewed_at
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
    const db = getDb();

    const player = db.prepare('SELECT id, email, kyc_status FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const documents = db.prepare(`
      SELECT kd.*, a.email as reviewer_email
      FROM kyc_documents kd
      LEFT JOIN admins a ON kd.reviewed_by = a.id
      WHERE kd.player_id = ?
      ORDER BY kd.created_at DESC
    `).all(playerId);

    res.json({
      player: {
        id: player.id,
        email: player.email,
        kycStatus: player.kyc_status
      },
      documents: documents.map(d => ({
        id: d.id,
        docType: d.doc_type,
        filePath: d.file_path,
        originalName: d.original_name,
        status: d.status,
        adminNotes: d.admin_notes,
        reviewerEmail: d.reviewer_email,
        createdAt: d.created_at,
        reviewedAt: d.reviewed_at
      }))
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
    const db = getDb();

    const document = db.prepare('SELECT * FROM kyc_documents WHERE id = ?').get(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.status !== 'pending') {
      return res.status(400).json({ error: 'Document already reviewed' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    db.prepare(`
      UPDATE kyc_documents
      SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, notes, req.admin.id, documentId);

    // Check if all required documents are approved
    const allDocuments = db.prepare(`
      SELECT doc_type, status FROM kyc_documents
      WHERE player_id = ?
      AND id IN (
        SELECT MAX(id) FROM kyc_documents WHERE player_id = ? GROUP BY doc_type
      )
    `).all(document.player_id, document.player_id);

    const requiredTypes = ['id_front', 'id_back', 'proof_of_address', 'selfie'];
    const approvedTypes = allDocuments.filter(d => d.status === 'approved').map(d => d.doc_type);
    const rejectedTypes = allDocuments.filter(d => d.status === 'rejected').map(d => d.doc_type);

    let newKycStatus;
    if (requiredTypes.every(t => approvedTypes.includes(t))) {
      newKycStatus = 'verified';
    } else if (rejectedTypes.length > 0) {
      newKycStatus = 'rejected';
    } else {
      newKycStatus = 'under_review';
    }

    db.prepare('UPDATE players SET kyc_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newKycStatus, document.player_id);

    res.json({
      message: `Document ${newStatus}`,
      documentStatus: newStatus,
      playerKycStatus: newKycStatus
    });
  } catch (error) {
    console.error('Review document error:', error);
    res.status(500).json({ error: 'Failed to review document' });
  }
};

const requestAdditionalDocuments = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { message, requiredDocs } = req.body;
    const db = getDb();

    const player = db.prepare('SELECT id, email FROM players WHERE id = ?').get(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Update player KYC status
    db.prepare('UPDATE players SET kyc_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('rejected', playerId);

    // Add note
    db.prepare('INSERT INTO player_notes (player_id, admin_id, note) VALUES (?, ?, ?)')
      .run(playerId, req.admin.id, `Additional documents requested: ${requiredDocs.join(', ')}. Message: ${message}`);

    // In a real system, this would send an email to the player
    console.log(`Email would be sent to ${player.email} requesting: ${requiredDocs.join(', ')}`);

    res.json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Request documents error:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
};

const getKycStats = async (req, res) => {
  try {
    const db = getDb();

    const stats = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM kyc_documents WHERE status = 'pending') as pending_documents,
        (SELECT COUNT(DISTINCT player_id) FROM kyc_documents WHERE status = 'pending') as pending_players,
        (SELECT COUNT(*) FROM players WHERE kyc_status = 'verified') as verified_players,
        (SELECT COUNT(*) FROM players WHERE kyc_status = 'rejected') as rejected_players,
        (SELECT COUNT(*) FROM players WHERE kyc_status = 'pending') as pending_status_players,
        (SELECT COUNT(*) FROM players WHERE kyc_status = 'under_review') as under_review_players
    `).get();

    res.json({ stats });
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
