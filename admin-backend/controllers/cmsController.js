const prisma = require('../lib/prisma');

const listPages = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const where = {};
    if (status === 'published') where.isPublished = true;
    if (status === 'draft') where.isPublished = false;

    const [total, pages] = await Promise.all([
      prisma.staticPage.count({ where }),
      prisma.staticPage.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          isPublished: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
    ]);

    res.json({
      pages: pages.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        status: p.isPublished ? 'published' : 'draft',
        publishedAt: p.publishedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('CMS list pages error:', error);
    res.status(500).json({ error: 'Failed to load pages' });
  }
};

const getPage = async (req, res) => {
  try {
    const { pageId } = req.params;

    const page = await prisma.staticPage.findUnique({ where: { id: pageId } });

    if (!page) return res.status(404).json({ error: 'Page not found' });

    res.json({
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        content: page.content,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        status: page.isPublished ? 'published' : 'draft',
        publishedAt: page.publishedAt,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
    });
  } catch (error) {
    console.error('CMS get page error:', error);
    res.status(500).json({ error: 'Failed to load page' });
  }
};

const createPage = async (req, res) => {
  try {
    const { slug, title, content, metaTitle, metaDescription, status } = req.body;

    const isPublished = status === 'published';
    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-');

    const page = await prisma.staticPage.create({
      data: {
        slug: cleanSlug,
        title,
        content: content || '',
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    res.status(201).json({ message: 'Page created', pageId: page.id });
  } catch (error) {
    console.error('CMS create page error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create page' });
  }
};

const updatePage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { slug, title, content, metaTitle, metaDescription, status } = req.body;

    const existing = await prisma.staticPage.findUnique({ where: { id: pageId } });
    if (!existing) return res.status(404).json({ error: 'Page not found' });

    const data = {};
    if (slug !== undefined) data.slug = slug.toLowerCase().trim().replace(/\s+/g, '-');
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (metaTitle !== undefined) data.metaTitle = metaTitle || null;
    if (metaDescription !== undefined) data.metaDescription = metaDescription || null;
    if (status !== undefined) {
      const isPublished = status === 'published';
      data.isPublished = isPublished;
      if (isPublished && !existing.publishedAt) {
        data.publishedAt = new Date();
      } else if (!isPublished) {
        data.publishedAt = null;
      }
    }

    await prisma.staticPage.update({ where: { id: pageId }, data });

    res.json({ message: 'Page updated' });
  } catch (error) {
    console.error('CMS update page error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(500).json({ error: 'Failed to update page' });
  }
};

const deletePage = async (req, res) => {
  try {
    const { pageId } = req.params;

    const existing = await prisma.staticPage.findUnique({ where: { id: pageId } });
    if (!existing) return res.status(404).json({ error: 'Page not found' });

    await prisma.staticPage.delete({ where: { id: pageId } });

    res.json({ message: 'Page deleted' });
  } catch (error) {
    console.error('CMS delete page error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Page not found' });
    }
    res.status(500).json({ error: 'Failed to delete page' });
  }
};

// Public endpoint - no auth required
const getPublicPage = async (req, res) => {
  try {
    const { slug } = req.params;

    const page = await prisma.staticPage.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        isPublished: true,
        publishedAt: true,
      },
    });

    if (!page || !page.isPublished) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json({
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      publishedAt: page.publishedAt,
    });
  } catch (error) {
    console.error('CMS get public page error:', error);
    res.status(500).json({ error: 'Failed to load page' });
  }
};

module.exports = {
  listPages,
  getPage,
  createPage,
  updatePage,
  deletePage,
  getPublicPage,
};
