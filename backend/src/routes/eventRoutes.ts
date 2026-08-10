import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { EventModel, EventType } from '../models/event.js';
import { EventCommentModel } from '../models/eventComment.js';
import { User } from '../models/user.js';
import { University } from '../models/university.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadBufferToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from '../services/cloudinary.js';
import { sanitizeText, isValidHttpUrl } from '../middleware/errorHandler.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed for event covers!'));
    }
  },
});

const VALID_EVENT_TYPES: EventType[] = [
  'course',
  'workshop',
  'university_event',
  'seminar',
  'conference',
  'other',
];

function serializeEvent(doc: any, currentUserId?: string) {
  const likesArr = Array.isArray(doc.likes) ? doc.likes.map((id: any) => String(id)) : [];
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description,
    eventType: doc.eventType,
    authorId: String(doc.author),
    authorName: doc.authorName || 'Anonymous',
    authorAvatar: doc.authorAvatar || '',
    universityId: doc.university ? String(doc.university) : null,
    universityName: doc.universityName || '',
    eventDate: doc.eventDate ? doc.eventDate.toISOString() : null,
    location: doc.location || '',
    link: doc.link || '',
    imageUrl: doc.imageUrl || '',
    imagePublicId: doc.imagePublicId || '',
    likesCount: doc.likesCount || likesArr.length,
    isLiked: currentUserId ? likesArr.includes(currentUserId) : false,
    commentsCount: doc.commentsCount || 0,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}

function serializeComment(doc: any) {
  return {
    id: String(doc._id),
    eventId: String(doc.event),
    authorId: String(doc.author),
    authorName: doc.authorName || 'Anonymous',
    authorAvatar: doc.authorAvatar || '',
    content: doc.content,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
  };
}

// GET /api/events - Retrieve events feed with optional filtering & search
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { eventType, universityId, search, page = '1', limit = '20' } = req.query;

    const queryFilter: any = {};

    if (eventType && typeof eventType === 'string' && VALID_EVENT_TYPES.includes(eventType as EventType)) {
      queryFilter.eventType = eventType;
    }

    if (universityId && typeof universityId === 'string' && mongoose.Types.ObjectId.isValid(universityId)) {
      queryFilter.university = universityId;
    }

    if (search && typeof search === 'string') {
      const sanitizedSearch = sanitizeText(search, 100);
      if (sanitizedSearch) {
        queryFilter.$or = [
          { title: { $regex: sanitizedSearch, $options: 'i' } },
          { description: { $regex: sanitizedSearch, $options: 'i' } },
          { location: { $regex: sanitizedSearch, $options: 'i' } },
          { universityName: { $regex: sanitizedSearch, $options: 'i' } },
        ];
      }
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      EventModel.find(queryFilter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      EventModel.countDocuments(queryFilter),
    ]);

    const currentUserId = req.user?.id;
    const serializedEvents = events.map((ev) => serializeEvent(ev, currentUserId));

    res.json({
      events: serializedEvents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// GET /api/events/:id - Get event details
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID format' });
    }

    const event = await EventModel.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: serializeEvent(event, req.user?.id) });
  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Failed to retrieve event details' });
  }
});

