import { Router } from 'express';
import type { Request, Response } from 'express';
import { University } from '../models/university.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';

const router = Router();

function serializeUniversity(doc: any) {
  return {
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    website: doc.website,
    location: doc.location,
    established: doc.established,
    type: doc.type,
    contactEmail: doc.contactEmail,
    phone: doc.phone,
    faculties: doc.faculties || [],
    campuses: doc.campuses || [],
    colleges: doc.colleges || [],
    facilities: doc.facilities || [],
    coordinates: doc.coordinates,
    image: doc.image,
  };
}

// GET /api/universities
router.get('/universities', async (_req: Request, res: Response) => {
  try {
    const docs = await University.find().sort({ name: 1 }).lean();
    res.json(docs.map(serializeUniversity));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/universities/:slug
router.get('/universities/:slug', async (req: Request, res: Response) => {
  try {
    const doc = await University.findOne({ slug: req.params.slug }).lean();
    if (!doc) return res.status(404).json({ error: 'University not found' });
    res.json(serializeUniversity(doc));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/universities
router.post('/admin/universities', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload?.name || !payload?.slug || !payload?.description || !payload?.website) {
      return res.status(400).json({ error: 'name, slug, description, and website are required' });
    }

    const existing = await University.findOne({ slug: payload.slug });
    if (existing) {
      return res.status(409).json({ error: 'University with this slug already exists' });
    }

    const created = await new University(payload).save();
    res.status(201).json({ message: 'University created', university: serializeUniversity(created.toObject()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/universities/:id
router.put('/admin/universities/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const updated = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'University not found' });
    res.json({ message: 'University updated', university: serializeUniversity(updated.toObject()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/universities/:id
router.delete('/admin/universities/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const deleted = await University.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'University not found' });
    res.json({ message: 'University deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
