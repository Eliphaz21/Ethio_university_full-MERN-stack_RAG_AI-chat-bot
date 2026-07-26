import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { createRequire } from 'module';
import { Knowledge } from '../models/knowledge.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import { embedText, chunkText, RAG_CHUNK_SIZE, RAG_CHUNK_OVERLAP } from '../services/voyage.ts';

// Chunk when content exceeds this (each chunk embedded separately for precise retrieval)
const CHUNK_THRESHOLD = RAG_CHUNK_SIZE;

/** Extract, chunk if needed, embed each piece, and save to Knowledge. Returns saved count and total content length. */
async function indexContent(title: string, content: string, type: 'text' | 'pdf' | 'website'): Promise<{ count: number; totalLength: number }> {
  const trimmed = content.trim();
  if (!trimmed) return { count: 0, totalLength: 0 };

  const chunks = trimmed.length > CHUNK_THRESHOLD
    ? chunkText(trimmed, RAG_CHUNK_SIZE, RAG_CHUNK_OVERLAP)
    : [trimmed];

  let saved = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkTitle = chunks.length > 1 ? `${title} (part ${i + 1}/${chunks.length})` : title;
    const embedding = await embedText(chunk, 'document');
    await new Knowledge({ title: chunkTitle, content: chunk, type, embedding }).save();
    saved++;
  }
  return { count: saved, totalLength: trimmed.length };
}

const requireMod = createRequire(import.meta.url);
const router = Router();

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Multer for PDF upload (field name must be "file"). Load synchronously so upload always runs.
let multerUpload: any = null;
function getMulterUpload() {
  if (!multerUpload) {
    const multer = requireMod('multer');
    multerUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }).single('file');
  }
  return multerUpload;
}
function multerSingleFile(req: Request, res: Response, next: NextFunction) {
  getMulterUpload()(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err?.message || 'File upload failed' });
    next();
  });
}

