import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { createRequire } from 'module';
import { randomUUID } from 'crypto';
import { isIP } from 'net';
import { lookup } from 'dns/promises';
import { Knowledge } from '../models/knowledge.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import { embedText, chunkText, RAG_CHUNK_SIZE, RAG_CHUNK_OVERLAP } from '../services/voyage.js';
import { recordAudit } from '../services/audit.js';

// Chunk when content exceeds this (each chunk embedded separately for precise retrieval)
const CHUNK_THRESHOLD = RAG_CHUNK_SIZE;

/** Extract, chunk if needed, embed each piece, and save to Knowledge. Returns saved count and total content length. */
interface IndexMetadata {
  category?: string;
  sourceUrl?: string;
  originalFilename?: string;
}

async function indexContent(title: string, content: string, type: 'text' | 'pdf' | 'website', metadata: IndexMetadata = {}): Promise<{ documentId: string; count: number; totalLength: number }> {
  const trimmed = content.trim();
  if (!trimmed) return { documentId: '', count: 0, totalLength: 0 };

  const chunks = trimmed.length > CHUNK_THRESHOLD
    ? chunkText(trimmed, RAG_CHUNK_SIZE, RAG_CHUNK_OVERLAP)
    : [trimmed];

  const documentId = randomUUID();
  const records = [];
  for (let i = 0; i < chunks.length; i++) {
    records.push({
      title,
      content: chunks[i],
      type,
      documentId,
      category: metadata.category?.trim() || 'General',
      sourceUrl: metadata.sourceUrl,
      originalFilename: metadata.originalFilename,
      chunkIndex: i,
      chunkCount: chunks.length,
      contentLength: trimmed.length,
      embedding: await embedText(chunks[i], 'document'),
    });
  }
  await Knowledge.insertMany(records);
  return { documentId, count: records.length, totalLength: trimmed.length };
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

function isPrivateAddress(host: string): boolean {
  return /^10\./.test(host) || /^127\./.test(host) || /^169\.254\./.test(host) ||
    /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === '::1' || /^f[cd][0-9a-f]{2}:/i.test(host) || /^fe[89ab][0-9a-f]:/i.test(host);
}

async function assertSafePublicUrl(value: string): Promise<URL> {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported');
  const host = url.hostname.toLowerCase();
  const blockedName = host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local');
  const privateIp = Boolean(isIP(host)) && isPrivateAddress(host);
  if (blockedName || privateIp) throw new Error('Private or local network URLs are not allowed');
  const addresses = await lookup(host, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('URL resolves to a private or unavailable network address');
  }
  return url;
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
router.get('/knowledge/debug', requireAuth, requireStaff, async (req: Request, res: Response) => {
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
router.post('/knowledge', requireAuth, requireStaff, async (req: Request, res: Response) => {
  try {
    const { title, content, type, category } = req.body;
    const typeVal = (type === 'pdf' || type === 'website') ? type : 'text';

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    console.log('📝 Adding knowledge:', { title, contentLength: content.length, type: typeVal });

    const safeTitle = String(title || 'Untitled text').trim();
    const { documentId, count, totalLength } = await indexContent(safeTitle, content, typeVal, { category });
    if (count === 0) return res.status(400).json({ error: 'No content to index' });
    await recordAudit(req, {
      action: 'knowledge.created',
      resourceType: 'knowledge',
      resourceId: documentId,
      resourceLabel: safeTitle,
      details: { type: typeVal, chunks: count, contentLength: totalLength },
    });

    console.log('✅ Knowledge indexed:', count, 'chunk(s), total length:', totalLength);

    res.status(201).json({
      message: count > 1 ? `Knowledge indexed (${count} chunks)` : 'Knowledge indexed successfully',
      id: documentId,
      title: safeTitle,
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
router.post('/knowledge/url', requireAuth, requireStaff, async (req: Request, res: Response) => {
  try {
    const { url, title: customTitle, category } = req.body as { url?: string; title?: string; category?: string };
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL is required' });
    const normalizedUrl = (await assertSafePublicUrl(url.startsWith('http') ? url : `https://${url}`)).toString();
    const response = await axios.get(normalizedUrl, {
      timeout: 15000,
      maxContentLength: 5 * 1024 * 1024,
      maxRedirects: 3,
      responseType: 'text',
      headers: { 'User-Agent': 'EthioUni-Knowledge-Indexer/1.0', Accept: 'text/html,text/plain' },
      proxy: false,
    });
    const contentType = String(response.headers['content-type'] || '');
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(400).json({ error: 'URL must return an HTML or plain-text page' });
    }
    const html = typeof response.data === 'string' ? response.data : '';
    const content = stripHtml(html).trim();
    if (!content || content.length < 50) return res.status(400).json({ error: 'Could not extract enough text from URL' });
    const htmlTitle = html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, ' ').trim();
    const title = (customTitle && customTitle.trim()) || htmlTitle || new URL(normalizedUrl).hostname || 'Website';
    const { documentId, count, totalLength } = await indexContent(title, content, 'website', { category, sourceUrl: normalizedUrl });
    if (count === 0) return res.status(400).json({ error: 'No content to index' });
    await recordAudit(req, {
      action: 'knowledge.url_indexed',
      resourceType: 'knowledge',
      resourceId: documentId,
      resourceLabel: title,
      details: { url: normalizedUrl, chunks: count, contentLength: totalLength },
    });
    res.status(201).json({
      message: count > 1 ? `Website indexed (${count} chunks)` : 'Website indexed successfully',
      title,
      id: documentId,
      chunks: count,
      contentLength: totalLength
    });
  } catch (err: any) {
    if (err.response?.status === 404) return res.status(404).json({ error: 'URL not found' });
    if (err.code === 'ENOTFOUND') return res.status(400).json({ error: 'Invalid or unreachable URL' });
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

router.post('/knowledge/pdf', requireAuth, requireStaff, multerSingleFile, async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file?.buffer) return res.status(400).json({ error: 'No PDF file uploaded' });
    if (file.mimetype !== 'application/pdf' && !String(file.originalname).toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ error: 'Only PDF files are supported' });
    }
    const title = (req.body?.title as string) || file.originalname || 'Uploaded PDF';
    const category = req.body?.category as string | undefined;

    let content: string;
    try {
      content = await extractTextFromPdf(file.buffer);
    } catch (parseErr: any) {
      console.error('❌ PDF extract error:', parseErr);
      return res.status(500).json({ error: parseErr?.message || 'Failed to extract text from PDF' });
    }

    if (!content) return res.status(400).json({ error: 'Could not extract text from PDF' });

    const { documentId, count, totalLength } = await indexContent(title, content, 'pdf', { category, originalFilename: file.originalname });
    if (count === 0) return res.status(400).json({ error: 'No content to index' });
    await recordAudit(req, {
      action: 'knowledge.pdf_indexed',
      resourceType: 'knowledge',
      resourceId: documentId,
      resourceLabel: title,
      details: { filename: file.originalname, chunks: count, contentLength: totalLength },
    });

    res.status(201).json({
      message: count > 1 ? `PDF indexed (${count} chunks)` : 'PDF indexed successfully',
      title,
      id: documentId,
      chunks: count,
      contentLength: totalLength
    });
  } catch (err: any) {
    console.error('❌ Error adding PDF knowledge:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/knowledge - list indexed knowledge docs (admin only)
router.get('/knowledge', requireAuth, requireStaff, async (req: Request, res: Response) => {
  try {
    const docs = await Knowledge.find().select('-embedding').sort({ uploadedAt: -1, chunkIndex: 1 }).lean();
    const groups = new Map<string, any>();
    for (const doc of docs) {
      const id = doc.documentId || String(doc._id);
      if (!groups.has(id)) {
        groups.set(id, {
          id,
          title: doc.title.replace(/ \(part \d+\/\d+\)$/, ''),
          type: doc.type,
          category: doc.category || 'General',
          sourceUrl: doc.sourceUrl,
          originalFilename: doc.originalFilename,
          uploadedAt: doc.uploadedAt,
          chunks: 0,
          contentLength: doc.contentLength || 0,
          content: '',
        });
      }
      const group = groups.get(id);
      group.chunks += 1;
      group.content += `${group.content ? '\n\n' : ''}${doc.content}`;
      if (!group.contentLength) group.contentLength += doc.content?.length || 0;
    }
    res.json([...groups.values()]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/knowledge/:documentId', requireAuth, requireStaff, async (req: Request, res: Response) => {
  try {
    let docs = await Knowledge.find({ documentId: req.params.documentId }).select('-embedding').sort({ chunkIndex: 1 }).lean();
    if (!docs.length) {
      const legacy = await Knowledge.findById(req.params.documentId).select('-embedding').lean();
      if (legacy) docs = [legacy];
    }
    if (!docs.length) return res.status(404).json({ error: 'Knowledge document not found' });
    const first = docs[0];
    res.json({
      id: first.documentId || String(first._id),
      title: first.title.replace(/ \(part \d+\/\d+\)$/, ''),
      type: first.type,
      category: first.category || 'General',
      sourceUrl: first.sourceUrl,
      originalFilename: first.originalFilename,
      uploadedAt: first.uploadedAt,
      chunks: docs.length,
      contentLength: first.contentLength || docs.reduce((sum, item) => sum + (item.content?.length || 0), 0),
      content: docs.map(item => item.content).join('\n\n'),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/knowledge/:documentId', requireAuth, requireStaff, async (req: Request, res: Response) => {
  try {
    const title = String(req.body.title || '').trim();
    const category = String(req.body.category || '').trim();
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required' });
    let result = await Knowledge.updateMany({ documentId: req.params.documentId }, { $set: { title, category } });
    if (!result.matchedCount) {
      const legacy = await Knowledge.findByIdAndUpdate(req.params.documentId, { title, category });
      if (!legacy) return res.status(404).json({ error: 'Knowledge document not found' });
      result = { ...result, matchedCount: 1 } as any;
    }
    await recordAudit(req, {
      action: 'knowledge.updated',
      resourceType: 'knowledge',
      resourceId: req.params.documentId,
      resourceLabel: title,
      details: { category },
    });
    res.json({ message: 'Knowledge metadata updated', updatedChunks: result.matchedCount });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/knowledge/:id - remove a knowledge doc (admin only)
router.delete('/knowledge/:id', requireAuth, requireStaff, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const first = await Knowledge.findOne({ documentId: id }).lean() || await Knowledge.findById(id).lean();
    if (!first) return res.status(404).json({ error: 'Knowledge document not found' });
    const result = first.documentId
      ? await Knowledge.deleteMany({ documentId: first.documentId })
      : await Knowledge.deleteOne({ _id: first._id });
    await recordAudit(req, {
      action: 'knowledge.deleted',
      resourceType: 'knowledge',
      resourceId: first.documentId || String(first._id),
      resourceLabel: first.title,
      details: { deletedChunks: result.deletedCount },
    });
    res.json({ message: 'Knowledge document deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
