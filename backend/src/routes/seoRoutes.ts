import { Router } from 'express';
import type { Request, Response } from 'express';
import { University } from '../models/university.js';

const router = Router();

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://ethiouni.portal.et').replace(/\/+$/, '');

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc: string, changefreq: string, priority: string, lastmod?: Date): string {
  const lastmodTag = lastmod ? `<lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>` : '';
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/** GET /sitemap.xml — dynamic sitemap for search engines */
router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const staticPages = [
      { path: '/', changefreq: 'daily', priority: '1.0' },
      { path: '/universities', changefreq: 'daily', priority: '0.9' },
      { path: '/login', changefreq: 'monthly', priority: '0.3' },
      { path: '/register', changefreq: 'monthly', priority: '0.4' },
    ];

    const universities = await University.find({}, 'slug updatedAt').lean();
    const today = new Date();

    const entries = [
      ...staticPages.map((page) => urlEntry(`${SITE_URL}${page.path}`, page.changefreq, page.priority, today)),
      ...universities.map((uni) =>
        urlEntry(
          `${SITE_URL}/university/${uni.slug}`,
          'weekly',
          '0.8',
          uni.updatedAt ? new Date(uni.updatedAt) : today
        )
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate sitemap' });
  }
});

export default router;
