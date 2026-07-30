import mongoose, { Document, Schema } from 'mongoose';

export interface IKnowledge extends Document {
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'website';
  documentId: string;
  category: string;
  sourceUrl?: string;
  originalFilename?: string;
  chunkIndex: number;
  chunkCount: number;
  contentLength: number;
  embedding: number[];
  uploadedAt: Date;
}

const KnowledgeSchema = new Schema<IKnowledge>({
  title: String,
  content: String,
  type: { type: String, enum: ['text', 'pdf', 'website'] },
  documentId: { type: String, required: true, index: true },
  category: { type: String, default: 'General', trim: true, index: true },
  sourceUrl: String,
  originalFilename: String,
  chunkIndex: { type: Number, default: 0 },
  chunkCount: { type: Number, default: 1 },
  contentLength: { type: Number, default: 0 },
  embedding: [Number],
  uploadedAt: { type: Date, default: Date.now }
}, { collection: 'knowledges' });

KnowledgeSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true, sparse: true });

// Collection must be 'knowledges' — create the vector index on this collection in Atlas
export const Knowledge = mongoose.model<IKnowledge>('Knowledge', KnowledgeSchema);
