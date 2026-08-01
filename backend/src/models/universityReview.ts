import mongoose, { Document, Schema } from 'mongoose';

export interface IUniversityReview extends Document {
  universitySlug: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const UniversityReviewSchema = new Schema<IUniversityReview>(
  {
    universitySlug: { type: String, required: true, index: true, lowercase: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: 'university_reviews' }
);

export const UniversityReview = mongoose.model<IUniversityReview>(
  'UniversityReview',
  UniversityReviewSchema
);
