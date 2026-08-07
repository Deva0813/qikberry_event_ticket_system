import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import ApiError from '../utils/error.ts';
import logger from '../utils/logger.ts';
import { nodeEnv } from '../config/env.ts';

interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode ?? 500;
  let message = err.message;

  if (!(err instanceof ApiError)) {
    // Unexpected/programmer error — never leak internals to the client in production
    statusCode = 500;
    message = nodeEnv === 'production' ? 'Something went wrong' : err.message;
  }

  logger.error(message, {
    path: req.originalUrl,
    method: req.method,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details !== undefined ? { details: err.details } : {}),
    ...(nodeEnv !== 'production' && err.stack ? { stack: err.stack } : {}),
  });
};

export default errorHandler;