import type { Request } from 'express';
import { AuditLog } from '../models/auditLog.js';
import { User } from '../models/user.js';

interface AuditEvent {
  action: string;
  resourceType: string;
  resourceId?: string;
  resourceLabel?: string;
  status?: 'success' | 'failure';
  details?: Record<string, unknown>;
}

export async function recordAudit(req: Request, event: AuditEvent): Promise<void> {
  try {
    const actor = req.user?.id
      ? await User.findById(req.user.id).select('email').lean()
      : null;

    await AuditLog.create({
      actorId: req.user?.id,
      actorEmail: actor?.email,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      resourceLabel: event.resourceLabel,
      status: event.status || 'success',
      details: event.details,
      ipAddress: req.ip || req.socket.remoteAddress,
    });
  } catch (error) {
    // Auditing must never break the action being recorded.
    console.error('Audit log write failed:', error);
  }
}
