 
import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/error.ts';

export default (req:Request|any, res:Response, next:NextFunction) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
};
