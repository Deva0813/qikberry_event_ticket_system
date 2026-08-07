import type { Request, Response, NextFunction } from 'express';

export function stripDangerous<T>(value: T): T {
  if (typeof value === 'string') {
    return value
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .trim() as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stripDangerous(item)) as unknown as T;
  }

  if (value !== null && typeof value === 'object') {
    const clean: Record<string, unknown> = {};
    
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = stripDangerous(val);
    }
    
    return clean as T;
  }

  return value;
}

export default function sanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body) {
    req.body = stripDangerous(req.body);
  }
  if (req.params) {
    req.params = stripDangerous(req.params);
  }
  if (req.query) {
    // Mutate keys in-place to avoid reassigning the read-only getter
    for (const key of Object.keys(req.query)) {
      req.query[key] = stripDangerous(req.query[key]);
    }
  }
  
  next();
}