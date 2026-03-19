const prisma = require('../lib/prisma');
const { invalidateBannerCache } = require('../lib/redis');

const listBanners = async (req, res) => {
  try {
    const banners = await prisma.heroBanner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ banners });
  } catch (error) {
    console.error('List banners error:', error);
    res.status(500).json({ error: 'Failed to load banners' });
  }
};

const getBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const banner = await prisma.heroBanner.findUnique({ where: { id: bannerId } });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ banner });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({ error: 'Failed to load banner' });
  }
};

const createBanner = async (req, res) => {
  try {
    const {
      title, subtitle, ctaText, ctaLink,
      imageUrl, videoUrl, backgroundGradient,
      targetAudience, platform, displayPage, sortOrder,
      startsAt, endsAt, isActive,
    } = req.body;

    const banner = await prisma.heroBanner.create({
      data: {
        title,
        subtitle: subtitle || null,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        backgroundGradient: backgroundGradient || null,
        targetAudience: targetAudience || 'all',
        platform: platform || 'all',
        displayPage: displayPage || 'lobby',
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : 0,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    await invalidateBannerCache();
    res.status(201).json({ message: 'Banner created', bannerId: banner.id });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ error: 'Failed to create banner' });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const existing = await prisma.heroBanner.findUnique({ where: { id: bannerId } });
    if (!existing) return res.status(404).json({ error: 'Banner not found' });

    const {
      title, subtitle, ctaText, ctaLink,
      imageUrl, videoUrl, backgroundGradient,
      targetAudience, platform, displayPage, sortOrder,
      startsAt, endsAt, isActive,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (subtitle !== undefined) data.subtitle = subtitle || null;
    if (ctaText !== undefined) data.ctaText = ctaText || null;
    if (ctaLink !== undefined) data.ctaLink = ctaLink || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (videoUrl !== undefined) data.videoUrl = videoUrl || null;
    if (backgroundGradient !== undefined) data.backgroundGradient = backgroundGradient || null;
    if (targetAudience !== undefined) data.targetAudience = targetAudience;
    if (platform !== undefined) data.platform = platform;
    if (displayPage !== undefined) data.displayPage = displayPage;
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder);
    if (startsAt !== undefined) data.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) data.endsAt = endsAt ? new Date(endsAt) : null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    await prisma.heroBanner.update({ where: { id: bannerId }, data });
    await invalidateBannerCache();
    res.json({ message: 'Banner updated' });
  } catch (error) {
    console.error('Update banner error:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Banner not found' });
    res.status(500).json({ error: 'Failed to update banner' });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
    const existing = await prisma.heroBanner.findUnique({ where: { id: bannerId } });
    if (!existing) return res.status(404).json({ error: 'Banner not found' });
    await prisma.heroBanner.delete({ where: { id: bannerId } });
    await invalidateBannerCache();
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error('Delete banner error:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Banner not found' });
    res.status(500).json({ error: 'Failed to delete banner' });
  }
};

// Bulk reorder: [{ id, sortOrder }]
const reorderBanners = async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

    await prisma.$transaction(
      order.map(({ id, sortOrder }) =>
        prisma.heroBanner.update({ where: { id }, data: { sortOrder: parseInt(sortOrder) } })
      )
    );

    await invalidateBannerCache();
    res.json({ message: 'Order updated' });
  } catch (error) {
    console.error('Reorder banners error:', error);
    res.status(500).json({ error: 'Failed to reorder banners' });
  }
};

module.exports = { listBanners, getBanner, createBanner, updateBanner, deleteBanner, reorderBanners };