// GET /api/admin/knowledge/debug - debug endpoint to see what's in DB
router.get('/knowledge/debug', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const allDocs = await Knowledge.find().lean();
    const debugInfo = {
      totalDocuments: allDocs.length,
      documents: allDocs.map(doc => ({
        id: doc._id,
        title: doc.title,
        contentLength: doc.content?.length || 0,
        type: doc.type,
        embeddingLength: doc.embedding?.length || 0,
        uploadedAt: doc.uploadedAt
      }))
    };
    res.json(debugInfo);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/knowledge — text; large content is chunked and each chunk embedded separately
router.post('/knowledge', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, content, type } = req.body;
    const typeVal = (type === 'pdf' || type === 'website') ? type : 'text';

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    console.log('📝 Adding knowledge:', { title, contentLength: content.length, type: typeVal });

    const { count, totalLength } = await indexContent(title, content, typeVal);
    if (count === 0) return res.status(400).json({ error: 'No content to index' });

    console.log('✅ Knowledge indexed:', count, 'chunk(s), total length:', totalLength);

    res.status(201).json({
      message: count > 1 ? `Knowledge indexed (${count} chunks)` : 'Knowledge indexed successfully',
      chunks: count,
      contentLength: totalLength,
      note: totalLength > CHUNK_THRESHOLD ? `Content split into ${count} chunks for better retrieval` : 'Full content embedded'
    });
  } catch (err: any) {
    console.error('❌ Error adding knowledge:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/knowledge/url - fetch website, extract text, index (admin only)
router.post('/knowledge/url', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { url, title: customTitle } = req.body as { url?: string; title?: string };
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL is required' });

    // SSRF / input-hardening: validate URL, parse BEFORE fetching.
    // Only http/https allowed; block private/loopback/link-local IPs; max 2048 chars.
    let parsed: URL;
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url.trim()}`;
      if (normalizedUrl.length > 2048) throw new Error('URL too long');
      parsed = new URL(normalizedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Only http/https URLs are allowed');
      }
      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host.endsWith('.localhost')) {
        throw new Error('Localhost URLs are not allowed');
      }
      if (host === '0' || host === '127.0.0.1' || host.endsWith('.local') || host.endsWith('.internal')) {
        throw new Error('Private/local hosts are not allowed');
      }
      // Block private IPv4 ranges
      const IPv4PrivateRe = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/;
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && IPv4PrivateRe.test(host)) {
        throw new Error('Private IPv4 addresses are not allowed');
      }
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || 'Invalid URL' });
    }

    const https = await import('https');
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const response = await axios.get(parsed.toString(), {
      timeout: 15000,
      maxContentLength: 5 * 1024 * 1024,
      responseType: 'text',
      headers: { 'User-Agent': 'EthioUni-Bot/1.0' },
      httpsAgent,
      proxy: false,
    });
    const html = typeof response.data === 'string' ? response.data : '';
    const content = stripHtml(html).trim();
    if (!content || content.length < 50) return res.status(400).json({ error: 'Could not extract enough text from URL' });
    const safeTitle = (customTitle && customTitle.trim().slice(0, 200)) || parsed.hostname || 'Website';
    const { count, totalLength } = await indexContent(safeTitle, content, 'website');
    if (count === 0) return res.status(400).json({ error: 'No content to index' });
    res.status(201).json({
      message: count > 1 ? `Website indexed (${count} chunks)` : 'Website indexed successfully',
      title: safeTitle,
      chunks: count,
      contentLength: totalLength
    });
  } catch (err: any) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'URL not found' });
    if (err.code === 'ENOTFOUND') return res.status(400).json({ error: 'Invalid or unreachable URL' });
    if (err.code === 'ERR_INVALID_URL') return res.status(400).json({ error: 'Invalid URL' });
    console.error('❌ Error adding URL knowledge:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch or index URL' });
  }
});

// Extract text from PDF buffer. Works with pdf-parse v1 (function) or v2 (PDFParse class).
// Uses createRequire so CJS/ESM interop is reliable in Node.
function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = requireMod('pdf-parse');
  const PDFParseClass = pdfParse.PDFParse ?? pdfParse.default?.PDFParse ?? pdfParse.default;
  if (PDFParseClass && typeof PDFParseClass === 'function') {
    const parser = new PDFParseClass({ data: buffer });
    return parser.getText().then((result: any) => {
      const text = (result?.text ?? '').trim();
      return typeof parser.destroy === 'function' ? parser.destroy().then(() => text) : text;
    }).catch((e: Error) => {
      if (typeof parser.destroy === 'function') return parser.destroy().then(() => { throw e; });
      throw e;
    });
  }
  if (typeof pdfParse === 'function') {
    return pdfParse(buffer).then((data: any) => (data?.text ?? '').trim());
  }
  if (typeof pdfParse.default === 'function') {
    return pdfParse.default(buffer).then((data: any) => (data?.text ?? '').trim());
  }
  return Promise.reject(new Error('PDF parser not available'));
}

router.post('/knowledge/pdf', requireAuth, requireAdmin, multerSingleFile, async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file?.buffer) return res.status(400).json({ error: 'No PDF file uploaded' });
    if (!file.mimetype || !/pdf/i.test(file.mimetype)) {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    // 20 MB cap
    if (file.size > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'PDF file too large (max 20MB)' });
    }
    const rawTitle = (req.body?.title as string)?.trim() || file.originalname?.trim() || 'Uploaded PDF';
    const title = rawTitle.slice(0, 200);

    let content: string;
    try {
      content = await extractTextFromPdf(file.buffer);
    } catch (parseErr: any) {
      console.error('❌ PDF extract error:', parseErr);
      return res.status(500).json({ error: parseErr?.message || 'Failed to extract text from PDF' });
    }

    if (!content) return res.status(400).json({ error: 'Could not extract text from PDF' });
    if (content.length > 1_000_000) {
      return res.status(400).json({ error: 'Extracted PDF text is too large (> 1M chars). Split the PDF first.' });
    }

    const { count, totalLength } = await indexContent(title, content, 'pdf');
    if (count === 0) return res.status(400).json({ error: 'No content to index' });

    res.status(201).json({
      message: count > 1 ? `PDF indexed (${count} chunks)` : 'PDF indexed successfully',
      title,
      chunks: count,
      contentLength: totalLength
    });
  } catch (err: any) {
    console.error('❌ Error adding PDF knowledge:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/knowledge - list indexed knowledge docs (admin only)
router.get('/knowledge', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const docs = await Knowledge.find().select('title content type uploadedAt').sort({ uploadedAt: -1 }).lean();
    const mapped = docs.map(d => ({ id: String(d._id), title: d.title, content: d.content, type: d.type, uploadedAt: d.uploadedAt }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/knowledge/:id - remove a knowledge doc (admin only)
router.delete('/knowledge/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Knowledge.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Knowledge document not found' });
    res.json({ message: 'Knowledge document deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;