// POST /api/events - Create a new event (Auth required)
router.post('/events', requireAuth, (req: Request, res: Response) => {
  upload.single('image')(req, res, async (uploadErr) => {
    if (uploadErr) {
      return res.status(400).json({ error: uploadErr.message || 'Image upload error' });
    }

    try {
      const { title, description, eventType, universityId, universityName, eventDate, location, link } = req.body;

      const cleanTitle = sanitizeText(title, 200);
      const cleanDescription = sanitizeText(description, 3000);
      const cleanLocation = sanitizeText(location, 300);
      const cleanUniName = sanitizeText(universityName, 200);
      const cleanLink = typeof link === 'string' ? link.trim() : '';

      if (!cleanTitle) {
        return res.status(400).json({ error: 'Event title is required' });
      }
      if (!cleanDescription) {
        return res.status(400).json({ error: 'Event description is required' });
      }

      if (cleanLink && !isValidHttpUrl(cleanLink)) {
        return res.status(400).json({ error: 'Please provide a valid link URL starting with http:// or https://' });
      }

      const selectedType: EventType = VALID_EVENT_TYPES.includes(eventType as EventType)
        ? (eventType as EventType)
        : 'university_event';

      // Parse user details
      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(401).json({ error: 'User account not found' });
      }

      // Check optional university ID
      let uniObjId: mongoose.Types.ObjectId | undefined;
      let finalUniName = cleanUniName || user.institution || '';
      if (universityId && mongoose.Types.ObjectId.isValid(universityId)) {
        const uniDoc = await University.findById(universityId);
        if (uniDoc) {
          uniObjId = uniDoc._id as mongoose.Types.ObjectId;
          finalUniName = uniDoc.name;
        }
      }

      // Parse optional event date
      let parsedEventDate: Date | undefined;
      if (eventDate) {
        const parsed = new Date(eventDate);
        if (!isNaN(parsed.getTime())) {
          parsedEventDate = parsed;
        }
      }

      // Handle Image Upload if file is present
      let imageUrl = '';
      let imagePublicId = '';

      if (req.file) {
        try {
          if (!isCloudinaryConfigured()) {
            return res.status(400).json({
              error: 'Cloudinary storage is not configured on the server. Please contact system admin.',
            });
          }

          const uploadRes = await uploadBufferToCloudinary(req.file.buffer, {
            folder: 'ethiouni-events',
          });
          imageUrl = uploadRes.secure_url;
          imagePublicId = uploadRes.public_id;
        } catch (imgError: any) {
          console.error('Event cover upload failed:', imgError);
          return res.status(400).json({
            error: imgError?.message || 'Failed to upload event image to Cloudinary.',
          });
        }
      }

      const newEvent = new EventModel({
        title: cleanTitle,
        description: cleanDescription,
        eventType: selectedType,
        author: user._id,
        authorName: user.username,
        authorAvatar: user.avatarUrl || '',
        university: uniObjId,
        universityName: finalUniName,
        eventDate: parsedEventDate,
        location: cleanLocation,
        link: cleanLink,
        imageUrl,
        imagePublicId,
        likes: [],
        likesCount: 0,
        commentsCount: 0,
      });

      await newEvent.save();

      res.status(201).json({
        message: 'Event published successfully',
        event: serializeEvent(newEvent, String(user._id)),
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });
});

// DELETE /api/events/:id - Delete event (Author or Staff/Admin)
router.delete('/events/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await EventModel.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const isAuthor = String(event.author) === req.user!.id;
    const isStaffOrAdmin = ['admin', 'agent'].includes(req.user!.role);

    if (!isAuthor && !isStaffOrAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this event' });
    }

    // Delete image from Cloudinary if available
    if (event.imagePublicId) {
      await deleteFromCloudinary(event.imagePublicId);
    }

    // Delete associated comments
    await EventCommentModel.deleteMany({ event: event._id });
    await EventModel.findByIdAndDelete(id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/like - Toggle like on an event
router.post('/events/:id/like', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await EventModel.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const userIdStr = req.user!.id;
    const userObjId = new mongoose.Types.ObjectId(userIdStr);

    const existingIndex = event.likes.findIndex((l) => String(l) === userIdStr);
    let isLiked = false;

    if (existingIndex > -1) {
      // Remove like
      event.likes.splice(existingIndex, 1);
      event.likesCount = Math.max(0, event.likesCount - 1);
      isLiked = false;
    } else {
      // Add like
      event.likes.push(userObjId);
      event.likesCount += 1;
      isLiked = true;
    }

    await event.save();

    res.json({
      likesCount: event.likesCount,
      isLiked,
    });
  } catch (error) {
    console.error('Error toggling event like:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

// GET /api/events/:id/comments - Retrieve comments for an event (Chronological order)
router.get('/events/:id/comments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const comments = await EventCommentModel.find({ event: id }).sort({ createdAt: 1 });
    res.json({ comments: comments.map(serializeComment) });
  } catch (error) {
    console.error('Error fetching event comments:', error);
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
});

// POST /api/events/:id/comments - Post a new comment on an event (Auth required)
router.post('/events/:id/comments', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await EventModel.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const { content } = req.body;
    const cleanContent = sanitizeText(content, 1000);

    if (!cleanContent) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }

    const comment = new EventCommentModel({
      event: event._id,
      author: user._id,
      authorName: user.username,
      authorAvatar: user.avatarUrl || '',
      content: cleanContent,
    });

    await comment.save();

    // Increment event comments count
    event.commentsCount += 1;
    await event.save();

    res.status(201).json({
      message: 'Comment posted successfully',
      comment: serializeComment(comment),
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// DELETE /api/events/:id/comments/:commentId - Delete comment
router.delete('/events/:id/comments/:commentId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const comment = await EventCommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const event = await EventModel.findById(id);

    const isCommentAuthor = String(comment.author) === req.user!.id;
    const isEventAuthor = event ? String(event.author) === req.user!.id : false;
    const isStaffOrAdmin = ['admin', 'agent'].includes(req.user!.role);

    if (!isCommentAuthor && !isEventAuthor && !isStaffOrAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    await EventCommentModel.findByIdAndDelete(commentId);

    if (event) {
      event.commentsCount = Math.max(0, event.commentsCount - 1);
      await event.save();
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
