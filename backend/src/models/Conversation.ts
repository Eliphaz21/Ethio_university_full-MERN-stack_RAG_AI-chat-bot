import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: string;
  messages: IMessage[];
  lastUpdated: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'] },
  content: String,
  timestamp: { type: Date, default: Date.now }
});

const ConversationSchema = new Schema<IConversation>({
  userId: { type: String, required: true },
  messages: [MessageSchema],
  lastUpdated: { type: Date, default: Date.now }
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);