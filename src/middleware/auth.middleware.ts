import jwt from 'jsonwebtoken';

import type { NextFunction, Request, Response } from 'express';
import { jwtSecret } from '../config/env.ts';
import type { User } from '../generated/mysql-client/index.js';
import catchAsync from '../utils/catchAsync.ts';
import ApiError from '../utils/error.ts';


export default catchAsync(async (req: Request & { user: Partial<User> }, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication token missing');
  }

  const token = header.split(' ')[1];

  try {
    const payload: any = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});
