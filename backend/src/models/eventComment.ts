import mongoose, { Document, Schema } from 'mongoose';

export interface IEventComment extends Document {
  event: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
}

const EventCommentSchema = new Schema<IEventComment>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true, trim: true },
    authorAvatar: { type: String, default: '' },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

EventCommentSchema.index({ event: 1, createdAt: 1 });

export const EventCommentModel = mongoose.model<IEventComment>('EventComment', EventCommentSchema);
