import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { University } from '../models/university.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import { uploadBufferToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../services/cloudinary.ts';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed!'));
        }
    },
});

function serializeUniversity(doc: any) {
    return {
        id: String(doc._id),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        website: doc.website,
        location: doc.location || { city: '', region: '' },
        established: doc.established,
        type: doc.type,
        contactEmail: doc.contactEmail,
        phone: doc.phone,
        faculties: doc.faculties || [],
        campuses: doc.campuses || [],
        colleges: doc.colleges || [],
        facilities: doc.facilities || [],
        coordinates: doc.coordinates || doc.location?.coordinates || { lat: 9.03, lng: 38.74 },
        image: doc.image || '',
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
        if (!payload?.name || !payload?.description || !payload?.website) {
            return res.status(400).json({ error: 'name, description, and website are required' });
        }

        const slug = payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existing = await University.findOne({ slug });
        if (existing) {
            return res.status(409).json({ error: 'University with this slug already exists' });
        }

        payload.slug = slug;
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

// POST /api/admin/universities/:id/image
router.post('/admin/universities/:id/image', requireAuth, requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const university = await University.findById(req.params.id);
        if (!university) {
            return res.status(404).json({ error: 'University not found' });
        }

        // If replacing an existing Cloudinary image, clean it up
        if (university.image) {
            const oldPublicId = extractPublicIdFromUrl(university.image);
            if (oldPublicId) {
                await deleteFromCloudinary(oldPublicId);
            }
        }

        const customPublicId = `${university.slug}-${Date.now()}`;
        const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
            publicId: customPublicId,
            folder: 'ethiouni-universities',
        });

        university.image = uploaded.secure_url;
        await university.save();

        res.json({
            message: 'Image uploaded successfully to Cloudinary',
            image: uploaded.secure_url,
            university: serializeUniversity(university.toObject()),
        });
    } catch (err: any) {
        console.error('⚠️ Image upload error:', err);
        const errMsg = err?.message || 'Failed to upload image to Cloudinary';
        res.status(400).json({ error: errMsg });
    }
});

// DELETE /api/admin/universities/:id
router.delete('/admin/universities/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const university = await University.findById(req.params.id);
        if (!university) return res.status(404).json({ error: 'University not found' });

        if (university.image) {
            const publicId = extractPublicIdFromUrl(university.image);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        }

        await University.findByIdAndDelete(req.params.id);
        res.json({ message: 'University deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

