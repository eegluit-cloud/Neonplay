const prisma = require('../lib/prisma');

const getSegments = async (req, res) => {
  try {
    const { page = 1, limit = 50, active } = req.query;

    const where = {};
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;

    const total = await prisma.segment.count({ where });
    const segments = await prisma.segment.findMany({
      where,
      include: {
        _count: { select: { promotions: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      segments: segments.map(s => ({
        id: s.id,
        name: s.name,
        comment: s.comment,
        conditions: s.conditions,
        isActive: s.isActive,
        bonusCount: s._count.promotions,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get segments error:', error);
    res.status(500).json({ error: 'Failed to load segments' });
  }
};

const getSegment = async (req, res) => {
  try {
    const { segmentId } = req.params;

    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
      include: {
        promotions: {
          select: { id: true, name: true, type: true, isActive: true }
        }
      }
    });

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json({
      segment: {
        id: segment.id,
        name: segment.name,
        comment: segment.comment,
        conditions: segment.conditions,
        isActive: segment.isActive,
        promotions: segment.promotions,
        createdAt: segment.createdAt,
        updatedAt: segment.updatedAt,
      }
    });
  } catch (error) {
    console.error('Get segment error:', error);
    res.status(500).json({ error: 'Failed to load segment' });
  }
};

const createSegment = async (req, res) => {
  try {
    const { name, comment, conditions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Segment name is required' });
    }
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ error: 'At least one condition is required' });
    }

    const segment = await prisma.segment.create({
      data: {
        name: name.trim(),
        comment: comment || null,
        conditions,
        isActive: true,
      }
    });

    res.status(201).json({ message: 'Segment created', segmentId: segment.id });
  } catch (error) {
    console.error('Create segment error:', error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
};

const updateSegment = async (req, res) => {
  try {
    const { segmentId } = req.params;
    const { name, comment, conditions, isActive } = req.body;

    const existing = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!existing) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (comment !== undefined) data.comment = comment || null;
    if (conditions !== undefined) {
      if (!Array.isArray(conditions) || conditions.length === 0) {
        return res.status(400).json({ error: 'At least one condition is required' });
      }
      data.conditions = conditions;
    }
    if (isActive !== undefined) data.isActive = isActive;

    await prisma.segment.update({ where: { id: segmentId }, data });

    res.json({ message: 'Segment updated' });
  } catch (error) {
    console.error('Update segment error:', error);
    res.status(500).json({ error: 'Failed to update segment' });
  }
};

const deleteSegment = async (req, res) => {
  try {
    const { segmentId } = req.params;

    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
      include: { _count: { select: { promotions: true } } }
    });

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    if (segment._count.promotions > 0) {
      return res.status(400).json({
        error: `Cannot delete segment linked to ${segment._count.promotions} bonus(es). Unlink bonuses first.`
      });
    }

    await prisma.segment.delete({ where: { id: segmentId } });

    res.json({ message: 'Segment deleted' });
  } catch (error) {
    console.error('Delete segment error:', error);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
};

module.exports = { getSegments, getSegment, createSegment, updateSegment, deleteSegment };
