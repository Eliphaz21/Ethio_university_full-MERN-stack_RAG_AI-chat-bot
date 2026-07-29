import mongoose, { Document, Schema } from 'mongoose';

export interface IKnowledge extends Document {
  title: string;
  content: string;
  type: 'text' | 'pdf' | 'website';
  embedding: number[];
  uploadedAt: Date;
}

const KnowledgeSchema = new Schema<IKnowledge>({
  title: String,
  content: String,
  type: { type: String, enum: ['text', 'pdf', 'website'] },
  embedding: [Number],
  uploadedAt: { type: Date, default: Date.now }
}, { collection: 'knowledges' });

// Collection must be 'knowledges' — create the vector index on this collection in Atlas
export const Knowledge = mongoose.model<IKnowledge>('Knowledge', KnowledgeSchema);