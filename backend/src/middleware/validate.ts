import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateRequest(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issueMessages = error.issues.map(
          (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`
        );
        return res.status(400).json({
          error: 'Validation failed',
          details: issueMessages,
        });
      }
      return res.status(400).json({ error: 'Invalid request payload' });
    }
  };
}
