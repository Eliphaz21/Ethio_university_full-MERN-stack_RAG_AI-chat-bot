import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import { University } from '../models/university.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadBufferToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from '../services/cloudinary.js';
import { recordAudit } from '../services/audit.js';

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
        contactPhone: doc.phone,
        address: doc.address,
        admissionsEmail: doc.admissionsEmail,
        admissionsPhone: doc.admissionsPhone,
        studentPortal: doc.studentPortal,
        applicationUrl: doc.applicationUrl,
        mapUrl: doc.mapUrl,
        academicOverview: doc.academicOverview,
        mission: doc.mission,
        vision: doc.vision,
        accreditation: doc.accreditation,
        admissionOverview: doc.admissionOverview,
        tuitionOverview: doc.tuitionOverview,
        admissionRequirements: doc.admissionRequirements || [],
        scholarships: doc.scholarships || [],
        applicationDeadlines: doc.applicationDeadlines || [],
        studyModes: doc.studyModes || [],
        studentPopulation: doc.studentPopulation,
        facultyCount: doc.facultyCount,
        faculties: doc.faculties || [],
        campuses: doc.campuses || [],
        colleges: doc.colleges || [],
        galleryImages: doc.galleryImages || [],
        videos: doc.videos || [],
        importantLinks: doc.importantLinks || [],
        facilities: doc.facilities || [],
        coordinates: doc.coordinates || doc.location?.coordinates || { lat: 9.03, lng: 38.74 },
        image: doc.image || '',
    };
}

const writableFields = [
    'name', 'slug', 'description', 'academicOverview', 'website', 'studentPortal',
    'applicationUrl', 'mapUrl', 'address', 'location', 'coordinates', 'established',
    'type', 'contactEmail', 'phone', 'admissionsEmail', 'admissionsPhone', 'mission',
    'vision', 'accreditation', 'admissionOverview', 'tuitionOverview',
    'admissionRequirements', 'scholarships', 'applicationDeadlines', 'studyModes',
    'studentPopulation', 'facultyCount', 'faculties',
    'campuses', 'facilities', 'colleges', 'galleryImages', 'videos', 'importantLinks', 'image',
] as const;

function universityPayload(body: Record<string, unknown>) {
    const payload: Record<string, unknown> = {};
    for (const field of writableFields) {
        if (body[field] !== undefined) payload[field] = body[field];
    }
    if (!payload.phone && body.contactPhone) payload.phone = body.contactPhone;
    if (typeof payload.slug === 'string') {
        payload.slug = payload.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    return payload;
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

// GET /api/admin/universities/:id
router.get('/admin/universities/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const doc = await University.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ error: 'University not found' });
        res.json(serializeUniversity(doc));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/universities
router.post('/admin/universities', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const payload = universityPayload(req.body || {});
        if (!payload?.name || !payload?.description || !payload?.website) {
            return res.status(400).json({ error: 'name, description, and website are required' });
        }

        const name = String(payload.name);
        const slug = payload.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existing = await University.findOne({ slug });
        if (existing) {
            return res.status(409).json({ error: 'University with this slug already exists' });
        }

        payload.slug = slug;
        const created = await new University(payload).save();
        await recordAudit(req, {
            action: 'university.created',
            resourceType: 'university',
            resourceId: String(created._id),
            resourceLabel: created.name,
        });
        res.status(201).json({ message: 'University created', university: serializeUniversity(created.toObject()) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/universities/:id
router.put('/admin/universities/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const payload = universityPayload(req.body || {});
        const updated = await University.findById(req.params.id);
        if (!updated) return res.status(404).json({ error: 'University not found' });

        const previousCover = updated.image;
        const previousGallery = [...(updated.galleryImages || [])];
        updated.set(payload);
        await updated.save();

        if (previousCover && previousCover !== updated.image) {
            const publicId = extractPublicIdFromUrl(previousCover);
            if (publicId) await deleteFromCloudinary(publicId);
        }
        const activeGallery = new Set(updated.galleryImages || []);
        for (const image of previousGallery) {
            if (!activeGallery.has(image)) {
                const publicId = extractPublicIdFromUrl(image);
                if (publicId) await deleteFromCloudinary(publicId);
            }
        }
        await recordAudit(req, {
            action: 'university.updated',
            resourceType: 'university',
            resourceId: String(updated._id),
            resourceLabel: updated.name,
        });
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
        await recordAudit(req, {
            action: 'university.cover_uploaded',
            resourceType: 'university',
            resourceId: String(university._id),
            resourceLabel: university.name,
        });

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

// POST /api/admin/universities/:id/gallery
router.post('/admin/universities/:id/gallery', requireAuth, requireAdmin, upload.array('images', 12), async (req: Request, res: Response) => {
    try {
        const files = (req.files as Express.Multer.File[] | undefined) || [];
        if (!files.length) return res.status(400).json({ error: 'Select at least one image' });

        const university = await University.findById(req.params.id);
        if (!university) return res.status(404).json({ error: 'University not found' });

        const uploaded: Awaited<ReturnType<typeof uploadBufferToCloudinary>>[] = [];
        try {
            for (const [index, file] of files.entries()) {
                uploaded.push(await uploadBufferToCloudinary(file.buffer, {
                publicId: `${university.slug}-gallery-${Date.now()}-${index + 1}`,
                folder: 'ethiouni-universities/gallery',
                }));
            }
        } catch (uploadError) {
            await Promise.all(uploaded.map((image) => deleteFromCloudinary(image.public_id)));
            throw uploadError;
        }
        const imageUrls = uploaded.map((image) => image.secure_url);
        university.galleryImages = [...(university.galleryImages || []), ...imageUrls];
        await university.save();
        await recordAudit(req, {
            action: 'university.gallery_uploaded',
            resourceType: 'university',
            resourceId: String(university._id),
            resourceLabel: university.name,
            details: { imageCount: imageUrls.length },
        });

        res.json({
            message: `${imageUrls.length} gallery image${imageUrls.length === 1 ? '' : 's'} uploaded`,
            images: imageUrls,
            university: serializeUniversity(university.toObject()),
        });
    } catch (err: any) {
        console.error('Gallery image upload error:', err);
        res.status(400).json({ error: err?.message || 'Failed to upload gallery images' });
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
        for (const image of university.galleryImages || []) {
            const publicId = extractPublicIdFromUrl(image);
            if (publicId) await deleteFromCloudinary(publicId);
        }

        await University.findByIdAndDelete(req.params.id);
        await recordAudit(req, {
            action: 'university.deleted',
            resourceType: 'university',
            resourceId: String(university._id),
            resourceLabel: university.name,
        });
        res.json({ message: 'University deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

