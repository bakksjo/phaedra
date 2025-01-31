import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function zodErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      status: 422,
      message: 'Unprocessable Content',
      errors: err.errors
    });
  }
  next(err);
}
