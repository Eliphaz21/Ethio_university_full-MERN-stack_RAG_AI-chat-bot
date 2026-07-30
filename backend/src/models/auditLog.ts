import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceLabel?: string;
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  actorEmail: { type: String, trim: true },
  action: { type: String, required: true, trim: true, index: true },
  resourceType: { type: String, required: true, trim: true, index: true },
  resourceId: { type: String, trim: true },
  resourceLabel: { type: String, trim: true },
  status: { type: String, enum: ['success', 'failure'], default: 'success', index: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now, index: true },
}, { collection: 'audit_logs', versionKey: false });

AuditLogSchema.index({ createdAt: -1, resourceType: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
