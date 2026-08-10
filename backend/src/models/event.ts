import mongoose, { Document, Schema } from 'mongoose';

export type EventType = 'course' | 'workshop' | 'university_event' | 'seminar' | 'conference' | 'other';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: EventType;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  university?: mongoose.Types.ObjectId;
  universityName?: string;
  eventDate?: Date;
  location?: string;
  link?: string;
  imageUrl?: string;
  imagePublicId?: string;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    eventType: {
      type: String,
      enum: ['course', 'workshop', 'university_event', 'seminar', 'conference', 'other'],
      default: 'university_event',
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    authorAvatar: { type: String, default: '' },
    university: { type: Schema.Types.ObjectId, ref: 'University', index: true },
    universityName: { type: String, default: '', trim: true },
    eventDate: { type: Date },
    location: { type: String, default: '', trim: true, maxlength: 300 },
    link: { type: String, default: '', trim: true, maxlength: 1000 },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ createdAt: -1 });
EventSchema.index({ eventType: 1, createdAt: -1 });

export const EventModel = mongoose.model<IEvent>('Event', EventSchema);
